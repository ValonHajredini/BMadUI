# Database Schema

Transforming the conceptual data models into concrete SQLite database schemas for per-project conversation storage:

```sql
-- SQLite Schema for BMad GUI Conversation Database
-- Each project gets its own .bmad-gui/conversations.db

-- Projects table (minimal, mostly for referential integrity)
CREATE TABLE projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    path TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_accessed DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Conversations table
CREATE TABLE conversations (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    title TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    retention_date DATETIME,
    is_pinned BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Messages table with full-text search capability
CREATE TABLE messages (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('user', 'ai', 'system', 'command-output', 'error')),
    content TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    agent_id TEXT,
    command_exit_code INTEGER,
    is_streaming BOOLEAN DEFAULT FALSE,
    execution_time_ms INTEGER,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);

-- Command executions table for detailed tracking
CREATE TABLE command_executions (
    id TEXT PRIMARY KEY,
    message_id TEXT NOT NULL,
    command TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
    output TEXT,
    error TEXT,
    exit_code INTEGER,
    start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    end_time DATETIME,
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE
);

-- Agents discovered in project (cached for performance)
CREATE TABLE agents (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('task', 'workflow', 'specialist')),
    description TEXT,
    file_path TEXT NOT NULL,
    last_used DATETIME,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Settings/preferences per project
CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance optimization
CREATE INDEX idx_messages_conversation_timestamp ON messages(conversation_id, timestamp DESC);
CREATE INDEX idx_messages_type ON messages(type);
CREATE INDEX idx_conversations_updated ON conversations(updated_at DESC);
CREATE INDEX idx_conversations_retention ON conversations(retention_date);
CREATE INDEX idx_executions_status ON command_executions(status);
CREATE INDEX idx_agents_project ON agents(project_id);
CREATE INDEX idx_agents_last_used ON agents(last_used DESC);

-- Full-text search virtual table for message content
CREATE VIRTUAL TABLE messages_fts USING fts5(
    content,
    content='messages',
    content_rowid='rowid'
);

-- Triggers to maintain FTS index
CREATE TRIGGER messages_fts_insert AFTER INSERT ON messages BEGIN
    INSERT INTO messages_fts(rowid, content) VALUES (new.rowid, new.content);
END;

CREATE TRIGGER messages_fts_update AFTER UPDATE ON messages BEGIN
    UPDATE messages_fts SET content = new.content WHERE rowid = new.rowid;
END;

CREATE TRIGGER messages_fts_delete AFTER DELETE ON messages BEGIN
    DELETE FROM messages_fts WHERE rowid = old.rowid;
END;

-- Views for common queries
CREATE VIEW conversation_summary AS
SELECT
    c.id,
    c.title,
    c.created_at,
    c.updated_at,
    COUNT(m.id) as message_count,
    MAX(m.timestamp) as last_message_time
FROM conversations c
LEFT JOIN messages m ON c.id = m.conversation_id
GROUP BY c.id, c.title, c.created_at, c.updated_at;

CREATE VIEW recent_agents AS
SELECT
    a.*,
    COUNT(m.id) as usage_count
FROM agents a
LEFT JOIN messages m ON a.id = m.agent_id
GROUP BY a.id
ORDER BY a.last_used DESC, usage_count DESC;

-- Sample data migration script for initial setup
INSERT INTO settings (key, value) VALUES
    ('retention_days', '7'),
    ('max_conversation_count', '1000'),
    ('theme_preference', 'system'),
    ('schema_version', '1.0');
```

**Key Design Decisions:**
- **Per-project isolation**: Each project maintains its own SQLite database file
- **Full-text search**: FTS5 virtual table enables efficient conversation search
- **Retention management**: Built-in retention_date field for automated cleanup
- **Performance indexing**: Optimized for common queries (recent conversations, message history)
- **Command tracking**: Detailed execution tracking for debugging and analytics
- **Agent caching**: Local cache of discovered agents to avoid repeated file system scans

**Schema Evolution Strategy:**
- `schema_version` setting enables future migrations
- Add migration scripts for schema updates as new features are added
- Backward compatibility maintained through versioned migration system
