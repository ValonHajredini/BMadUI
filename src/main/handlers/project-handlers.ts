import { ipcMain, IpcMainInvokeEvent } from 'electron';
import log from 'electron-log';
import { ProjectScanner } from '../services/project-scanner';
import { ProjectScanRequest, ProjectScanResponse } from '../../shared/interfaces/project.interface';

export class ProjectHandlers {
  private projectScanner: ProjectScanner;

  constructor() {
    this.projectScanner = new ProjectScanner();
    this.setupHandlers();
    this.setupEventListeners();
  }

  private setupHandlers(): void {
    // Handle project:scan requests
    ipcMain.handle('project:scan', async (_event: IpcMainInvokeEvent, request: ProjectScanRequest): Promise<ProjectScanResponse> => {
      try {
        log.info('Received project scan request:', request);

        const projects = await this.projectScanner.scanForProjects(request?.paths);

        const response: ProjectScanResponse = {
          projects,
          success: true
        };

        log.info(`Project scan completed successfully. Found ${projects.length} projects`);
        return response;

      } catch (error) {
        log.error('Error during project scan:', error);

        const response: ProjectScanResponse = {
          projects: [],
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred during project scan'
        };

        return response;
      }
    });

    // Handle project:open requests (for future implementation)
    ipcMain.handle('project:open', async (_event: IpcMainInvokeEvent, projectId: string) => {
      try {
        log.info('Received project open request for:', projectId);

        // For now, just return the cached project data
        const cachedProjects = this.projectScanner.getCachedProjects();
        const project = cachedProjects.find(p => p.id === projectId);

        if (!project) {
          throw new Error(`Project with ID ${projectId} not found`);
        }

        // Update last accessed time
        project.lastAccessed = new Date();

        log.info('Project opened successfully:', project.name);
        return { success: true, project };

      } catch (error) {
        log.error('Error opening project:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred while opening project'
        };
      }
    });

    log.info('Project IPC handlers registered successfully');
  }

  private setupEventListeners(): void {
    // Listen for project changes and emit to renderer
    this.projectScanner.on('projectChanged', (changedProject) => {
      log.info('Project changed, notifying renderer:', changedProject.name);

      // Send event to all windows
      const { BrowserWindow } = require('electron');
      const windows = BrowserWindow.getAllWindows();

      windows.forEach((window: Electron.BrowserWindow) => {
        window.webContents.send('project:changed', changedProject);
      });
    });

    log.info('Project event listeners set up successfully');
  }

  public destroy(): void {
    this.projectScanner.destroy();
    ipcMain.removeHandler('project:scan');
    ipcMain.removeHandler('project:open');
    log.info('Project handlers cleaned up');
  }
}