# External APIs

**No external APIs are required for BMad GUI core functionality.**

This is a deliberate architectural decision that aligns with your PRD requirements for complete offline capability and local-first privacy. The application achieves full functionality through:

- **BMad CLI Integration**: Direct process spawning rather than API calls
- **Local File System**: Native file system APIs for project detection
- **SQLite Storage**: Local database eliminates need for remote data APIs
- **Offline-First Design**: All features work without network connectivity

**Future Considerations (Post-MVP):**
If external APIs become necessary for enhanced features, potential integrations might include:
- GitHub API for repository integration (optional enhancement)
- Update checking service for application updates (can be implemented via GitHub Releases)
- Telemetry APIs for usage analytics (opt-in only, maintaining privacy-first approach)

This zero-external-dependency approach directly supports your competitive positioning as a privacy-first development tool and ensures the application works reliably in restrictive network environments.
