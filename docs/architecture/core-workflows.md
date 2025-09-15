# Core Workflows

## Project Discovery and Selection Workflow

```mermaid
sequenceDiagram
    participant U as User
    participant R as Angular Renderer
    participant M as Electron Main
    participant FS as File System
    participant DB as SQLite DB

    U->>R: Launch Application
    R->>M: project:scan
    M->>FS: Scan common directories
    FS-->>M: .bmad-core/ paths found
    M->>FS: Extract project metadata
    M->>M: Discover agents per project
    M-->>R: BMadProject[]
    R->>R: Display project list

    U->>R: Select project
    R->>M: project:select {projectId}
    M->>DB: Load conversation history
    M->>FS: Verify project still exists
    M-->>R: Project context + conversation
    R->>R: Update UI with project context
```

## Command Execution and Real-time Output

```mermaid
sequenceDiagram
    participant U as User
    participant CI as ChatInterface
    participant M as Electron Main
    participant CE as CommandExecutor
    participant BMAD as BMad CLI

    U->>CI: Type command and send
    CI->>CI: Display user message
    CI->>M: command:execute {command, projectId}
    M->>CE: Spawn BMad process
    CE->>BMAD: Execute command in project directory
    M-->>CI: {executionId}
    CI->>CI: Show "executing" indicator

    loop Real-time output
        BMAD-->>CE: stdout/stderr data
        CE->>M: Stream output
        M->>CI: command:output event
        CI->>CI: Append output to chat
    end

    BMAD-->>CE: Process exit
    CE->>M: Execution complete
    M->>CI: command:output {type: 'exit', exitCode}
    CI->>CI: Show completion status
    CI->>M: conversation:save-message
    M->>DB: Persist conversation
```

## Agent Discovery and Switching

```mermaid
sequenceDiagram
    participant U as User
    participant PN as ProjectNavigation
    participant M as Electron Main
    participant AD as AgentDiscovery
    participant CI as ChatInterface

    U->>PN: Select project
    PN->>M: project:get-agents {projectId}
    M->>AD: Scan agents/ tasks/ workflow/
    AD->>AD: Parse agent metadata
    M-->>PN: BMadAgent[]
    PN->>PN: Display agent list

    U->>PN: Click agent
    PN->>CI: Switch agent context
    CI->>M: Initialize agent session
    M->>M: Set agent context
    CI->>CI: Display agent greeting
    CI->>CI: Update command suggestions
```

## Conversation Persistence and History

```mermaid
sequenceDiagram
    participant U as User
    participant CI as ChatInterface
    participant M as Electron Main
    participant CM as ConversationManager
    participant DB as SQLite DB

    U->>CI: Send message
    CI->>M: conversation:save-message
    M->>CM: Store message with metadata
    CM->>DB: INSERT message
    DB-->>CM: Message ID

    Note over M,DB: Background retention policy
    M->>CM: Schedule retention check
    CM->>DB: DELETE expired conversations

    U->>CI: Search conversations
    CI->>M: conversation:search {query}
    M->>DB: Full-text search
    DB-->>M: Search results
    M-->>CI: Formatted results
    CI->>CI: Highlight search results
```

## Error Handling and Recovery

```mermaid
sequenceDiagram
    participant U as User
    participant CI as ChatInterface
    participant M as Electron Main
    participant CE as CommandExecutor

    U->>CI: Execute invalid command
    CI->>M: command:execute {invalid_command}
    M->>CE: Attempt execution
    CE-->>M: Error (command not found)
    M->>CI: command:output {type: 'error'}
    CI->>CI: Display error message
    CI->>CI: Suggest corrections

    alt BMad not installed
        M->>CI: System error
        CI->>CI: Show installation guide
    else Permission denied
        M->>CI: Permission error
        CI->>CI: Show permission fix steps
    else Working directory issue
        M->>M: Verify project path
        M->>CI: Path error
        CI->>CI: Offer project re-scan
    end
```
