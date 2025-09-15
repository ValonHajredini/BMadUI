# BMad GUI Application Product Requirements Document (PRD)

## Goals and Background Context

### Goals
- Transform BMad from powerful CLI system into accessible conversational development partner
- Eliminate workflow fragmentation and context switching between terminal and web-based AI chats
- Accelerate BMad adoption by 50% within 12 months by reducing CLI learning curve barriers
- Reduce average idea-to-execution cycle time by 30% for users adopting BMad GUI
- Establish privacy leadership position as premier local-first AI development interface
- Achieve 1,000+ active monthly users across both user segments within first year

### Background Context

BMad GUI addresses the critical workflow fragmentation that BMad users currently experience when switching between CLI tools and web-based AI chat interfaces. This fragmentation creates cognitive load exhaustion, context loss, and time inefficiency that consumes developers' "gold time" for innovation. The application leverages a familiar Slack-inspired interface to bridge CLI power with conversational natural interaction, while maintaining complete local privacy through a local-first architecture that ensures all data stays on the user's machine.

The competitive landscape demands faster innovation cycles, making this solution essential for preserving competitive advantage through reduced context switching and sustained developer focus during AI-assisted development workflows.

### Change Log

| Date | Version | Description | Author |
|------|---------|-------------|---------|
| 2025-09-15 | 1.0 | Initial PRD creation from comprehensive project brief | John (PM) |

## Requirements

### Functional Requirements

**FR1:** The application shall automatically scan and detect BMad projects by identifying `.bmad-core/` directories in the file system
**FR2:** The application shall present available BMad projects in a clean, navigable interface within the left sidebar
**FR3:** The application shall discover and display available agents through scanning `agents/`, `tasks/`, and `workflow/` directories
**FR4:** The application shall provide a chat-style message interface with user messages aligned right and AI responses aligned left
**FR5:** The application shall execute BMad commands in the correct working directory context while preserving full CLI functionality
**FR6:** The application shall capture and display command output in real-time within the chat conversation flow
**FR7:** The application shall handle error states gracefully with clear user feedback and recovery options
**FR8:** The application shall store conversation history per-project using SQLite databases with configurable retention policies
**FR9:** The application shall provide conversation search and filtering capabilities within project contexts
**FR10:** The application shall maintain persistent conversation history with 1-week default retention
**FR11:** The application shall support natural language interaction for all BMad agent communications
**FR12:** The application shall provide a collapsible right panel for command reference and project context information

### Non-Functional Requirements

**NFR1:** Application startup time shall be less than 3 seconds on target platforms (Windows 10+, macOS 10.14+, Linux Ubuntu 18.04+)
**NFR2:** Message response latency shall be less than 500ms for command execution initiation
**NFR3:** Memory usage shall remain under 200MB baseline and under 500MB with large conversation histories
**NFR4:** All conversation data shall be stored locally with zero external API calls for core functionality
**NFR5:** The application shall maintain smooth UI performance during conversation scrolling and agent switching
**NFR6:** Cross-platform compatibility shall be maintained across Windows, macOS, and Linux without functional degradation
**NFR7:** SQLite database performance shall handle typical conversation history sizes without noticeable latency
**NFR8:** The application shall provide complete offline capability with no cloud dependencies
**NFR9:** Working directory context shall be preserved universally for all BMad command compatibility
**NFR10:** Conversation storage shall be isolated per-project to prevent data leakage between projects

## User Interface Design Goals

### Overall UX Vision
Create a familiar, low-friction conversational development environment that eliminates the cognitive load of context switching. The interface should feel immediately intuitive to developers already familiar with Slack or similar chat applications, while seamlessly integrating powerful CLI functionality through natural conversation patterns. The design prioritizes developer productivity by reducing interface management overhead and preserving mental energy for creative work.

### Key Interaction Paradigms
- **Conversational-first interaction:** All BMad agent communication flows through natural chat interface rather than command memorization
- **Context-aware navigation:** Left sidebar provides project and agent discovery without disrupting conversation flow
- **Progressive disclosure:** Right panel offers command reference and project context on-demand without cluttering main workspace
- **Persistent conversation threading:** Each project maintains isolated conversation history enabling seamless context continuation across sessions

