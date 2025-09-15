# Development Workflow

## Local Development Setup

### Prerequisites
```bash
# Node.js 18+ LTS
node --version

# npm 9+
npm --version

# BMad CLI (for testing)
bmad --version

# Platform-specific tools
# Windows: Visual Studio Build Tools
# macOS: Xcode Command Line Tools
# Linux: build-essential
```

### Initial Setup
```bash
# Clone repository
git clone <repository-url>
cd BMadUI

# Install dependencies
npm install

# Set up environment
cp .env.example .env

# Build shared libraries
npm run build:libs

# Run initial setup
npm run setup
```

### Development Commands
```bash
# Start all services (recommended for development)
npm run dev

# Start frontend only (Angular dev server)
npm run dev:renderer

# Start backend only (Electron main process)
npm run dev:main

# Run tests
npm run test              # All tests
npm run test:unit         # Unit tests only
npm run test:e2e          # E2E tests (when available)

# Build for production
npm run build             # Full build
npm run build:renderer    # Angular build only
npm run build:main        # Electron main build only

# Package application
npm run electron:build    # Build native applications
npm run electron:serve    # Test production build locally
```

## Environment Configuration

### Required Environment Variables
```bash
# Development (.env.local)
NODE_ENV=development
ELECTRON_IS_DEV=true
LOG_LEVEL=debug
DEV_TOOLS_ENABLED=true

# Production (.env.production)
NODE_ENV=production
ELECTRON_IS_DEV=false
LOG_LEVEL=info
DEV_TOOLS_ENABLED=false

# Shared across environments
APP_NAME=BMad GUI
APP_VERSION=1.0.0
SQLITE_MAX_CONNECTIONS=5
DEFAULT_RETENTION_DAYS=7
MAX_CONVERSATION_COUNT=1000
```
