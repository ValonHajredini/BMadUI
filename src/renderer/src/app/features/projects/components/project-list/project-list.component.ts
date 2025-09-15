import { Component, computed, effect, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { BMadProject } from '../../../../../../../shared/interfaces/project.interface';
import { ProjectService } from '../../../../core/services/project.service';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatButtonModule
  ],
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.scss']
})
export class ProjectListComponent implements OnInit, OnDestroy {
  // Local state for keyboard navigation
  private readonly _focusedIndex = signal<number>(-1);

  // Public computed signals for template access
  public readonly projects: typeof this.projectService.projects;
  public readonly isScanning: typeof this.projectService.isScanning;
  public readonly scanError: typeof this.projectService.scanError;
  public readonly selectedProject: typeof this.projectService.selectedProject;
  public readonly hasProjects: typeof this.projectService.hasProjects;
  public readonly isEmpty: typeof this.projectService.isEmpty;
  public readonly projectCount: typeof this.projectService.projectCount;

  // Computed signals for UI state
  public readonly focusedIndex = this._focusedIndex.asReadonly();
  public readonly emptyStateMessage = computed(() => this.projectService.getEmptyStateMessage());
  public readonly showEmptyState = computed(() =>
    !this.isScanning() && !this.hasProjects() && !this.scanError()
  );
  public readonly showErrorState = computed(() =>
    !this.isScanning() && !!this.scanError()
  );

  constructor(private projectService: ProjectService) {
    // Initialize service references
    this.projects = this.projectService.projects;
    this.isScanning = this.projectService.isScanning;
    this.scanError = this.projectService.scanError;
    this.selectedProject = this.projectService.selectedProject;
    this.hasProjects = this.projectService.hasProjects;
    this.isEmpty = this.projectService.isEmpty;
    this.projectCount = this.projectService.projectCount;

    // Effect to reset focus when projects change
    effect(() => {
      const projects = this.projects();
      if (projects.length === 0) {
        this._focusedIndex.set(-1);
      }
    });
  }

  ngOnInit(): void {
    // Initial project scan if no projects are loaded
    if (!this.hasProjects() && !this.isScanning()) {
      this.projectService.scanProjects();
    }
  }

  ngOnDestroy(): void {
    this.projectService.destroy();
  }

  public onProjectClick(project: BMadProject, index: number): void {
    this.projectService.selectProject(project);
    this._focusedIndex.set(index);
  }

  public onKeyDown(event: KeyboardEvent): void {
    const projects = this.projects();
    if (projects.length === 0) return;

    const currentIndex = this._focusedIndex();
    let newIndex = currentIndex;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        newIndex = currentIndex < projects.length - 1 ? currentIndex + 1 : 0;
        break;
      case 'ArrowUp':
        event.preventDefault();
        newIndex = currentIndex > 0 ? currentIndex - 1 : projects.length - 1;
        break;
      case 'Enter':
        event.preventDefault();
        if (this.isValidProjectIndex(currentIndex, projects.length)) {
          this.onProjectClick(projects[currentIndex], currentIndex);
        }
        break;
      case 'Escape':
        event.preventDefault();
        this.projectService.clearSelection();
        this._focusedIndex.set(-1);
        break;
      default:
        return;
    }

    if (newIndex !== currentIndex) {
      this._focusedIndex.set(newIndex);
      this.projectService.selectProject(projects[newIndex]);
    }
  }

  private isValidProjectIndex(index: number, projectCount: number): boolean {
    return index >= 0 && index < projectCount;
  }

  public onRefreshClick(): void {
    this.projectService.refreshProjects();
  }

  public getProjectTooltip(project: BMadProject): string {
    const lastAccessed = new Date(project.lastAccessed).toLocaleDateString();
    return `Path: ${project.path}\nLast accessed: ${lastAccessed}`;
  }

  public isProjectSelected(project: BMadProject): boolean {
    return project.isActive || false;
  }

  public isProjectFocused(index: number): boolean {
    return this._focusedIndex() === index;
  }

  public formatLastAccessed(date: Date): string {
    try {
      const now = new Date();
      const projectDate = new Date(date);

      // Check for invalid date
      if (isNaN(projectDate.getTime())) {
        return 'Unknown';
      }

      const diffTime = Math.abs(now.getTime() - projectDate.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        return 'Today';
      } else if (diffDays === 1) {
        return 'Yesterday';
      } else if (diffDays <= 7) {
        return `${diffDays} days ago`;
      } else {
        return projectDate.toLocaleDateString();
      }
    } catch (error) {
      return 'Unknown';
    }
  }

  public trackByProjectId(index: number, project: BMadProject): string {
    return project.id;
  }
}