# Monitoring and Observability

## Monitoring Stack

- **Frontend Monitoring:** Angular error handling + custom error reporting service
- **Backend Monitoring:** Electron main process logging + structured error tracking
- **Error Tracking:** Local log files with rotation + optional external error reporting
- **Performance Monitoring:** Built-in performance timing + memory usage tracking

## Key Metrics

**Frontend Metrics:**
- Core Web Vitals (for Electron renderer performance)
- JavaScript errors and unhandled promise rejections
- IPC communication latency and success rates
- User interaction response times

**Backend Metrics:**
- IPC request rate and response times
- Command execution success/failure rates
- Database query performance and connection health
- Memory usage and garbage collection metrics

**System Metrics:**
- Application startup time
- File system operation performance
- SQLite database performance
- Cross-platform compatibility metrics