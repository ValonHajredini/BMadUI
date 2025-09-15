import { TestBed } from '@angular/core/testing';
import { ProjectService } from './project.service';
import { BMadProject, ProjectScanResponse } from '../../../../../shared/interfaces/project.interface';

// Mock window.electronAPI
const mockElectronAPI = {
  invoke: jasmine.createSpy('invoke'),
  on: jasmine.createSpy('on'),
  removeAllListeners: jasmine.createSpy('removeAllListeners')
};

// Setup global mock
Object.defineProperty(window, 'electronAPI', {
  value: mockElectronAPI,
  writable: true
});

describe('ProjectService', () => {
  let service: ProjectService;

  const mockProject1: BMadProject = {
    id: 'project1',
    name: 'Test Project 1',
    path: '/Users/test/Projects/test-project-1',
    lastAccessed: new Date('2024-01-01'),
    agents: [],
    isActive: false
  };

  const mockProject2: BMadProject = {
    id: 'project2',
    name: 'Test Project 2',
    path: '/Users/test/Projects/test-project-2',
    lastAccessed: new Date('2024-01-02'),
    agents: [],
    isActive: false
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProjectService]
    });

    // Reset spies before creating service
    (mockElectronAPI.invoke as jasmine.Spy).calls.reset();
    (mockElectronAPI.on as jasmine.Spy).calls.reset();
    (mockElectronAPI.removeAllListeners as jasmine.Spy).calls.reset();

    service = TestBed.inject(ProjectService);
  });

  afterEach(() => {
    service.destroy();
  });

  describe('initialization', () => {
    it('should create service with empty initial state', () => {
      expect(service).toBeTruthy();
      expect(service.projects().length).toBe(0);
      expect(service.isScanning()).toBe(false);
      expect(service.scanError()).toBeNull();
      expect(service.selectedProject()).toBeNull();
      expect(service.hasProjects()).toBe(false);
      expect(service.isEmpty()).toBe(true);
      expect(service.projectCount()).toBe(0);
    });

    it('should setup event listeners on initialization', () => {
      expect(mockElectronAPI.on).toHaveBeenCalledWith('project:changed', jasmine.any(Function));
    });
  });

  describe('scanProjects', () => {
    it('should successfully scan and update projects', async () => {
      const mockResponse: ProjectScanResponse = {
        success: true,
        projects: [mockProject1, mockProject2]
      };

      (mockElectronAPI.invoke as jasmine.Spy).and.returnValue(Promise.resolve(mockResponse));

      await service.scanProjects();

      expect(mockElectronAPI.invoke).toHaveBeenCalledWith('project:scan', {});
      expect(service.projects().length).toBe(2);
      expect(service.isScanning()).toBe(false);
      expect(service.scanError()).toBeNull();
      expect(service.hasProjects()).toBe(true);
      expect(service.isEmpty()).toBe(false);
      expect(service.projectCount()).toBe(2);
    });

    it('should handle scan errors gracefully', async () => {
      const mockResponse: ProjectScanResponse = {
        success: false,
        projects: [],
        error: 'Permission denied'
      };

      (mockElectronAPI.invoke as jasmine.Spy).and.returnValue(Promise.resolve(mockResponse));

      await service.scanProjects();

      expect(service.projects().length).toBe(0);
      expect(service.isScanning()).toBe(false);
      expect(service.scanError()).toBe('Permission denied');
      expect(service.hasProjects()).toBe(false);
      expect(service.isEmpty()).toBe(true);
    });

    it('should handle IPC communication errors', async () => {
      (mockElectronAPI.invoke as jasmine.Spy).and.returnValue(Promise.reject(new Error('IPC communication failed')));

      await service.scanProjects();

      expect(service.projects().length).toBe(0);
      expect(service.isScanning()).toBe(false);
      expect(service.scanError()).toBe('IPC communication failed');
    });

    it('should pass custom paths to scan request', async () => {
      const customPaths = ['/custom/path1', '/custom/path2'];
      const mockResponse: ProjectScanResponse = {
        success: true,
        projects: []
      };

      (mockElectronAPI.invoke as jasmine.Spy).and.returnValue(Promise.resolve(mockResponse));

      await service.scanProjects(customPaths);

      expect(mockElectronAPI.invoke).toHaveBeenCalledWith('project:scan', { paths: customPaths });
    });

    it('should sort projects by last accessed date', async () => {
      const mockResponse: ProjectScanResponse = {
        success: true,
        projects: [mockProject1, mockProject2] // mockProject2 has later date
      };

      (mockElectronAPI.invoke as jasmine.Spy).and.returnValue(Promise.resolve(mockResponse));

      await service.scanProjects();

      const projects = service.projects();
      expect(projects[0].id).toBe('project2'); // Most recent first
      expect(projects[1].id).toBe('project1');
    });
  });

  describe('openProject', () => {
    it('should successfully open a project', async () => {
      const mockResponse = {
        success: true,
        project: mockProject1
      };

      (mockElectronAPI.invoke as jasmine.Spy).and.returnValue(Promise.resolve(mockResponse));

      // First set up some projects
      service['_projects'].set([mockProject1, mockProject2]);

      const result = await service.openProject('project1');

      expect(result).toBe(true);
      expect(mockElectronAPI.invoke).toHaveBeenCalledWith('project:open', 'project1');
      expect(service.selectedProject()).toEqual(mockProject1);
    });

    it('should handle open project errors', async () => {
      const mockResponse = {
        success: false,
        error: 'Project not found'
      };

      (mockElectronAPI.invoke as jasmine.Spy).and.returnValue(Promise.resolve(mockResponse));

      const result = await service.openProject('invalid-id');

      expect(result).toBe(false);
    });
  });

  describe('selectProject', () => {
    it('should update project selection state', () => {
      // Set up projects
      service['_projects'].set([mockProject1, mockProject2]);

      service.selectProject(mockProject1);

      const projects = service.projects();
      expect(projects.find(p => p.id === 'project1')?.isActive).toBe(true);
      expect(projects.find(p => p.id === 'project2')?.isActive).toBe(false);
      expect(service.selectedProject()).toEqual(mockProject1);
    });
  });

  describe('clearSelection', () => {
    it('should clear all project selections', () => {
      // Set up projects with one selected
      const projectsWithSelection = [
        { ...mockProject1, isActive: true },
        { ...mockProject2, isActive: false }
      ];
      service['_projects'].set(projectsWithSelection);
      service['_selectedProject'].set(mockProject1);

      service.clearSelection();

      const projects = service.projects();
      expect(projects.every(p => !p.isActive)).toBe(true);
      expect(service.selectedProject()).toBeNull();
    });
  });

  describe('deriveProjectName', () => {
    it('should derive names from kebab-case paths', () => {
      const name = service.deriveProjectName('/Users/test/my-awesome-project');
      expect(name).toBe('My Awesome Project');
    });

    it('should derive names from snake_case paths', () => {
      const name = service.deriveProjectName('/Users/test/my_awesome_project');
      expect(name).toBe('My Awesome Project');
    });

    it('should handle simple directory names', () => {
      const name = service.deriveProjectName('/Users/test/project');
      expect(name).toBe('Project');
    });

    it('should handle paths with trailing slashes', () => {
      const name = service.deriveProjectName('/Users/test/my-project/');
      expect(name).toBe('My Project');
    });

    it('should handle invalid paths gracefully', () => {
      const name = service.deriveProjectName('');
      expect(name).toBe('Unnamed Project');
    });
  });

  describe('getEmptyStateMessage', () => {
    it('should return no projects message when empty', () => {
      const message = service.getEmptyStateMessage();
      expect(message).toContain('No BMad projects found');
    });

    it('should return error message when scan failed', () => {
      service['_scanError'].set('Permission denied');
      const message = service.getEmptyStateMessage();
      expect(message).toContain('Error scanning for projects');
      expect(message).toContain('Permission denied');
    });

    it('should return scanning message when scanning', () => {
      service['_isScanning'].set(true);
      const message = service.getEmptyStateMessage();
      expect(message).toContain('Scanning for BMad projects');
    });
  });

  describe('refreshProjects', () => {
    it('should call scanProjects when refreshing', async () => {
      const mockResponse: ProjectScanResponse = {
        success: true,
        projects: []
      };

      (mockElectronAPI.invoke as jasmine.Spy).and.returnValue(Promise.resolve(mockResponse));

      await service.refreshProjects();

      expect(mockElectronAPI.invoke).toHaveBeenCalledWith('project:scan', {});
    });
  });

  describe('cleanup', () => {
    it('should remove event listeners on destroy', () => {
      service.destroy();

      expect(mockElectronAPI.removeAllListeners).toHaveBeenCalledWith('project:changed');
    });
  });

  describe('computed signals', () => {
    it('should correctly compute hasProjects', () => {
      expect(service.hasProjects()).toBe(false);

      service['_projects'].set([mockProject1]);
      expect(service.hasProjects()).toBe(true);
    });

    it('should correctly compute isEmpty', () => {
      expect(service.isEmpty()).toBe(true);

      service['_isScanning'].set(true);
      expect(service.isEmpty()).toBe(false);

      service['_isScanning'].set(false);
      service['_projects'].set([mockProject1]);
      expect(service.isEmpty()).toBe(false);
    });

    it('should correctly compute projectCount', () => {
      expect(service.projectCount()).toBe(0);

      service['_projects'].set([mockProject1, mockProject2]);
      expect(service.projectCount()).toBe(2);
    });
  });

  describe('event handling', () => {
    it('should trigger project scan when project:changed event is received', async () => {
      const mockResponse: ProjectScanResponse = {
        success: true,
        projects: []
      };

      (mockElectronAPI.invoke as jasmine.Spy).and.returnValue(Promise.resolve(mockResponse));

      // Get the callback function that was registered
      const onCallback = (mockElectronAPI.on as jasmine.Spy).calls.argsFor(0)[1];

      // Simulate the event
      await onCallback(mockProject1);

      expect(mockElectronAPI.invoke).toHaveBeenCalledWith('project:scan', {});
    });
  });
});