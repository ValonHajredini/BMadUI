# Deployment Architecture

## Deployment Strategy

**Frontend Deployment:**
- **Platform:** Electron Renderer Process (bundled with main app)
- **Build Command:** `ng build --configuration production`
- **Output Directory:** `dist/renderer/`
- **CDN/Edge:** Not applicable (local desktop app)

**Backend Deployment:**
- **Platform:** Electron Main Process (bundled native application)
- **Build Command:** `tsc --build tsconfig.main.json`
- **Deployment Method:** Native application packaging via electron-builder

## CI/CD Pipeline
```yaml
# .github/workflows/ci.yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        node-version: [18, 20]

    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - run: npm ci
      - run: npm run build:libs
      - run: npm run lint
      - run: npm run test:ci
      - run: npm run build

  build:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]

    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - run: npm ci
      - run: npm run build
      - run: npm run electron:build

      - name: Upload artifacts
        uses: actions/upload-artifact@v4
        with:
          name: bmad-gui-${{ matrix.os }}
          path: dist/electron/
```

## Environments

| Environment | Frontend URL | Backend URL | Purpose |
|-------------|--------------|-------------|---------|
| Development | file://localhost | N/A - Local IPC | Local development |
| Testing | file://localhost | N/A - Local IPC | Automated testing |
| Production | file://localhost | N/A - Local IPC | Packaged application |