### Core Screens and Views
- **Project Discovery Screen:** Initial landing showing detected BMad projects with quick access patterns
- **Main Chat Interface:** Primary workspace with three-panel layout (navigation, conversation, context)
- **Agent Selection View:** Interface for discovering and switching between available BMad agents
- **Conversation History Browser:** Search and filter interface for accessing past project conversations
- **Settings and Preferences:** Configuration for retention policies, display preferences, and privacy controls

### Accessibility: WCAG AA
The application shall meet WCAG AA standards to ensure accessibility for developers with various needs, including keyboard navigation, screen reader compatibility, and appropriate color contrast ratios for extended development sessions.

### Branding
Clean, developer-focused aesthetic emphasizing clarity and reduced visual noise. Interface should feel professional yet approachable, avoiding both clinical sterility and excessive visual flourish. Typography and spacing optimized for extended reading during long development sessions, with subtle visual cues that reinforce the local-first privacy positioning.

### Target Device and Platforms: Cross-Platform Desktop
Native desktop application for Windows 10+, macOS 10.14+, and Linux (Ubuntu 18.04+) using Electron framework. Interface designed for desktop interaction patterns with mouse and keyboard, optimized for multiple monitor setups common in developer environments.

## Technical Assumptions

### Repository Structure: Monorepo
Single repository containing the complete desktop application with clear separation between UI components, services, and BMad integration layers. This approach aligns with the single developer resource and rapid MVP delivery timeline while enabling future modular development.

### Service Architecture
**Desktop Application Monolith with Modular Services:** Electron-based desktop application containing distinct service modules:
- BMad Detection Service: File system scanning for `.bmad-core/` directories
- Command Execution Service: Process spawning with working directory context preservation
- Conversation Management Service: SQLite operations with retention policy enforcement
- Project Management Service: Multi-project state handling and navigation
- UI State Management Service: Angular signals-based reactive state coordination

**Rationale:** Monolithic approach reduces complexity for single developer while modular services enable future extraction if needed.

### Testing Requirements
**Unit + Integration Testing:** Comprehensive testing strategy including:
- Unit tests for service modules and UI components using Angular testing framework
- Integration tests for BMad CLI interaction and SQLite operations
- Cross-platform compatibility testing for file system and process management
- Manual testing convenience methods for UI interaction patterns
- No automated E2E testing in MVP to preserve development timeline

**Rationale:** Balances quality assurance with aggressive 2-4 week timeline; focuses testing effort on critical integration points.

### Additional Technical Assumptions and Requests

**Frontend Technology Stack:**
- **Angular 20+** with standalone components, signals, and @defer blocks for modern reactive architecture
- **TypeScript** for type safety and development efficiency
- **Angular Material** or similar component library for consistent UI patterns
- **RxJS** for reactive command execution and conversation updates

**Backend/Runtime Environment:**
- **Node.js** runtime for Electron main process and service coordination
- **Electron** for cross-platform native app packaging and distribution
- **Child Process Management** for BMad command execution with stdout/stderr capture

**Data Storage:**
- **SQLite** per-project conversation storage with automatic database creation
- **File system APIs** for project detection and BMad integration
- **Local configuration storage** for user preferences and retention policies

**Development and Build Tools:**
- **Angular CLI** for project scaffolding and build optimization
- **Electron Builder** for cross-platform application packaging
- **TypeScript compiler** with strict configuration for code quality
- **Webpack** integration through Angular CLI for bundle optimization

**Security and Privacy:**
- **No network requests** for core functionality ensuring complete offline capability
- **Sandboxed command execution** to prevent system compromise while maintaining BMad functionality
- **Local data encryption** (future enhancement) for conversation storage
- **File system permission handling** for restrictive environments

**Performance Constraints:**
- **Memory management** strategies for large conversation histories
- **Lazy loading** for conversation data and UI components using @defer blocks
- **Background process optimization** for BMad command execution
- **SQLite indexing** for conversation search performance

## Epic List

**Epic 1: Foundation & Project Discovery**
Establish core application infrastructure with Electron + Angular setup, implement BMad project detection through `.bmad-core/` scanning, and deliver initial project selection interface with basic navigation.

**Epic 2: Conversational Interface & Command Execution**
Create the chat-style interface with message bubbles, implement rich message formatting, establish BMad command execution with working directory context, and provide real-time command output display within conversation flow.

