# Requirements

## Functional Requirements

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

## Non-Functional Requirements

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
