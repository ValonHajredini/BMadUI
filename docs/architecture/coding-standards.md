# Coding Standards

## Critical Fullstack Rules

- **Type Sharing:** Always define types in libs/shared and import from there - prevents type drift between main and renderer processes
- **IPC Communication:** Never make direct IPC calls in components - use service layer for all main/renderer communication
- **Environment Variables:** Access only through config objects, never process.env directly - ensures proper environment handling
- **Error Handling:** All IPC handlers must use the standard error handler - maintains consistent error responses
- **State Updates:** Never mutate signals directly in components - use service methods for all state modifications
- **Database Access:** All SQLite operations must go through repository layer - ensures proper connection management
- **File Path Validation:** Always validate file paths through SecurityService - prevents directory traversal attacks
- **Command Execution:** Validate all commands before execution - prevents harmful command injection

## Naming Conventions

| Element | Frontend | Backend | Example |
|---------|----------|---------|---------|
| Components | PascalCase | - | `ChatInterfaceComponent` |
| Services | PascalCase + Service | PascalCase + Service | `ConversationService` |
| Signals | camelCase | - | `currentProject` |
| IPC Channels | namespace:action | namespace:action | `project:scan` |
| Database Tables | snake_case | snake_case | `conversations` |
| File Names | kebab-case | kebab-case | `chat-interface.component.ts` |