**Epic 3: Conversation Persistence & History Management**
Integrate SQLite conversation storage per-project, implement 1-week retention policies, and provide conversation search and filtering capabilities for maintaining project context.

**Epic 4: Agent Discovery & Enhanced UX**
Implement comprehensive agent discovery and navigation, add advanced command execution features, provide context panels and command references, and deliver production-ready user experience polish and accessibility.

## Epic 1: Foundation & Project Discovery

**Epic Goal:** Establish the foundational Electron + Angular application infrastructure while delivering immediate user value through automatic BMad project detection and navigation. This epic creates the technical foundation required for all subsequent development while proving the core concept of seamless BMad project discovery to users.

### Story 1.1: Application Bootstrap & Development Environment

As a developer,
I want a properly configured Electron + Angular 20 application with TypeScript,
so that I have a solid foundation for building the BMad GUI with modern reactive patterns.

#### Acceptance Criteria
1. Electron application successfully launches and displays basic Angular interface on Windows, macOS, and Linux
2. Angular 20+ standalone components architecture is configured with signals and TypeScript strict mode
3. Application window opens with appropriate sizing (1200x800 minimum) and basic menu structure
4. Development build process works correctly with hot reload for efficient iteration
5. Basic error handling displays meaningful messages rather than crashing the application
6. Application icon and basic branding elements are present and display correctly

### Story 1.2: File System Project Scanner

As a BMad user,
I want the application to automatically discover my BMad projects by scanning for `.bmad-core/` directories,
so that I can quickly access my projects without manual configuration.

#### Acceptance Criteria
1. Application scans common development directories (~/Projects, ~/Code, ~/Development) for `.bmad-core/` folders
2. Detected projects display project name derived from parent directory name
3. Scanning completes within 5 seconds for typical development directory structures
4. Application handles permission errors gracefully when accessing restricted directories
5. Scan results update when new projects are created or existing projects are moved
6. Empty scan results display helpful messaging suggesting project creation or manual path addition

### Story 1.3: Project List Interface

As a BMad user,
I want to see my discovered projects in a clean, navigable list,
so that I can select and work with specific BMad projects.

#### Acceptance Criteria
1. Left sidebar displays discovered projects in a scrollable list with clear project names
2. Project list shows basic metadata (path, last accessed) when available
3. Interface handles both single and multiple project scenarios gracefully
4. Project list refreshes automatically when file system changes are detected
5. Basic project selection highlighting works without navigation behavior
6. Project list component is self-contained and ready for navigation integration

### Story 1.4a: Basic Three-Panel Layout Structure

As a developer using BMad GUI,
I want the foundational three-panel layout structure established,
so that future features integrate consistently within the planned interface.

#### Acceptance Criteria
1. Application displays left sidebar, center panel, and collapsible right panel structure
2. Panel containers are properly sized with placeholder content
3. Panel resizing works smoothly with appropriate minimum and maximum widths
4. Layout adapts appropriately to different window sizes while maintaining usability
5. Right panel collapses and expands with smooth animation and state persistence
6. Basic keyboard shortcuts (Ctrl/Cmd+1,2,3) switch focus between panels for accessibility

### Story 1.4b: Project Navigation Integration

As a BMad user,
I want project selection to update the application context,
so that I can work within specific BMad projects seamlessly.

#### Acceptance Criteria
1. Project selection from the list updates the center panel to show selected project context
2. Selected project state is clearly indicated in the project list
3. Project switching updates the entire interface context appropriately
4. Selected project persists across application restarts for improved workflow continuity
5. Navigation between projects maintains layout state and panel preferences
6. Error states display gracefully when project context cannot be loaded

### Story 1.5: BMad CLI Integration Validation

As a BMad user,
I want confirmation that my BMad installation is accessible and compatible,
so that I know the application will work with my existing BMad setup.

#### Acceptance Criteria
1. Application detects BMad CLI installation and displays version information
2. Basic BMad command execution test (`bmad --version` or equivalent) succeeds with output display
3. Working directory context is properly maintained when executing commands
4. Error messaging clearly indicates BMad installation issues with helpful resolution suggestions
5. Different BMad installation methods (pip, npm, source) are detected and handled appropriately
6. Command execution permissions are validated and permission issues are reported clearly

