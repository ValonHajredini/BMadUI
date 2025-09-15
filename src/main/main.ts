import { app, BrowserWindow, Menu, shell } from 'electron';
import * as path from 'path';
import * as isDev from 'electron-is-dev';
import log from 'electron-log';
import { ProjectHandlers } from './handlers/project-handlers';

// Configure logging
log.transports.file.resolvePathFn = () => path.join(app.getPath('userData'), 'logs', 'main.log');
log.transports.file.level = 'info';
log.transports.console.level = isDev ? 'debug' : 'info';

export class BMadApplication {
  private mainWindow: BrowserWindow | null = null;
  private projectHandlers: ProjectHandlers | null = null;

  constructor() {
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    // This method will be called when Electron has finished initialization
    app.whenReady().then(() => {
      this.setupIPC();
      this.createWindow();
      this.createMenu();

      app.on('activate', () => {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) {
          this.createWindow();
        }
      });
    });

    // Quit when all windows are closed, except on macOS
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        this.cleanup();
        app.quit();
      }
    });

    // Handle app quit
    app.on('before-quit', () => {
      this.cleanup();
    });

    // Security: Prevent new window creation
    app.on('web-contents-created', (_, contents) => {
      contents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
      });
    });

    // Handle app activation (macOS)
    app.on('activate', () => {
      if (this.mainWindow === null) {
        this.createWindow();
      }
    });
  }

  private setupIPC(): void {
    log.info('Setting up IPC handlers');
    try {
      this.projectHandlers = new ProjectHandlers();
      log.info('Project handlers initialized successfully');
    } catch (error) {
      log.error('Failed to initialize project handlers:', error);
    }
  }

  private cleanup(): void {
    log.info('Cleaning up application resources');
    if (this.projectHandlers) {
      this.projectHandlers.destroy();
      this.projectHandlers = null;
    }
  }

  private createWindow(): void {
    log.info('Creating main application window');

    // Create the browser window with minimum 1200x800 sizing
    this.mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      minWidth: 1200,
      minHeight: 800,
      title: 'BMad GUI - AI-Powered Desktop Assistant',
      icon: isDev
        ? path.join(__dirname, '../../assets/icon.png')
        : path.join(__dirname, '../assets/icon.png'),
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js'),
        webSecurity: true,
        allowRunningInsecureContent: false,
      },
      show: false, // Don't show until ready-to-show
      titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    });

    // Load the Angular app
    const startUrl = isDev
      ? 'http://localhost:4200'
      : `file://${path.join(__dirname, '../renderer/index.html')}`;

    this.mainWindow.loadURL(startUrl);

    // Show window when ready to prevent visual flash
    this.mainWindow.once('ready-to-show', () => {
      if (this.mainWindow) {
        this.mainWindow.show();

        // Focus window on creation
        if (isDev) {
          this.mainWindow.webContents.openDevTools();
        }
      }
    });

    // Handle window closed
    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });

    // Handle external links
    this.mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url);
      return { action: 'deny' };
    });

    log.info('Main window created successfully');
  }

  private createMenu(): void {
    const template: Electron.MenuItemConstructorOptions[] = [
      {
        label: 'File',
        submenu: [
          {
            label: 'New Project',
            accelerator: 'CmdOrCtrl+N',
            click: () => {
              // TODO: Implement new project functionality
              log.info('New Project clicked');
            }
          },
          {
            label: 'Open Project',
            accelerator: 'CmdOrCtrl+O',
            click: () => {
              // TODO: Implement open project functionality
              log.info('Open Project clicked');
            }
          },
          { type: 'separator' },
          {
            label: 'Exit',
            accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
            click: () => {
              app.quit();
            }
          }
        ]
      },
      {
        label: 'Edit',
        submenu: [
          { role: 'undo' },
          { role: 'redo' },
          { type: 'separator' },
          { role: 'cut' },
          { role: 'copy' },
          { role: 'paste' }
        ]
      },
      {
        label: 'View',
        submenu: [
          { role: 'reload' },
          { role: 'forceReload' },
          { role: 'toggleDevTools' },
          { type: 'separator' },
          { role: 'resetZoom' },
          { role: 'zoomIn' },
          { role: 'zoomOut' },
          { type: 'separator' },
          { role: 'togglefullscreen' }
        ]
      },
      {
        label: 'Window',
        submenu: [
          { role: 'minimize' },
          { role: 'close' }
        ]
      },
      {
        label: 'Help',
        submenu: [
          {
            label: 'About BMad GUI',
            click: () => {
              // TODO: Implement about dialog
              log.info('About BMad GUI clicked');
            }
          }
        ]
      }
    ];

    // macOS specific menu adjustments
    if (process.platform === 'darwin') {
      template.unshift({
        label: app.getName(),
        submenu: [
          { role: 'about' },
          { type: 'separator' },
          { role: 'services' },
          { type: 'separator' },
          { role: 'hide' },
          { role: 'hideOthers' },
          { role: 'unhide' },
          { type: 'separator' },
          { role: 'quit' }
        ]
      });

      // Window menu adjustments for macOS
      (template[4].submenu as Electron.MenuItemConstructorOptions[]).push(
        { type: 'separator' },
        {
          label: 'Bring All to Front',
          role: 'front'
        }
      );
    }

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    log.info('Application menu created');
  }

  public getMainWindow(): BrowserWindow | null {
    return this.mainWindow;
  }
}

// Global error handling
process.on('uncaughtException', (error) => {
  log.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  log.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Initialize the application
const bmadApp = new BMadApplication();

export default bmadApp;