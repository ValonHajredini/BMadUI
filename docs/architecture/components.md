# Components

Based on the architectural patterns, tech stack choices, and data models, here are the major logical components across the BMad GUI fullstack:

## ProjectScanner

**Responsibility:** Automatically discover BMad projects by scanning file system for `.bmad-core/` directories and extracting project metadata

**Key Interfaces:**
- `scanForProjects(paths: string[]): Promise<BMadProject[]>`
- `watchProjectChanges(): Observable<ProjectChange>`

**Dependencies:** File System API, BMadAgentDiscovery

**Technology Stack:** Node.js file system APIs in Electron main process, with recursive directory scanning and file watching capabilities

## BMadAgentDiscovery

**Responsibility:** Discover available agents within projects by scanning `agents/`, `tasks/`, and `workflow/` directories

**Key Interfaces:**
- `discoverAgents(projectPath: string): Promise<BMadAgent[]>`
- `getAgentMetadata(agentPath: string): Promise<AgentMetadata>`

**Dependencies:** File System API, ProjectScanner

**Technology Stack:** Node.js file parsing with YAML/JSON metadata extraction for agent definitions

## CommandExecutor

**Responsibility:** Execute BMad CLI commands in proper working directory context with real-time output streaming

**Key Interfaces:**
- `executeCommand(command: string, projectPath: string): Promise<CommandExecution>`
- `streamOutput(): Observable<CommandOutput>`
- `cancelExecution(executionId: string): void`

**Dependencies:** Node.js child_process, ProjectContext

**Technology Stack:** Node.js child_process.spawn with stdio streaming, process management, and cross-platform command handling

## ConversationManager

**Responsibility:** Handle SQLite conversation persistence, message storage, and retention policy enforcement

**Key Interfaces:**
- `saveMessage(message: Message): Promise<string>`
- `loadConversation(conversationId: string): Promise<Conversation>`
- `searchMessages(query: SearchQuery): Promise<SearchResults>`

**Dependencies:** SQLite database, RetentionPolicyService

**Technology Stack:** SQLite with node-sqlite3 binding, prepared statements, and full-text search capabilities

## ChatInterface

**Responsibility:** Angular component managing the message bubble UI, user input, and real-time message display

**Key Interfaces:**
- `sendMessage(content: string): void`
- `displayMessage(message: Message): void`
- `handleCommandOutput(output: CommandOutput): void`

**Dependencies:** MessageService, CommandService, Angular Material

**Technology Stack:** Angular 20+ standalone component with signals, @defer blocks for message virtualization, Angular Material for UI components

## ProjectNavigation

**Responsibility:** Left sidebar component for project selection, agent discovery, and navigation state management

**Key Interfaces:**
- `loadProjects(): void`
- `selectProject(projectId: string): void`
- `displayAgents(agents: BMadAgent[]): void`

**Dependencies:** ProjectService, AgentService, Router

**Technology Stack:** Angular standalone component with Angular Material navigation components and reactive signals

## IPCBridge

**Responsibility:** Facilitate secure communication between Angular renderer and Electron main process

**Key Interfaces:**
- `invoke<T>(channel: string, data: any): Promise<T>`
- `on<T>(channel: string, handler: (data: T) => void): void`
- `send(channel: string, data: any): void`

**Dependencies:** Electron IPC, Angular services

**Technology Stack:** Electron contextBridge API with type-safe IPC wrapper and Angular service integration

## RetentionPolicyService

**Responsibility:** Enforce conversation retention policies and manage database cleanup operations

**Key Interfaces:**
- `enforceRetention(projectId: string): Promise<void>`
- `markForDeletion(conversationId: string): void`
- `scheduleCleanup(): void`

**Dependencies:** ConversationManager, SettingsService

**Technology Stack:** Node.js scheduling with cron-like functionality, SQLite batch operations for efficient cleanup
