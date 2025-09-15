# Data Models

Based on your PRD requirements, I'm defining the core data models that will be shared between the Electron main process and Angular renderer:

## BMadProject

**Purpose:** Represents a detected BMad project with its metadata and current state

**Key Attributes:**
- id: string - Unique identifier derived from project path
- name: string - Project name (directory name)
- path: string - Absolute path to project directory
- lastAccessed: Date - When project was last opened
- agents: BMadAgent[] - Available agents discovered in project

### TypeScript Interface
```typescript
interface BMadProject {
  id: string;
  name: string;
  path: string;
  lastAccessed: Date;
  agents: BMadAgent[];
  isActive: boolean;
}
```

### Relationships
- Has many BMadAgent
- Has many Conversation
- Has one ProjectContext

## BMadAgent

**Purpose:** Represents an available BMad agent within a project context

**Key Attributes:**
- id: string - Unique agent identifier
- name: string - Human-readable agent name
- type: AgentType - Category (task, workflow, specialist)
- description: string - Agent capabilities description
- projectId: string - Parent project reference

### TypeScript Interface
```typescript
interface BMadAgent {
  id: string;
  name: string;
  type: 'task' | 'workflow' | 'specialist';
  description?: string;
  projectId: string;
  lastUsed?: Date;
}
```

### Relationships
- Belongs to BMadProject
- Can be referenced by Message

## Conversation

**Purpose:** Represents a chat conversation within a project context with persistence

**Key Attributes:**
- id: string - Unique conversation identifier
- projectId: string - Associated project
- title: string - Conversation title (auto-generated)
- createdAt: Date - Conversation start time
- updatedAt: Date - Last message time
- messages: Message[] - All messages in conversation

### TypeScript Interface
```typescript
interface Conversation {
  id: string;
  projectId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messages: Message[];
  retentionDate?: Date;
}
```

### Relationships
- Belongs to BMadProject
- Has many Message
- Subject to RetentionPolicy

## Message

**Purpose:** Individual chat messages with rich content and metadata

**Key Attributes:**
- id: string - Unique message identifier
- conversationId: string - Parent conversation
- type: MessageType - User, AI, system, command output
- content: string - Message text content
- timestamp: Date - Message creation time
- metadata: MessageMetadata - Additional structured data

### TypeScript Interface
```typescript
interface Message {
  id: string;
  conversationId: string;
  type: 'user' | 'ai' | 'system' | 'command-output' | 'error';
  content: string;
  timestamp: Date;
  metadata?: {
    agentId?: string;
    commandExitCode?: number;
    isStreaming?: boolean;
    executionTime?: number;
  };
}
```

### Relationships
- Belongs to Conversation
- May reference BMadAgent

## CommandExecution

**Purpose:** Tracks BMad command execution state and results

**Key Attributes:**
- id: string - Unique execution identifier
- messageId: string - Associated message
- command: string - Executed command
- status: ExecutionStatus - Current execution state
- output: string - Command output (stdout/stderr)
- exitCode: number - Process exit code

### TypeScript Interface
```typescript
interface CommandExecution {
  id: string;
  messageId: string;
  command: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  output?: string;
  error?: string;
  exitCode?: number;
  startTime: Date;
  endTime?: Date;
}
```

### Relationships
- Belongs to Message
- Tracked by ExecutionService
