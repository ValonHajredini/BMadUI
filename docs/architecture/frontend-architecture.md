# Frontend Architecture

## Component Architecture

### Component Organization
```
src/app/
├── core/                    # Singleton services and guards
│   ├── services/
│   │   ├── ipc.service.ts
│   │   ├── project.service.ts
│   │   └── conversation.service.ts
│   └── guards/
├── shared/                  # Reusable components
│   ├── components/
│   │   ├── message-bubble/
│   │   ├── loading-spinner/
│   │   └── error-display/
│   └── interfaces/
├── features/                # Feature-specific modules
│   ├── chat/
│   │   ├── components/
│   │   │   ├── chat-interface/
│   │   │   ├── message-input/
│   │   │   └── message-list/
│   │   └── services/
│   ├── projects/
│   │   ├── components/
│   │   │   ├── project-list/
│   │   │   └── project-selector/
│   │   └── services/
│   └── agents/
└── layouts/                 # Layout components
    ├── main-layout/
    └── three-panel-layout/
```

### Component Template
```typescript
@Component({
  selector: 'app-chat-interface',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatInputModule],
  template: `
    <div class="chat-container">
      <app-message-list
        [messages]="messages()"
        [isLoading]="isExecuting()" />
      <app-message-input
        (messageSubmit)="handleMessage($event)"
        [disabled]="isExecuting()" />
    </div>
  `,
  styleUrl: './chat-interface.component.scss'
})
export class ChatInterfaceComponent {
  messages = signal<Message[]>([]);
  isExecuting = signal<boolean>(false);

  constructor(
    private conversationService: ConversationService,
    private commandService: CommandService
  ) {}

  handleMessage(content: string) {
    // Implementation with signals and reactive patterns
  }
}
```

## State Management Architecture

### State Structure
```typescript
// Global application state using Angular signals
interface AppState {
  currentProject: Signal<BMadProject | null>;
  conversations: Signal<Conversation[]>;
  activeConversation: Signal<Conversation | null>;
  availableAgents: Signal<BMadAgent[]>;
  isLoading: Signal<boolean>;
  error: Signal<string | null>;
}

// Service-based state management
@Injectable({ providedIn: 'root' })
export class StateService {
  private _currentProject = signal<BMadProject | null>(null);
  private _conversations = signal<Conversation[]>([]);
  private _activeConversation = signal<Conversation | null>(null);

  readonly currentProject = this._currentProject.asReadonly();
  readonly conversations = this._conversations.asReadonly();
  readonly activeConversation = this._activeConversation.asReadonly();

  setCurrentProject(project: BMadProject) {
    this._currentProject.set(project);
  }

  addMessage(message: Message) {
    const current = this._activeConversation();
    if (current) {
      const updated = {
        ...current,
        messages: [...current.messages, message]
      };
      this._activeConversation.set(updated);
    }
  }
}
```

### State Management Patterns
- **Signal-based reactivity**: Use Angular signals for fine-grained reactivity
- **Service-based state**: Centralized state management through injectable services
- **Computed signals**: Derived state using computed() for optimal performance
- **Effect-based side effects**: Use effect() for handling state change reactions

## Routing Architecture

### Route Organization
```
/
├── projects/               # Project selection view
├── chat/:projectId         # Main chat interface
├── history/:projectId      # Conversation history
├── settings               # Application settings
└── ** (redirect to projects)
```

### Protected Route Pattern
```typescript
@Injectable()
export class ProjectGuard implements CanActivate {
  constructor(private projectService: ProjectService) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const projectId = route.params['projectId'];
    return this.projectService.hasProject(projectId);
  }
}

// Route configuration
export const routes: Routes = [
  { path: '', redirectTo: '/projects', pathMatch: 'full' },
  { path: 'projects', component: ProjectListComponent },
  {
    path: 'chat/:projectId',
    component: ChatLayoutComponent,
    canActivate: [ProjectGuard]
  },
  {
    path: 'history/:projectId',
    component: ConversationHistoryComponent,
    canActivate: [ProjectGuard]
  }
];
```

## Frontend Services Layer

### API Client Setup
```typescript
@Injectable({ providedIn: 'root' })
export class IPCService {
  async invoke<T extends keyof IPCChannelMap>(
    channel: T,
    data: IPCChannelMap[T]['request']
  ): Promise<IPCChannelMap[T]['response']> {
    return (window as any).electronAPI.invoke(channel, data);
  }

  on<T extends keyof IPCChannelMap>(
    channel: T,
    handler: (data: IPCChannelMap[T]['event']) => void
  ): void {
    (window as any).electronAPI.on(channel, handler);
  }

  removeListener(channel: string, handler: Function): void {
    (window as any).electronAPI.removeListener(channel, handler);
  }
}
```

### Service Example
```typescript
@Injectable({ providedIn: 'root' })
export class ConversationService {
  constructor(private ipc: IPCService) {}

  async loadConversation(projectId: string, conversationId?: string): Promise<Conversation> {
    return this.ipc.invoke('conversation:load', { projectId, conversationId });
  }

  async saveMessage(conversationId: string, message: Omit<Message, 'id' | 'timestamp'>): Promise<string> {
    const result = await this.ipc.invoke('conversation:save-message', {
      conversationId,
      message
    });
    return result.messageId;
  }

  async searchConversations(projectId: string, query: string): Promise<SearchResult[]> {
    const result = await this.ipc.invoke('conversation:search', {
      projectId,
      query
    });
    return result.results;
  }
}
```
