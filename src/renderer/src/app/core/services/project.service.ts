import { Injectable, computed, signal } from '@angular/core';
import { BMadProject, ProjectScanRequest, ProjectScanResponse } from '../../../../../shared/interfaces/project.interface';

declare global {
  interface Window {
    electronAPI: {
      invoke: (channel: string, data?: any) => Promise<any>;
      on: (channel: string, callback: Function) => void;
      removeAllListeners: (channel: string) => void;
    };
  }
}

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  // Signal-based state management
  private readonly _projects = signal<BMadProject[]>([]);
  private readonly _isScanning = signal<boolean>(false);
  private readonly _scanError = signal<string | null>(null);
  private readonly _selectedProject = signal<BMadProject | null>(null);

  // Public computed signals
  public readonly projects = this._projects.asReadonly();
  public readonly isScanning = this._isScanning.asReadonly();
  public readonly scanError = this._scanError.asReadonly();
  public readonly selectedProject = this._selectedProject.asReadonly();

  // Computed signals for derived state
  public readonly hasProjects = computed(() => this._projects().length > 0);
  public readonly isEmpty = computed(() => !this.hasProjects() && !this.isScanning());
  public readonly projectCount = computed(() => this._projects().length);

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    try {
      // Listen for project changes from main process
      window.electronAPI.on('project:changed', (changedProject: BMadProject) => {
        console.log('Project changed event received:', changedProject);
        // Re-scan projects to get updated list
        this.scanProjects();
      });
    } catch (error) {
      console.error('Error setting up event listeners:', error);
    }
  }

  public async scanProjects(customPaths?: string[]): Promise<void> {
    this._isScanning.set(true);
    this._scanError.set(null);

    try {
      const request: ProjectScanRequest = customPaths ? { paths: customPaths } : {};

      const response: ProjectScanResponse = await window.electronAPI.invoke('project:scan', request);

      if (response.success) {
        // Update projects with derived names and sort by last accessed
        const projectsWithDerivedNames = response.projects.map(project => ({
          ...project,
          name: this.deriveProjectName(project.path),
          lastAccessed: new Date(project.lastAccessed) // Ensure Date object
        }));

        // Sort by last accessed (most recent first)
        const sortedProjects = projectsWithDerivedNames.sort((a, b) =>
          b.lastAccessed.getTime() - a.lastAccessed.getTime()
        );

        this._projects.set(sortedProjects);
        console.log(`Successfully scanned ${sortedProjects.length} projects`);
      } else {
        const errorMessage = response.error || 'Unknown error during project scan';
        this._scanError.set(errorMessage);
        console.error('Project scan failed:', errorMessage);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to communicate with main process';
      this._scanError.set(errorMessage);
      console.error('Error scanning projects:', error);
    } finally {
      this._isScanning.set(false);
    }
  }

  public async openProject(projectId: string): Promise<boolean> {
    try {
      const response = await window.electronAPI.invoke('project:open', projectId);

      if (response.success) {
        // Update the selected project
        this._selectedProject.set(response.project);

        // Update the project's last accessed time in our local state
        const currentProjects = this._projects();
        const updatedProjects = currentProjects.map(project =>
          project.id === projectId
            ? { ...project, lastAccessed: new Date(), isActive: true }
            : { ...project, isActive: false }
        );

        this._projects.set(updatedProjects);
        console.log('Project opened successfully:', response.project.name);
        return true;
      } else {
        console.error('Failed to open project:', response.error);
        return false;
      }
    } catch (error) {
      console.error('Error opening project:', error);
      return false;
    }
  }

  public selectProject(project: BMadProject): void {
    // Update selection state
    const currentProjects = this._projects();
    const updatedProjects = currentProjects.map(p => ({
      ...p,
      isActive: p.id === project.id
    }));

    this._projects.set(updatedProjects);
    this._selectedProject.set(project);
  }

  public clearSelection(): void {
    const currentProjects = this._projects();
    const updatedProjects = currentProjects.map(p => ({
      ...p,
      isActive: false
    }));

    this._projects.set(updatedProjects);
    this._selectedProject.set(null);
  }

  public getEmptyStateMessage(): string {
    if (this.scanError()) {
      return `Error scanning for projects: ${this.scanError()}. Please check permissions and try again.`;
    }

    if (this.isScanning()) {
      return 'Scanning for BMad projects...';
    }

    return 'No BMad projects found. Create a new project or add a .bmad-core directory to an existing project to get started.';
  }

  public deriveProjectName(projectPath: string): string {
    try {
      // Extract the directory name from the path
      const pathParts = projectPath.replace(/\/$/, '').split('/');
      const directoryName = pathParts[pathParts.length - 1];

      // Convert kebab-case or snake_case to Title Case
      const titleCase = directoryName
        .split(/[-_]/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');

      return titleCase || 'Unnamed Project';
    } catch (error) {
      console.error('Error deriving project name from path:', projectPath, error);
      return 'Unnamed Project';
    }
  }

  public refreshProjects(): Promise<void> {
    return this.scanProjects();
  }

  public destroy(): void {
    try {
      window.electronAPI.removeAllListeners('project:changed');
    } catch (error) {
      console.error('Error cleaning up event listeners:', error);
    }
  }
}