import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ProjectListComponent } from './project-list.component';
import { ProjectService } from '../../../../core/services/project.service';
import { BMadProject } from '../../../../../../../shared/interfaces/project.interface';

describe('ProjectListComponent', () => {
  let component: ProjectListComponent;
  let fixture: ComponentFixture<ProjectListComponent>;
  let mockProjectService: jasmine.SpyObj<ProjectService>;

  const mockProjects: BMadProject[] = [
    {
      id: '1',
      name: 'Test Project 1',
      path: '/path/to/project1',
      lastAccessed: new Date('2023-01-01'),
      agents: [],
      isActive: false
    },
    {
      id: '2',
      name: 'Test Project 2',
      path: '/path/to/project2',
      lastAccessed: new Date('2023-01-02'),
      agents: [],
      isActive: true
    }
  ];

  beforeEach(async () => {
    // Create mock signals
    const mockProjectsSignal = signal(mockProjects);
    const mockIsScanningSignal = signal(false);
    const mockScanErrorSignal = signal(null);
    const mockSelectedProjectSignal = signal(mockProjects[1]);
    const mockHasProjectsSignal = signal(true);
    const mockIsEmptySignal = signal(false);
    const mockProjectCountSignal = signal(2);

    // Create mock ProjectService with all required methods and signals
    mockProjectService = jasmine.createSpyObj('ProjectService', [
      'scanProjects',
      'selectProject',
      'clearSelection',
      'refreshProjects',
      'getEmptyStateMessage',
      'destroy'
    ]);

    // Mock signal properties as readonly
    Object.defineProperty(mockProjectService, 'projects', {
      value: mockProjectsSignal.asReadonly(),
      writable: false
    });
    Object.defineProperty(mockProjectService, 'isScanning', {
      value: mockIsScanningSignal.asReadonly(),
      writable: false
    });
    Object.defineProperty(mockProjectService, 'scanError', {
      value: mockScanErrorSignal.asReadonly(),
      writable: false
    });
    Object.defineProperty(mockProjectService, 'selectedProject', {
      value: mockSelectedProjectSignal.asReadonly(),
      writable: false
    });
    Object.defineProperty(mockProjectService, 'hasProjects', {
      value: mockHasProjectsSignal.asReadonly(),
      writable: false
    });
    Object.defineProperty(mockProjectService, 'isEmpty', {
      value: mockIsEmptySignal.asReadonly(),
      writable: false
    });
    Object.defineProperty(mockProjectService, 'projectCount', {
      value: mockProjectCountSignal.asReadonly(),
      writable: false
    });

    // Store references to writable signals for test manipulation
    (mockProjectService as any)._mockSignals = {
      projects: mockProjectsSignal,
      isScanning: mockIsScanningSignal,
      scanError: mockScanErrorSignal,
      selectedProject: mockSelectedProjectSignal,
      hasProjects: mockHasProjectsSignal,
      isEmpty: mockIsEmptySignal,
      projectCount: mockProjectCountSignal
    };

    // Mock method implementations
    mockProjectService.getEmptyStateMessage.and.returnValue('No projects found');
    mockProjectService.scanProjects.and.returnValue(Promise.resolve());
    mockProjectService.refreshProjects.and.returnValue(Promise.resolve());

    await TestBed.configureTestingModule({
      imports: [
        ProjectListComponent,
        NoopAnimationsModule
      ],
      providers: [
        { provide: ProjectService, useValue: mockProjectService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should scan projects on init if no projects are loaded and not scanning', () => {
      (mockProjectService as any)._mockSignals.hasProjects.set(false);
      (mockProjectService as any)._mockSignals.isScanning.set(false);
      fixture.detectChanges();

      expect(mockProjectService.scanProjects).toHaveBeenCalled();
    });

    it('should not scan projects on init if already scanning', () => {
      (mockProjectService as any)._mockSignals.hasProjects.set(false);
      (mockProjectService as any)._mockSignals.isScanning.set(true);
      mockProjectService.scanProjects.calls.reset();
      fixture.detectChanges();

      expect(mockProjectService.scanProjects).not.toHaveBeenCalled();
    });

    it('should not scan projects on init if projects already loaded', () => {
      (mockProjectService as any)._mockSignals.hasProjects.set(true);
      (mockProjectService as any)._mockSignals.isScanning.set(false);
      mockProjectService.scanProjects.calls.reset();
      fixture.detectChanges();

      expect(mockProjectService.scanProjects).not.toHaveBeenCalled();
    });
  });

  describe('Project Display', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should display all projects in the list', () => {
      const projectItems = fixture.debugElement.queryAll(By.css('.project-item'));
      expect(projectItems.length).toBe(2);
    });

    it('should display project names correctly', () => {
      const projectNames = fixture.debugElement.queryAll(By.css('.project-name'));
      expect(projectNames[0].nativeElement.textContent.trim()).toBe('Test Project 1');
      expect(projectNames[1].nativeElement.textContent.trim()).toBe('Test Project 2');
    });

    it('should display project paths correctly', () => {
      const projectPaths = fixture.debugElement.queryAll(By.css('.project-path'));
      expect(projectPaths[0].nativeElement.textContent.trim()).toBe('/path/to/project1');
      expect(projectPaths[1].nativeElement.textContent.trim()).toBe('/path/to/project2');
    });

    it('should show selection indicator for active project', () => {
      const selectionIndicators = fixture.debugElement.queryAll(By.css('.selection-indicator'));
      expect(selectionIndicators.length).toBe(1);
    });

    it('should apply selected class to active project', () => {
      const projectItems = fixture.debugElement.queryAll(By.css('.project-item'));
      expect(projectItems[0].nativeElement.classList.contains('selected')).toBeFalse();
      expect(projectItems[1].nativeElement.classList.contains('selected')).toBeTrue();
    });
  });

  describe('Loading State', () => {
    it('should show loading spinner when scanning', () => {
      (mockProjectService as any)._mockSignals.isScanning.set(true);
      fixture.detectChanges();

      const loadingState = fixture.debugElement.query(By.css('.loading-state'));
      const spinner = fixture.debugElement.query(By.css('mat-spinner'));
      expect(loadingState).toBeTruthy();
      expect(spinner).toBeTruthy();
    });

    it('should show loading text when scanning', () => {
      (mockProjectService as any)._mockSignals.isScanning.set(true);
      fixture.detectChanges();

      const loadingText = fixture.debugElement.query(By.css('.loading-text'));
      expect(loadingText.nativeElement.textContent.trim()).toBe('Scanning for projects...');
    });

    it('should hide project list when scanning', () => {
      (mockProjectService as any)._mockSignals.isScanning.set(true);
      fixture.detectChanges();

      const projectList = fixture.debugElement.query(By.css('.project-list'));
      expect(projectList).toBeFalsy();
    });
  });

  describe('Empty State', () => {
    beforeEach(() => {
      (mockProjectService as any)._mockSignals.projects.set([]);
      (mockProjectService as any)._mockSignals.hasProjects.set(false);
      (mockProjectService as any)._mockSignals.isEmpty.set(true);
      (mockProjectService as any)._mockSignals.isScanning.set(false);
      (mockProjectService as any)._mockSignals.scanError.set(null);
      (mockProjectService as any)._mockSignals.projectCount.set(0);
    });

    it('should show empty state when no projects and not scanning', () => {
      fixture.detectChanges();

      const emptyState = fixture.debugElement.query(By.css('.empty-state'));
      expect(emptyState).toBeTruthy();
    });

    it('should display empty state message', () => {
      fixture.detectChanges();

      const emptyText = fixture.debugElement.query(By.css('.empty-text'));
      expect(emptyText.nativeElement.textContent.trim()).toBe('No projects found');
    });
  });

  describe('Error State', () => {
    beforeEach(() => {
      (mockProjectService as any)._mockSignals.projects.set([]);
      (mockProjectService as any)._mockSignals.hasProjects.set(false);
      (mockProjectService as any)._mockSignals.isScanning.set(false);
      (mockProjectService as any)._mockSignals.scanError.set('Permission denied');
      (mockProjectService as any)._mockSignals.projectCount.set(0);
    });

    it('should show error state when scan error exists', () => {
      fixture.detectChanges();

      const errorState = fixture.debugElement.query(By.css('.error-state'));
      expect(errorState).toBeTruthy();
    });

    it('should display error message', () => {
      fixture.detectChanges();

      const errorText = fixture.debugElement.query(By.css('.error-text'));
      expect(errorText.nativeElement.textContent.trim()).toBe('No projects found');
    });

    it('should show retry button', () => {
      fixture.detectChanges();

      const retryButton = fixture.debugElement.query(By.css('.retry-button'));
      expect(retryButton).toBeTruthy();
    });
  });

  describe('Project Selection', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should call selectProject when project is clicked', () => {
      const projectItems = fixture.debugElement.queryAll(By.css('.project-item'));

      projectItems[0].nativeElement.click();

      expect(mockProjectService.selectProject).toHaveBeenCalledWith(mockProjects[0]);
    });

    it('should update focused index when project is clicked', () => {
      const projectItems = fixture.debugElement.queryAll(By.css('.project-item'));

      projectItems[0].nativeElement.click();

      expect(component.focusedIndex()).toBe(0);
    });
  });

  describe('Keyboard Navigation', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should move focus down with ArrowDown key', () => {
      const container = fixture.debugElement.query(By.css('.project-list-container'));
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });

      container.nativeElement.dispatchEvent(event);
      fixture.detectChanges();

      expect(component.focusedIndex()).toBe(0);
      expect(mockProjectService.selectProject).toHaveBeenCalledWith(mockProjects[0]);
    });

    it('should move focus up with ArrowUp key', () => {
      // Set initial focus to index 1
      component.onProjectClick(mockProjects[1], 1);
      fixture.detectChanges();

      const container = fixture.debugElement.query(By.css('.project-list-container'));
      const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });

      container.nativeElement.dispatchEvent(event);
      fixture.detectChanges();

      expect(component.focusedIndex()).toBe(0);
    });

    it('should wrap to last item when ArrowUp at first item', () => {
      // Set focus to first item
      component.onProjectClick(mockProjects[0], 0);
      fixture.detectChanges();

      const container = fixture.debugElement.query(By.css('.project-list-container'));
      const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });

      container.nativeElement.dispatchEvent(event);
      fixture.detectChanges();

      expect(component.focusedIndex()).toBe(1);
    });

    it('should wrap to first item when ArrowDown at last item', () => {
      // Set focus to last item
      component.onProjectClick(mockProjects[1], 1);
      fixture.detectChanges();

      const container = fixture.debugElement.query(By.css('.project-list-container'));
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });

      container.nativeElement.dispatchEvent(event);
      fixture.detectChanges();

      expect(component.focusedIndex()).toBe(0);
    });

    it('should select focused project with Enter key', () => {
      // Set focus to first item
      component.onProjectClick(mockProjects[0], 0);
      mockProjectService.selectProject.calls.reset();
      fixture.detectChanges();

      const container = fixture.debugElement.query(By.css('.project-list-container'));
      const event = new KeyboardEvent('keydown', { key: 'Enter' });

      container.nativeElement.dispatchEvent(event);
      fixture.detectChanges();

      expect(mockProjectService.selectProject).toHaveBeenCalledWith(mockProjects[0]);
    });

    it('should clear selection with Escape key', () => {
      const container = fixture.debugElement.query(By.css('.project-list-container'));
      const event = new KeyboardEvent('keydown', { key: 'Escape' });

      container.nativeElement.dispatchEvent(event);
      fixture.detectChanges();

      expect(mockProjectService.clearSelection).toHaveBeenCalled();
      expect(component.focusedIndex()).toBe(-1);
    });
  });

  describe('Refresh Functionality', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should call refreshProjects when refresh button is clicked', () => {
      const refreshButton = fixture.debugElement.query(By.css('button[matTooltip="Refresh project list"]'));

      refreshButton.nativeElement.click();

      expect(mockProjectService.refreshProjects).toHaveBeenCalled();
    });

    it('should disable refresh button when scanning', () => {
      (mockProjectService as any)._mockSignals.isScanning.set(true);
      fixture.detectChanges();

      const refreshButton = fixture.debugElement.query(By.css('button[matTooltip="Refresh project list"]'));
      expect(refreshButton.nativeElement.disabled).toBeTrue();
    });

    it('should call refreshProjects when retry button is clicked in error state', () => {
      (mockProjectService as any)._mockSignals.projects.set([]);
      (mockProjectService as any)._mockSignals.hasProjects.set(false);
      (mockProjectService as any)._mockSignals.isScanning.set(false);
      (mockProjectService as any)._mockSignals.scanError.set('Error message');
      fixture.detectChanges();

      const retryButton = fixture.debugElement.query(By.css('.retry-button'));
      retryButton.nativeElement.click();

      expect(mockProjectService.refreshProjects).toHaveBeenCalled();
    });
  });

  describe('Project Count Display', () => {
    it('should show singular project count', () => {
      (mockProjectService as any)._mockSignals.projects.set([mockProjects[0]]);
      (mockProjectService as any)._mockSignals.projectCount.set(1);
      fixture.detectChanges();

      const countFooter = fixture.debugElement.query(By.css('.project-count-text'));
      expect(countFooter.nativeElement.textContent.trim()).toBe('1 project found');
    });

    it('should show plural project count', () => {
      fixture.detectChanges();

      const countFooter = fixture.debugElement.query(By.css('.project-count-text'));
      expect(countFooter.nativeElement.textContent.trim()).toBe('2 projects found');
    });
  });

  describe('Date Formatting', () => {
    it('should format recent dates as "Today"', () => {
      const today = new Date();
      const result = component.formatLastAccessed(today);
      expect(result).toBe('Today');
    });

    it('should format yesterday dates as "Yesterday"', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const result = component.formatLastAccessed(yesterday);
      expect(result).toBe('Yesterday');
    });

    it('should format days ago for recent dates', () => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      const result = component.formatLastAccessed(threeDaysAgo);
      expect(result).toBe('3 days ago');
    });

    it('should format old dates as locale date string', () => {
      const oldDate = new Date('2020-01-01');
      const result = component.formatLastAccessed(oldDate);
      expect(result).toBe(oldDate.toLocaleDateString());
    });

    it('should handle invalid dates gracefully', () => {
      const invalidDate = new Date('invalid');
      const result = component.formatLastAccessed(invalidDate);
      expect(result).toBe('Unknown');
    });
  });

  describe('Component Cleanup', () => {
    it('should call destroy on service when component is destroyed', () => {
      component.ngOnDestroy();
      expect(mockProjectService.destroy).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should have proper ARIA labels on container', () => {
      const container = fixture.debugElement.query(By.css('.project-list-container'));
      expect(container.nativeElement.getAttribute('aria-label')).toBe('Project list with 2 projects');
    });

    it('should have proper role on project list', () => {
      const projectList = fixture.debugElement.query(By.css('.project-list'));
      expect(projectList.nativeElement.getAttribute('role')).toBe('listbox');
      expect(projectList.nativeElement.getAttribute('aria-label')).toBe('List of 2 projects');
    });

    it('should have proper ARIA attributes on project items', () => {
      const projectItems = fixture.debugElement.queryAll(By.css('.project-item'));

      expect(projectItems[0].nativeElement.getAttribute('role')).toBe('option');
      expect(projectItems[0].nativeElement.getAttribute('aria-selected')).toBe('false');
      expect(projectItems[0].nativeElement.getAttribute('aria-posinset')).toBe('1');
      expect(projectItems[0].nativeElement.getAttribute('aria-setsize')).toBe('2');

      expect(projectItems[1].nativeElement.getAttribute('aria-selected')).toBe('true');
      expect(projectItems[1].nativeElement.getAttribute('aria-posinset')).toBe('2');
    });
  });

  describe('Tooltip Generation', () => {
    it('should generate correct tooltip for project', () => {
      const project = mockProjects[0];
      const tooltip = component.getProjectTooltip(project);
      const expectedDate = new Date(project.lastAccessed).toLocaleDateString();
      expect(tooltip).toBe(`Path: ${project.path}\nLast accessed: ${expectedDate}`);
    });
  });

  describe('TrackBy Function', () => {
    it('should return project ID for trackBy', () => {
      const result = component.trackByProjectId(0, mockProjects[0]);
      expect(result).toBe('1');
    });
  });
});