## Epic 2: Conversational Interface & Command Execution

**Epic Goal:** Transform the CLI experience into a natural conversational interface by implementing the core chat-style interaction pattern with message bubbles and real-time BMad command execution. This epic delivers the primary value proposition that differentiates BMad GUI from existing tools - seamless conversation-driven development workflows that eliminate context switching between CLI and web-based AI chats.

### Story 2.1: Chat Interface Message Display

As a BMad user,
I want to interact through a chat-style interface with message bubbles,
so that BMad agent communication feels natural and conversational rather than command-driven.

#### Acceptance Criteria
1. Center panel displays a scrollable chat conversation area with distinct message bubble styling
2. User messages appear as right-aligned bubbles with appropriate visual styling and spacing
3. AI/system responses appear as left-aligned bubbles with different visual treatment than user messages
4. Message timestamps are displayed and formatted appropriately for development workflow context
5. Long messages wrap correctly within bubbles without breaking the conversation flow
6. Conversation area auto-scrolls to newest messages while preserving manual scroll position when reviewing history
7. Message input field is prominently positioned at bottom with send button and Enter key support

### Story 2.2: Message Formatting & Display

As a BMad user,
I want rich message formatting that properly displays code, markdown, and structured content,
so that agent responses and command outputs are readable and actionable within the conversation interface.

#### Acceptance Criteria
1. Markdown rendering displays code blocks, headers, lists, and emphasis correctly within message bubbles
2. Syntax highlighting for code blocks supports major programming languages relevant to development workflows
3. Command output preserves formatting, color coding, and indentation for readability
4. Large code blocks or outputs are displayed in expandable/collapsible sections to manage screen space
5. Copy-to-clipboard functionality works for code blocks, commands, and individual messages
6. Link detection and click handling works for URLs, file paths, and documentation references
7. Message actions (copy, edit, delete, bookmark) are accessible through contextual menus or buttons

### Story 2.3: BMad Command Input Processing

As a BMad user,
I want to type natural language or BMad commands in the chat interface,
so that I can execute BMad agents without switching to terminal.

#### Acceptance Criteria
1. Message input accepts both natural language and direct BMad command syntax
2. Input validation provides immediate feedback for malformed commands or syntax errors
3. Command history navigation (up/down arrows) works within the input field for efficiency
4. Input field supports multi-line input for complex commands or natural language descriptions
5. Auto-complete suggestions appear for common BMad commands and agent names when typing
6. Input field maintains focus after sending messages to enable rapid conversation flow
7. Special character handling (quotes, backslashes, etc.) works correctly for complex BMad commands

### Story 2.4: Basic Command Execution

As a BMad user,
I want BMad commands to execute with clear feedback,
so that I can see command results within the conversation flow.

#### Acceptance Criteria
1. Commands execute in the correct project working directory context automatically
2. Execution status indicators (loading, processing, completed) display clearly in the conversation
3. Command output (stdout) appears in the conversation when execution completes
4. Command exit codes and completion status are clearly communicated to user
5. Basic command execution works reliably for single commands
6. Execution context is maintained between consecutive commands
7. Command execution errors are captured and displayed clearly

### Story 2.5: Real-time Output & Progress Feedback

As a BMad user,
I want real-time output streaming and progress indicators during command execution,
so that I can monitor long-running commands without uncertainty.

#### Acceptance Criteria
1. Real-time output streams (stdout) appear progressively in the conversation as commands execute
2. Progress indicators show active execution state during command processing
3. Output streaming maintains proper formatting and readability
4. Streaming output auto-scrolls conversation to show latest content
5. Output streaming handles large volumes of text without performance degradation
6. Streaming can be paused/resumed if user needs to review previous content
7. Real-time output display integrates seamlessly with message formatting system

### Story 2.6: Error Handling & Recovery

As a BMad user,
I want clear error messages and recovery options when commands fail,
so that I can troubleshoot and continue working efficiently without frustration.

#### Acceptance Criteria
1. Error messages display in distinctive styling within the conversation flow
2. stderr output is captured and displayed separately from stdout with clear visual distinction
3. Common error scenarios (command not found, permission denied, invalid syntax) provide specific helpful guidance
4. Error recovery suggestions are offered contextually based on the type of failure
5. Failed commands can be easily edited and re-executed without retyping entire input
6. BMad installation or configuration issues are detected and reported with actionable resolution steps
7. Network or file system permission errors provide clear explanation and potential solutions

