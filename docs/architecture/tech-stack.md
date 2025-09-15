# Tech Stack

This is the DEFINITIVE technology selection for the entire BMad GUI project. All development must use these exact versions and approaches.

## Technology Stack Table

| Category | Technology | Version | Purpose | Rationale |
|----------|------------|---------|---------|-----------|
| Frontend Language | TypeScript | 5.2+ | Type-safe Angular development | Provides compile-time safety essential for single developer, reduces runtime errors |
| Frontend Framework | Angular | 20+ | Reactive UI with standalone components | Signals and @defer blocks optimize chat performance, standalone components reduce bundle size |
| UI Component Library | Angular Material | 17+ | Consistent desktop UI patterns | Mature component library with accessibility built-in, reduces custom CSS needs |
| State Management | Angular Signals | Built-in | Reactive state for chat/commands | Native Angular solution, optimal performance for real-time updates |
| Backend Language | Node.js | 18+ LTS | Electron main process runtime | Required for Electron, provides access to system APIs |
| Backend Framework | Electron | 27+ | Cross-platform desktop packaging | Only viable option for cross-platform native desktop with web technologies |
| API Style | IPC (Inter-Process Communication) | Built-in | Main/renderer communication | Electron's native communication method, no HTTP needed for local app |
| Database | SQLite | 3.40+ | Local conversation storage | Zero-config local database, perfect for offline-first architecture |
| Cache | Memory (Map) | Built-in | Runtime command/project cache | Simple in-memory caching sufficient for desktop app scope |
| File Storage | File System API | Native | Project detection and logs | Native file system access required for .bmad-core/ detection |
| Authentication | None | N/A | No auth required for local app | Local-only application eliminates authentication complexity |
| Frontend Testing | Jest + Angular Testing | Latest | Unit and component testing | Angular's default testing setup, minimal configuration required |
| Backend Testing | Jest | Latest | Node.js service testing | Consistent testing framework across frontend/backend |
| E2E Testing | Deferred to post-MVP | N/A | End-to-end workflow testing | Manual testing sufficient for MVP timeline |
| Build Tool | Angular CLI | 17+ | Frontend build and dev server | Integrated build pipeline optimized for Angular development |
| Bundler | Webpack (via Angular CLI) | Latest | Code bundling and optimization | Built into Angular CLI, handles both dev and production builds |
| IaC Tool | None | N/A | No infrastructure required | Desktop app eliminates infrastructure management |
| CI/CD | GitHub Actions | Latest | Build and release automation | Free for open source, cross-platform builds |
| Monitoring | Console logging | Built-in | Development debugging | Simple logging sufficient for MVP, can enhance post-launch |
| Logging | Electron Log | 5+ | Structured desktop app logging | Desktop-optimized logging with file rotation |
| CSS Framework | Angular Material + Custom | Latest | Styling and layout | Material provides base, custom CSS for chat-specific styling |
