import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { ProjectScanner } from './project-scanner';
import { BMadProject } from '../../shared/interfaces/project.interface';

// Mock fs module
jest.mock('fs');
jest.mock('os');

const mockFs = fs as jest.Mocked<typeof fs>;
const mockOs = os as jest.Mocked<typeof os>;

describe('ProjectScanner', () => {
  let projectScanner: ProjectScanner;

  beforeEach(() => {
    projectScanner = new ProjectScanner();
    jest.clearAllMocks();
  });

  afterEach(() => {
    if (projectScanner) {
      projectScanner.destroy();
    }
  });

  describe('scanForProjects', () => {
    it('should find projects with .bmad-core directories', async () => {
      // Mock home directory
      mockOs.homedir.mockReturnValue('/Users/testuser');

      // Mock directory structure
      mockFs.existsSync.mockImplementation((dirPath: any) => {
        const pathStr = dirPath.toString();
        return pathStr.includes('/Users/testuser/Projects') ||
               pathStr.includes('/Users/testuser/Projects/project1/.bmad-core') ||
               pathStr.includes('/Users/testuser/Projects/project2/.bmad-core');
      });

      mockFs.statSync.mockImplementation((dirPath: any) => {
        return { isDirectory: () => true } as fs.Stats;
      });

      mockFs.readdirSync.mockImplementation((dirPath: any) => {
        const pathStr = dirPath.toString();
        if (pathStr.includes('/Users/testuser/Projects')) {
          return [
            { name: 'project1', isDirectory: () => true },
            { name: 'project2', isDirectory: () => true },
            { name: 'file.txt', isDirectory: () => false }
          ] as fs.Dirent[];
        }
        return [];
      });

      const projects = await projectScanner.scanForProjects();

      expect(projects).toHaveLength(2);
      expect(projects[0].name).toBe('project1');
      expect(projects[1].name).toBe('project2');
      expect(projects[0].path).toContain('project1');
      expect(projects[1].path).toContain('project2');
    });

    it('should handle permission errors gracefully', async () => {
      mockOs.homedir.mockReturnValue('/Users/testuser');

      mockFs.existsSync.mockImplementation((dirPath: any) => {
        const pathStr = dirPath.toString();
        return pathStr.includes('/Users/testuser/Projects');
      });

      mockFs.statSync.mockImplementation((dirPath: any) => {
        return { isDirectory: () => true } as fs.Stats;
      });

      // Mock permission error
      mockFs.readdirSync.mockImplementation((dirPath: any) => {
        throw new Error('EACCES: permission denied');
      });

      const projects = await projectScanner.scanForProjects();

      expect(projects).toHaveLength(0);
      // Should not throw error - handles gracefully
    });

    it('should respect maximum depth limit', async () => {
      mockOs.homedir.mockReturnValue('/Users/testuser');

      // Create very deep directory structure
      const deepPath = '/Users/testuser/Projects/level1/level2/level3/level4/level5/level6/project';

      mockFs.existsSync.mockImplementation((dirPath: any) => {
        const pathStr = dirPath.toString();
        return pathStr.includes('/Users/testuser/Projects') ||
               pathStr.includes(deepPath);
      });

      mockFs.statSync.mockImplementation((dirPath: any) => {
        return { isDirectory: () => true } as fs.Stats;
      });

      let readdirCallCount = 0;
      mockFs.readdirSync.mockImplementation((dirPath: any) => {
        readdirCallCount++;
        const pathStr = dirPath.toString();

        if (pathStr.includes('/Users/testuser/Projects') && readdirCallCount === 1) {
          return [{ name: 'level1', isDirectory: () => true }] as fs.Dirent[];
        }
        if (pathStr.includes('level1') && !pathStr.includes('level2')) {
          return [{ name: 'level2', isDirectory: () => true }] as fs.Dirent[];
        }
        if (pathStr.includes('level2') && !pathStr.includes('level3')) {
          return [{ name: 'level3', isDirectory: () => true }] as fs.Dirent[];
        }
        if (pathStr.includes('level3') && !pathStr.includes('level4')) {
          return [{ name: 'level4', isDirectory: () => true }] as fs.Dirent[];
        }
        if (pathStr.includes('level4') && !pathStr.includes('level5')) {
          return [{ name: 'level5', isDirectory: () => true }] as fs.Dirent[];
        }
        if (pathStr.includes('level5') && !pathStr.includes('level6')) {
          return [{ name: 'level6', isDirectory: () => true }] as fs.Dirent[];
        }

        return [];
      });

      const projects = await projectScanner.scanForProjects();

      // Should stop before reaching the deep project due to depth limit
      expect(projects).toHaveLength(0);
    });

    it('should complete within 5 second timeout', async () => {
      mockOs.homedir.mockReturnValue('/Users/testuser');

      mockFs.existsSync.mockImplementation((dirPath: any) => {
        const pathStr = dirPath.toString();
        return pathStr.includes('/Users/testuser/Projects');
      });

      mockFs.statSync.mockImplementation((dirPath: any) => {
        return { isDirectory: () => true } as fs.Stats;
      });

      // Mock slow directory read
      mockFs.readdirSync.mockImplementation((dirPath: any) => {
        // Simulate slow operation but not blocking
        return [];
      });

      const startTime = Date.now();
      const projects = await projectScanner.scanForProjects();
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(6000); // Should complete within 6 seconds (with buffer)
      expect(projects).toBeDefined();
    });

    it('should filter out node_modules and hidden directories', async () => {
      mockOs.homedir.mockReturnValue('/Users/testuser');

      mockFs.existsSync.mockImplementation((dirPath: any) => {
        const pathStr = dirPath.toString();
        return pathStr.includes('/Users/testuser/Projects');
      });

      mockFs.statSync.mockImplementation((dirPath: any) => {
        return { isDirectory: () => true } as fs.Stats;
      });

      mockFs.readdirSync.mockImplementation((dirPath: any) => {
        return [
          { name: 'node_modules', isDirectory: () => true },
          { name: '.git', isDirectory: () => true },
          { name: '.vscode', isDirectory: () => true },
          { name: 'dist', isDirectory: () => true },
          { name: 'validProject', isDirectory: () => true }
        ] as fs.Dirent[];
      });

      const projects = await projectScanner.scanForProjects();

      // Should only scan validProject directory, not the filtered ones
      expect(mockFs.readdirSync).toHaveBeenCalledWith(
        expect.stringContaining('validProject'),
        expect.any(Object)
      );
      expect(mockFs.readdirSync).not.toHaveBeenCalledWith(
        expect.stringContaining('node_modules'),
        expect.any(Object)
      );
    });
  });

  describe('createProjectFromPath', () => {
    it('should create valid project object', () => {
      const testPath = '/Users/testuser/Projects/my-awesome-project';

      // Access private method for testing
      const createProject = (projectScanner as any).createProjectFromPath.bind(projectScanner);
      const project: BMadProject = createProject(testPath);

      expect(project).toBeDefined();
      expect(project.name).toBe('my-awesome-project');
      expect(project.path).toBe(testPath);
      expect(project.id).toBeDefined();
      expect(project.lastAccessed).toBeInstanceOf(Date);
      expect(project.agents).toEqual([]);
      expect(project.isActive).toBe(false);
    });

    it('should handle invalid paths securely', () => {
      const maliciousPath = '/Users/testuser/Projects/../../../etc/passwd';

      const createProject = (projectScanner as any).createProjectFromPath.bind(projectScanner);
      const project = createProject(maliciousPath);

      expect(project).toBeNull();
    });

    it('should handle relative paths securely', () => {
      const relativePath = './relative/path';

      const createProject = (projectScanner as any).createProjectFromPath.bind(projectScanner);
      const project = createProject(relativePath);

      expect(project).toBeNull();
    });
  });

  describe('file system watching', () => {
    it('should emit events when projects change', (done) => {
      const mockWatcher = {
        close: jest.fn()
      };

      mockFs.watch = jest.fn().mockReturnValue(mockWatcher);

      // Mock a project for watching
      const testProject: BMadProject = {
        id: 'test-id',
        name: 'test-project',
        path: '/Users/testuser/Projects/test-project',
        lastAccessed: new Date(),
        agents: [],
        isActive: false
      };

      projectScanner.on('projectChanged', (changedProject) => {
        expect(changedProject).toEqual(testProject);
        done();
      });

      // Simulate setting up watchers
      const setupWatchers = (projectScanner as any).setupFileWatchers.bind(projectScanner);
      setupWatchers([testProject]);

      // Simulate file change event
      const watchCallback = (mockFs.watch as jest.Mock).mock.calls[0][2];
      watchCallback('change', '.bmad-core');
    });
  });

  describe('cache management', () => {
    it('should cache scanned projects', async () => {
      mockOs.homedir.mockReturnValue('/Users/testuser');

      mockFs.existsSync.mockImplementation((dirPath: any) => {
        const pathStr = dirPath.toString();
        return pathStr.includes('/Users/testuser/Projects') ||
               pathStr.includes('/Users/testuser/Projects/project1/.bmad-core');
      });

      mockFs.statSync.mockImplementation(() => ({ isDirectory: () => true } as fs.Stats));

      mockFs.readdirSync.mockImplementation((dirPath: any) => {
        const pathStr = dirPath.toString();
        if (pathStr.includes('/Users/testuser/Projects')) {
          return [{ name: 'project1', isDirectory: () => true }] as fs.Dirent[];
        }
        return [];
      });

      await projectScanner.scanForProjects();

      const cachedProjects = projectScanner.getCachedProjects();
      expect(cachedProjects).toHaveLength(1);
      expect(cachedProjects[0].name).toBe('project1');
    });

    it('should clear cache on destroy', () => {
      projectScanner.destroy();

      const cachedProjects = projectScanner.getCachedProjects();
      expect(cachedProjects).toHaveLength(0);
    });
  });
});