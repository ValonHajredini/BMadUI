# Technical Assumptions

## Repository Structure: Monorepo
Single repository containing the complete desktop application with clear separation between UI components, services, and BMad integration layers. This approach aligns with the single developer resource and rapid MVP delivery timeline while enabling future modular development.

## Service Architecture
**Desktop Application Monolith with Modular Services:** Electron-based desktop application containing distinct service modules:
- BMad Detection Service: File system scanning for `.bmad-core/` directories
- Command Execution Service: Process spawning with working directory context preservation
- Conversation Management Service: SQLite operations with retention policy enforcement
- Project Management Service: Multi-project state handling and navigation
- UI State Management Service: Angular signals-based reactive state coordination

**Rationale:** Monolithic approach reduces complexity for single developer while modular services enable future extraction if needed.

## Testing Requirements
**Unit + Integration Testing:** Comprehensive testing strategy including:
- Unit tests for service modules and UI components using Angular testing framework
- Integration tests for BMad CLI interaction and SQLite operations
- Cross-platform compatibility testing for file system and process management
- Manual testing convenience methods for UI interaction patterns
- No automated E2E testing in MVP to preserve development timeline

**Rationale:** Balances quality assurance with aggressive 2-4 week timeline; focuses testing effort on critical integration points.

## Additional Technical Assumptions and Requests

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
