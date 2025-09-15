# Epic 1: Foundation & Project Discovery

**Epic Goal:** Establish the foundational Electron + Angular application infrastructure while delivering immediate user value through automatic BMad project detection and navigation. This epic creates the technical foundation required for all subsequent development while proving the core concept of seamless BMad project discovery to users.

## Story 1.1: Application Bootstrap & Development Environment

As a developer,
I want a properly configured Electron + Angular 20 application with TypeScript,
so that I have a solid foundation for building the BMad GUI with modern reactive patterns.

### Acceptance Criteria
1. Electron application successfully launches and displays basic Angular interface on Windows, macOS, and Linux
2. Angular 20+ standalone components architecture is configured with signals and TypeScript strict mode
3. Application window opens with appropriate sizing (1200x800 minimum) and basic menu structure
4. Development build process works correctly with hot reload for efficient iteration
5. Basic error handling displays meaningful messages rather than crashing the application
6. Application icon and basic branding elements are present and display correctly

## Story 1.2: File System Project Scanner

As a BMad user,
I want the application to automatically discover my BMad projects by scanning for `.bmad-core/` directories,
so that I can quickly access my projects without manual configuration.

### Acceptance Criteria
1. Application scans common development directories (~/Projects, ~/Code, ~/Development) for `.bmad-core/` folders
2. Detected projects display project name derived from parent directory name
3. Scanning completes within 5 seconds for typical development directory structures
4. Application handles permission errors gracefully when accessing restricted directories
5. Scan results update when new projects are created or existing projects are moved
6. Empty scan results display helpful messaging suggesting project creation or manual path addition

## Story 1.3: Project List Interface

As a BMad user,
I want to see my discovered projects in a clean, navigable list,
so that I can select and work with specific BMad projects.

### Acceptance Criteria
1. Left sidebar displays discovered projects in a scrollable list with clear project names
2. Project list shows basic metadata (path, last accessed) when available
3. Interface handles both single and multiple project scenarios gracefully
4. Project list refreshes automatically when file system changes are detected
5. Basic project selection highlighting works without navigation behavior
6. Project list component is self-contained and ready for navigation integration

## Story 1.4a: Basic Three-Panel Layout Structure

As a developer using BMad GUI,
I want the foundational three-panel layout structure established,
so that future features integrate consistently within the planned interface.

### Acceptance Criteria
1. Application displays left sidebar, center panel, and collapsible right panel structure
2. Panel containers are properly sized with placeholder content
3. Panel resizing works smoothly with appropriate minimum and maximum widths
4. Layout adapts appropriately to different window sizes while maintaining usability
5. Right panel collapses and expands with smooth animation and state persistence
6. Basic keyboard shortcuts (Ctrl/Cmd+1,2,3) switch focus between panels for accessibility

## Story 1.4b: Project Navigation Integration

As a BMad user,
I want project selection to update the application context,
so that I can work within specific BMad projects seamlessly.

### Acceptance Criteria
1. Project selection from the list updates the center panel to show selected project context
2. Selected project state is clearly indicated in the project list
3. Project switching updates the entire interface context appropriately
4. Selected project persists across application restarts for improved workflow continuity
5. Navigation between projects maintains layout state and panel preferences
6. Error states display gracefully when project context cannot be loaded

## Story 1.5: BMad CLI Integration Validation

As a BMad user,
I want confirmation that my BMad installation is accessible and compatible,
so that I know the application will work with my existing BMad setup.

### Acceptance Criteria
1. Application detects BMad CLI installation and displays version information
2. Basic BMad command execution test (`bmad --version` or equivalent) succeeds with output display
3. Working directory context is properly maintained when executing commands
4. Error messaging clearly indicates BMad installation issues with helpful resolution suggestions
5. Different BMad installation methods (pip, npm, source) are detected and handled appropriately
6. Command execution permissions are validated and permission issues are reported clearly
