# API Specification

Since BMad GUI uses IPC (Inter-Process Communication) rather than REST API, I'm providing the IPC channel definitions that serve as the "API" between the Electron main process and Angular renderer.

## IPC Channel Definitions

```typescript
// IPC Channel Types and Messages
interface IPCChannelMap {
  // Project Management
  'project:scan': {
    request: { paths?: string[] };
    response: BMadProject[];
  };

  'project:select': {
    request: { projectId: string };
    response: { success: boolean; project?: BMadProject };
  };

  'project:get-agents': {
    request: { projectId: string };
    response: BMadAgent[];
  };

  // Command Execution
  'command:execute': {
    request: {
      projectId: string;
      command: string;
      agentId?: string;
    };
    response: { executionId: string };
  };

  'command:output': {
    event: {
      executionId: string;
      type: 'stdout' | 'stderr' | 'exit';
      data: string;
      exitCode?: number;
    };
  };

  'command:cancel': {
    request: { executionId: string };
    response: { success: boolean };
  };

  // Conversation Management
  'conversation:load': {
    request: { projectId: string; conversationId?: string };
    response: Conversation;
  };

  'conversation:save-message': {
    request: {
      conversationId: string;
      message: Omit<Message, 'id' | 'timestamp'>;
    };
    response: { messageId: string };
  };

  'conversation:search': {
    request: {
      projectId: string;
      query: string;
      filters?: {
        dateRange?: { start: Date; end: Date };
        messageTypes?: string[];
      };
    };
    response: {
      results: Array<{
        messageId: string;
        conversationId: string;
        snippet: string;
        timestamp: Date;
      }>;
    };
  };

  // Settings and Preferences
  'settings:get': {
    request: { key?: string };
    response: Record<string, any>;
  };

  'settings:set': {
    request: { settings: Record<string, any> };
    response: { success: boolean };
  };
}

// Example IPC Service Implementation
class IPCService {
  // Main Process -> Renderer Events
  static sendToRenderer(channel: keyof IPCChannelMap, data: any): void;

  // Renderer -> Main Process Requests
  static invoke<T extends keyof IPCChannelMap>(
    channel: T,
    data: IPCChannelMap[T]['request']
  ): Promise<IPCChannelMap[T]['response']>;

  // Event Listeners
  static on<T extends keyof IPCChannelMap>(
    channel: T,
    handler: (data: IPCChannelMap[T]['event']) => void
  ): void;
}
```

**Example Usage Patterns:**

```typescript
// In Angular Service
async loadProject(projectId: string): Promise<BMadProject> {
  const response = await IPCService.invoke('project:select', { projectId });
  if (response.success && response.project) {
    return response.project;
  }
  throw new Error('Project not found');
}

// Command execution with real-time output
async executeCommand(projectId: string, command: string): Promise<void> {
  const { executionId } = await IPCService.invoke('command:execute', {
    projectId,
    command
  });

  IPCService.on('command:output', (event) => {
    if (event.executionId === executionId) {
      this.handleCommandOutput(event);
    }
  });
}
```

**Authentication:** Not applicable - IPC communication is internal to the application

**Error Handling:** All IPC calls include error responses with structured error information:

```typescript
interface IPCError {
  code: string;
  message: string;
  details?: Record<string, any>;
}
```