### Story 2.7: Basic Agent Invocation

As a BMad user,
I want to invoke available BMad agents through simple commands,
so that I can begin using AI-assisted development workflows within the GUI.

#### Acceptance Criteria
1. Basic agent detection from current project allows simple agent invocation
2. Agent responses are captured and displayed appropriately within the conversation flow
3. Agent state and context are maintained throughout the conversation session
4. Simple agent commands work consistently within the chat interface
5. Agent completion signals are detected and communicated clearly to user
6. Basic agent output is formatted using the message formatting system from Story 2.2
7. Simple agent switching commands work for workflow flexibility

## Epic 3: Conversation Persistence & History Management

**Epic Goal:** Implement persistent conversation storage and intelligent history management to deliver the context continuity that differentiates BMad GUI from web-based AI chat tools. This epic ensures that developers can maintain project context across sessions while providing the local-first privacy guarantee that addresses core user concerns about data locality and conversation security.

### Story 3.1: SQLite Database Integration & Schema Design

As a developer,
I want conversation data stored locally in SQLite databases per project,
so that conversations persist reliably without external dependencies while maintaining project isolation.

#### Acceptance Criteria
1. SQLite database is automatically created for each BMad project in a `.bmad-gui/` directory within the project
2. Database schema supports conversation threads, messages, timestamps, and metadata storage
3. Database initialization handles schema migration and versioning for future updates
4. Per-project isolation ensures conversation data never leaks between different BMad projects
5. Database operations are wrapped in appropriate error handling with fallback behaviors
6. Database file permissions are set appropriately to maintain security on multi-user systems
7. Database corruption detection and recovery mechanisms are implemented for data integrity

### Story 3.2: Conversation Persistence During Sessions

As a BMad user,
I want my conversations automatically saved as I work,
so that I never lose context due to application crashes or unexpected interruptions.

#### Acceptance Criteria
1. Messages are saved to SQLite immediately upon sending or receiving without user intervention
2. Conversation state persists automatically during BMad command execution and agent interactions
3. Application recovery restores the exact conversation state after unexpected shutdown or crash
4. Message metadata (timestamps, agent types, command results) is preserved accurately
5. Large command outputs are stored efficiently without degrading database performance
6. Conversation threading maintains logical flow and context relationships between messages
7. Auto-save operations occur without blocking the user interface or conversation flow

### Story 3.3: Retention Policy Management

As a BMad user,
I want configurable conversation retention policies with a sensible 1-week default,
so that my local storage remains manageable while preserving important project context.

#### Acceptance Criteria
1. Default 1-week retention policy automatically removes conversations older than 7 days
2. Retention settings are configurable per project through a simple preferences interface
3. Retention options include: 1 day, 1 week, 1 month, 3 months, unlimited, and custom timeframes
4. Retention cleanup runs automatically in the background without impacting performance
5. Important conversations can be marked for permanent retention regardless of policy settings
6. Retention policy enforcement provides clear notifications before deleting conversations
7. Deleted conversations can be recovered for 24 hours through a "trash" mechanism

### Story 3.4: Conversation Search & Filtering

As a BMad user,
I want to search and filter my conversation history within projects,
so that I can quickly find previous discussions, commands, and solutions without scrolling through entire conversation logs.

#### Acceptance Criteria
1. Full-text search across conversation content returns relevant results with context highlighting
2. Search results display message snippets with enough context to understand relevance
3. Filter options include date ranges, agent types, command success/failure status, and message types
4. Search performance remains responsive even with large conversation histories (>1000 messages)
5. Search and filter combinations work together for precise result refinement
6. Search suggestions and auto-complete help users find content more efficiently
7. Recent searches are remembered for quick re-access to common search patterns

### Story 3.5: Cross-Session Context Restoration

As a BMad user,
I want my conversation context automatically restored when I return to a project,
so that I can continue working exactly where I left off without losing mental context.

