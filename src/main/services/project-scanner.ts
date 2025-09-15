import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as crypto from 'crypto';
import { EventEmitter } from 'events';
import { BMadProject } from '../../shared/interfaces/project.interface';

export class ProjectScanner extends EventEmitter {
  private cache: Map<string, BMadProject> = new Map();
  private watchers: Map<string, fs.FSWatcher> = new Map();
  private readonly MAX_DEPTH = 5;
  private readonly SCAN_TIMEOUT = 5000; // 5 seconds as per AC#3

  constructor() {
    super();
  }

  async scanForProjects(customPaths?: string[]): Promise<BMadProject[]> {
    const startTime = Date.now();
    const projects: BMadProject[] = [];

    try {
      const scanPaths = customPaths || this.getDefaultScanPaths();

      for (const scanPath of scanPaths) {
        if (Date.now() - startTime > this.SCAN_TIMEOUT) {
          console.warn(`Scan timeout reached, stopping at ${scanPath}`);
          break;
        }

        try {
          const foundProjects = await this.scanDirectory(scanPath, 0);
          projects.push(...foundProjects);
        } catch (error) {
          console.warn(`Permission error scanning ${scanPath}:`, error);
          // Gracefully continue with other paths (AC#4)
        }
      }

      // Update cache and setup watchers
      this.updateCache(projects);
      await this.setupFileWatchers(projects);

      return projects;
    } catch (error) {
      console.error('Error during project scan:', error);
      throw error;
    }
  }

  private getDefaultScanPaths(): string[] {
    const homeDir = os.homedir();
    return [
      path.join(homeDir, 'Projects'),
      path.join(homeDir, 'Code'),
      path.join(homeDir, 'Development'),
      path.join(homeDir, 'workspace'),
      path.join(homeDir, 'dev')
    ].filter(dirPath => {
      try {
        return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
      } catch {
        return false;
      }
    });
  }

  private async scanDirectory(dirPath: string, depth: number): Promise<BMadProject[]> {
    const projects: BMadProject[] = [];

    if (depth > this.MAX_DEPTH) {
      return projects;
    }

    try {
      // Normalize path to prevent traversal attacks
      const normalizedPath = path.normalize(dirPath);

      // Check if this directory contains .bmad-core
      const bmadCorePath = path.join(normalizedPath, '.bmad-core');
      if (fs.existsSync(bmadCorePath) && fs.statSync(bmadCorePath).isDirectory()) {
        const project = this.createProjectFromPath(normalizedPath);
        if (project) {
          projects.push(project);
        }
        // Don't scan subdirectories of project directories
        return projects;
      }

      // Scan subdirectories
      const entries = fs.readdirSync(normalizedPath, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isDirectory() && !entry.name.startsWith('.') && !this.isNodeModules(entry.name)) {
          const subDirPath = path.join(normalizedPath, entry.name);
          try {
            const subProjects = await this.scanDirectory(subDirPath, depth + 1);
            projects.push(...subProjects);
          } catch (error) {
            // Permission error on subdirectory - continue with others
            continue;
          }
        }
      }
    } catch (error) {
      // Re-throw to be handled by caller
      throw error;
    }

    return projects;
  }

  private createProjectFromPath(projectPath: string): BMadProject | null {
    try {
      const normalizedPath = path.normalize(projectPath);
      const projectName = path.basename(normalizedPath);

      // Enhanced security validation
      if (normalizedPath.includes('..') ||
          !path.isAbsolute(normalizedPath) ||
          normalizedPath.includes('\0') || // Null byte injection protection
          normalizedPath.length > 4096) {   // Prevent extremely long paths
        console.warn(`Invalid project path detected: ${projectPath.substring(0, 100)}...`);
        return null;
      }

      // Additional validation: ensure path is within reasonable bounds
      const homeDir = os.homedir();
      if (!normalizedPath.startsWith(homeDir) &&
          !normalizedPath.startsWith('/usr/local/') &&
          !normalizedPath.startsWith('/opt/')) {
        console.warn(`Project path outside safe boundaries: ${projectPath.substring(0, 100)}...`);
        return null;
      }

      // Generate secure, unique ID using crypto-style hash
      const id = crypto.createHash('sha256').update(normalizedPath).digest('hex').substring(0, 16);

      const project: BMadProject = {
        id,
        name: projectName,
        path: normalizedPath,
        lastAccessed: new Date(),
        agents: [], // Empty for this story
        isActive: false
      };

      return project;
    } catch (error) {
      // Don't expose full path in error messages for security
      console.error(`Error creating project from path [REDACTED]:`, error.message);
      return null;
    }
  }

  private isNodeModules(dirName: string): boolean {
    return dirName === 'node_modules' ||
           dirName === '.git' ||
           dirName === '.vscode' ||
           dirName === '.idea' ||
           dirName === 'dist' ||
           dirName === 'build';
  }

  private updateCache(projects: BMadProject[]): void {
    // Clear existing cache
    this.cache.clear();

    // Add new projects to cache
    for (const project of projects) {
      this.cache.set(project.id, project);
    }
  }

  private async setupFileWatchers(projects: BMadProject[]): Promise<void> {
    // Clean up existing watchers
    this.cleanupWatchers();

    for (const project of projects) {
      try {
        const watcher = fs.watch(project.path, { recursive: false }, (_eventType, filename) => {
          if (filename === '.bmad-core') {
            // Project structure changed - emit event for re-scan
            this.emit('projectChanged', project);
          }
        });

        this.watchers.set(project.id, watcher);
      } catch (error) {
        console.warn(`Could not set up watcher for ${project.path}:`, error);
      }
    }
  }

  private cleanupWatchers(): void {
    for (const [projectId, watcher] of this.watchers) {
      try {
        watcher.close();
      } catch (error) {
        console.warn(`Error closing watcher for project ${projectId}:`, error);
      }
    }
    this.watchers.clear();
  }

  getCachedProjects(): BMadProject[] {
    return Array.from(this.cache.values());
  }

  destroy(): void {
    this.cleanupWatchers();
    this.cache.clear();
    this.removeAllListeners();
  }
}