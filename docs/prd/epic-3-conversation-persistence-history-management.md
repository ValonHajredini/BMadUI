# Epic 3: Conversation Persistence & History Management

**Epic Goal:** Implement persistent conversation storage and intelligent history management to deliver the context continuity that differentiates BMad GUI from web-based AI chat tools. This epic ensures that developers can maintain project context across sessions while providing the local-first privacy guarantee that addresses core user concerns about data locality and conversation security.

## Story 3.1: SQLite Database Integration & Schema Design

As a developer,
I want conversation data stored locally in SQLite databases per project,
so that conversations persist reliably without external dependencies while maintaining project isolation.

### Acceptance Criteria
1. SQLite database is automatically created for each BMad project in a `.bmad-gui/` directory within the project
2. Database schema supports conversation threads, messages, timestamps, and metadata storage
3. Database initialization handles schema migration and versioning for future updates
4. Per-project isolation ensures conversation data never leaks between different BMad projects
5. Database operations are wrapped in appropriate error handling with fallback behaviors
6. Database file permissions are set appropriately to maintain security on multi-user systems
7. Database corruption detection and recovery mechanisms are implemented for data integrity

## Story 3.2: Conversation Persistence During Sessions

As a BMad user,
I want my conversations automatically saved as I work,
so that I never lose context due to application crashes or unexpected interruptions.

### Acceptance Criteria
1. Messages are saved to SQLite immediately upon sending or receiving without user intervention
2. Conversation state persists automatically during BMad command execution and agent interactions
3. Application recovery restores the exact conversation state after unexpected shutdown or crash
4. Message metadata (timestamps, agent types, command results) is preserved accurately
5. Large command outputs are stored efficiently without degrading database performance
6. Conversation threading maintains logical flow and context relationships between messages
7. Auto-save operations occur without blocking the user interface or conversation flow

## Story 3.3: Retention Policy Management

As a BMad user,
I want configurable conversation retention policies with a sensible 1-week default,
so that my local storage remains manageable while preserving important project context.

### Acceptance Criteria
1. Default 1-week retention policy automatically removes conversations older than 7 days
2. Retention settings are configurable per project through a simple preferences interface
3. Retention options include: 1 day, 1 week, 1 month, 3 months, unlimited, and custom timeframes
4. Retention cleanup runs automatically in the background without impacting performance
5. Important conversations can be marked for permanent retention regardless of policy settings
6. Retention policy enforcement provides clear notifications before deleting conversations
7. Deleted conversations can be recovered for 24 hours through a "trash" mechanism

## Story 3.4: Conversation Search & Filtering

As a BMad user,
I want to search and filter my conversation history within projects,
so that I can quickly find previous discussions, commands, and solutions without scrolling through entire conversation logs.

### Acceptance Criteria
1. Full-text search across conversation content returns relevant results with context highlighting
2. Search results display message snippets with enough context to understand relevance
3. Filter options include date ranges, agent types, command success/failure status, and message types
4. Search performance remains responsive even with large conversation histories (>1000 messages)
5. Search and filter combinations work together for precise result refinement
6. Search suggestions and auto-complete help users find content more efficiently
7. Recent searches are remembered for quick re-access to common search patterns

## Story 3.5: Cross-Session Context Restoration

As a BMad user,
I want my conversation context automatically restored when I return to a project,
so that I can continue working exactly where I left off without losing mental context.

### Acceptance Criteria
1. Application automatically loads the most recent conversation when selecting a project
2. Conversation scroll position is restored to the last viewed message for seamless continuation
3. Active agent context and state information are preserved across sessions when possible
4. Input field maintains draft messages that were being composed during previous session
5. Project-specific settings and preferences are restored accurately
6. Context restoration completes quickly (<2 seconds) without blocking project access
7. Manual conversation navigation allows users to jump to different time periods within project history
