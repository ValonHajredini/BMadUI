# Testing Strategy

## Testing Pyramid
```
       E2E Tests (Manual for MVP)
      /                        \
     Integration Tests (Electron + Angular)
    /                                      \
Angular Unit Tests              Node.js Unit Tests
```

## Test Organization

### Frontend Tests
```
src/renderer/app/
├── core/
│   └── services/
│       ├── ipc.service.spec.ts
│       └── state.service.spec.ts
├── shared/
│   └── components/
│       ├── message-bubble/
│       │   └── message-bubble.component.spec.ts
│       └── loading-spinner/
└── features/
    └── chat/
        └── components/
            └── chat-interface/
                └── chat-interface.component.spec.ts
```

### Backend Tests
```
src/main/
├── services/
│   ├── project-scanner.spec.ts
│   ├── command-executor.spec.ts
│   └── conversation-manager.spec.ts
├── handlers/
│   ├── project-handlers.spec.ts
│   └── command-handlers.spec.ts
└── utils/
    ├── file-utils.spec.ts
    └── database-utils.spec.ts
```

### E2E Tests (Deferred to Post-MVP)
```
e2e/
├── specs/
│   ├── project-discovery.spec.ts
│   ├── chat-interface.spec.ts
│   └── command-execution.spec.ts
├── fixtures/
└── support/
```

## Test Examples

### Frontend Component Test
```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatInterfaceComponent } from './chat-interface.component';
import { ConversationService } from '../../services/conversation.service';

describe('ChatInterfaceComponent', () => {
  let component: ChatInterfaceComponent;
  let fixture: ComponentFixture<ChatInterfaceComponent>;
  let mockConversationService: jest.Mocked<ConversationService>;

  beforeEach(async () => {
    mockConversationService = {
      saveMessage: jest.fn(),
      loadConversation: jest.fn()
    } as any;

    await TestBed.configureTestingModule({
      imports: [ChatInterfaceComponent],
      providers: [
        { provide: ConversationService, useValue: mockConversationService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ChatInterfaceComponent);
    component = fixture.componentInstance;
  });

  it('should send message and update state', async () => {
    const testMessage = 'Test message';
    mockConversationService.saveMessage.mockResolvedValue('msg-123');

    component.handleMessage(testMessage);

    expect(mockConversationService.saveMessage).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        content: testMessage,
        type: 'user'
      })
    );
  });
});
```

### Backend API Test
```typescript
import { CommandExecutorService } from './command-executor.service';
import { spawn } from 'child_process';

jest.mock('child_process');
const mockSpawn = spawn as jest.MockedFunction<typeof spawn>;

describe('CommandExecutorService', () => {
  let service: CommandExecutorService;

  beforeEach(() => {
    service = new CommandExecutorService();
    jest.clearAllMocks();
  });

  it('should execute command and return execution ID', async () => {
    const mockProcess = {
      stdout: { on: jest.fn() },
      stderr: { on: jest.fn() },
      on: jest.fn(),
      kill: jest.fn()
    } as any;

    mockSpawn.mockReturnValue(mockProcess);

    const result = await service.executeCommand(
      'test-project-id',
      'bmad --help'
    );

    expect(result.executionId).toBeDefined();
    expect(mockSpawn).toHaveBeenCalledWith(
      'bmad --help',
      expect.objectContaining({
        cwd: expect.any(String),
        shell: true
      })
    );
  });
});
```

### E2E Test (Future Implementation)
```typescript
import { test, expect } from '@playwright/test';

test.describe('BMad GUI E2E', () => {
  test('should discover projects and enable chat', async ({ page }) => {
    // Launch Electron app
    await page.goto('app://');

    // Wait for project discovery
    await expect(page.locator('[data-testid="project-list"]')).toBeVisible();

    // Select a project
    await page.locator('[data-testid="project-item"]:first-child').click();

    // Verify chat interface loads
    await expect(page.locator('[data-testid="chat-interface"]')).toBeVisible();

    // Send a message
    await page.fill('[data-testid="message-input"]', 'Hello BMad');
    await page.click('[data-testid="send-button"]');

    // Verify message appears
    await expect(page.locator('[data-testid="message-bubble"]').last()).toContainText('Hello BMad');
  });
});
```