#### Acceptance Criteria
1. Application automatically loads the most recent conversation when selecting a project
2. Conversation scroll position is restored to the last viewed message for seamless continuation
3. Active agent context and state information are preserved across sessions when possible
4. Input field maintains draft messages that were being composed during previous session
5. Project-specific settings and preferences are restored accurately
6. Context restoration completes quickly (<2 seconds) without blocking project access
7. Manual conversation navigation allows users to jump to different time periods within project history

## Epic 4: Agent Discovery & Enhanced UX

**Epic Goal:** Complete the full BMad GUI vision by implementing comprehensive agent discovery, polishing the three-panel interface to production quality, and delivering the enhanced user experience that makes BMad accessible to both power users and BMad-curious developers. This epic transforms the functional application into a polished product ready for widespread adoption and competitive market positioning.

### Story 4.1: Comprehensive Agent Discovery & Navigation

As a BMad user,
I want to discover and navigate between available agents in my project,
so that I can explore BMad's full capabilities and switch between different AI assistance modes efficiently.

#### Acceptance Criteria
1. Right panel displays a comprehensive list of available agents discovered from `agents/`, `tasks/`, and `workflow/` directories
2. Agent list shows agent names, descriptions, and usage hints when available from agent metadata
3. Agent categories (tasks, workflows, specialized agents) are visually organized for easy navigation
4. Clicking an agent initializes it within the current conversation with appropriate context and greeting
5. Agent switching preserves conversation history while clearly indicating context changes
6. Recently used agents are highlighted or prioritized for quick access during active development
7. Agent search and filtering capabilities help users find specific agents quickly in large projects
8. Agent discovery provides significantly more comprehensive coverage than basic agent invocation from Epic 2

### Story 4.2: Advanced Command Features

As a BMad user,
I want advanced command execution capabilities like queuing, cancellation, and timing,
so that I can manage complex development workflows efficiently.

#### Acceptance Criteria
1. Command execution can be cancelled by user if process runs longer than expected
2. Multiple commands can be queued and executed sequentially without interface blocking
3. Execution time tracking displays for performance awareness and debugging
4. Command queue management allows reordering and removal of pending commands
5. Background command execution continues while user performs other interface actions
6. Advanced command features integrate seamlessly with basic execution from Epic 2
7. Command execution prioritization allows urgent commands to jump the queue

### Story 4.3: Context Panel & Command Reference

As a BMad user,
I want contextual information and command references readily available,
so that I can work efficiently without memorizing commands or switching to external documentation.

#### Acceptance Criteria
1. Right panel provides collapsible sections for project context, active agent information, and command references
2. Command reference displays relevant commands for the currently active agent with syntax examples
3. Project context shows current working directory, git status, and other relevant project metadata
4. Panel content updates dynamically based on conversation state and active agent
5. Quick action buttons for common operations (git status, project info, help) are easily accessible
6. Panel width is adjustable and remembers user preferences across sessions
7. Keyboard shortcuts enable rapid panel toggling and navigation without mouse interaction

### Story 4.4: User Experience Polish & Accessibility

As a BMad user,
I want a polished, responsive interface that works consistently across platforms,
so that the application feels professional and reliable for daily development use.

#### Acceptance Criteria
1. Interface animations and transitions are smooth and purposeful without feeling sluggish
2. Loading states and progress indicators provide clear feedback during longer operations
3. Keyboard accessibility supports full navigation and operation without mouse dependency
4. Application window state (size, position, panel widths) persists across sessions appropriately
5. Error messages and notifications are non-intrusive but clearly visible and actionable
6. Interface adapts gracefully to different screen sizes and resolutions while maintaining usability
7. Color scheme and typography choices optimize for extended development sessions and various lighting conditions

### Story 4.5: Settings & Preferences Management

As a BMad user,
I want to customize application behavior and preferences,
so that the tool adapts to my specific workflow needs and development environment.

#### Acceptance Criteria
1. Settings interface allows configuration of retention policies, display preferences, and behavior options
2. Theme selection supports light, dark, and system-based automatic theme switching
3. Notification preferences control alerts for command completion, errors, and system events
4. Keyboard shortcut customization enables workflow optimization for individual user preferences
5. Project-specific settings override global preferences when appropriate
6. Settings export/import enables configuration sharing and backup for consistency across installations
7. Settings validation prevents invalid configurations that could break application functionality