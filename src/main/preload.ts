import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // System information
  platform: process.platform,

  // IPC communication methods
  invoke: (channel: string, data?: any) => {
    // Whitelist channels for security
    const validChannels = [
      'app:getVersion',
      'project:scan',
      'project:open',
      'conversation:create',
      'conversation:get',
      'conversation:update',
      'conversation:delete',
      'agent:execute',
      'log:info',
      'log:error',
      'log:debug'
    ];

    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, data);
    } else {
      throw new Error(`Invalid IPC channel: ${channel}`);
    }
  },

  // Event listeners for main process events
  on: (channel: string, callback: Function) => {
    const validChannels = [
      'project:changed',
      'conversation:updated',
      'agent:status',
      'app:error'
    ];

    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (_, ...args) => callback(...args));
    } else {
      throw new Error(`Invalid IPC channel: ${channel}`);
    }
  },

  // Remove event listeners
  removeAllListeners: (channel: string) => {
    const validChannels = [
      'project:changed',
      'conversation:updated',
      'agent:status',
      'app:error'
    ];

    if (validChannels.includes(channel)) {
      ipcRenderer.removeAllListeners(channel);
    }
  }
});

// Expose a minimal API for error reporting
contextBridge.exposeInMainWorld('errorAPI', {
  reportError: (error: Error, context?: string) => {
    ipcRenderer.invoke('log:error', {
      message: error.message,
      stack: error.stack,
      context: context || 'renderer',
      timestamp: new Date().toISOString()
    });
  }
});

// Type definitions for the exposed APIs
export interface ElectronAPI {
  platform: string;
  invoke: (channel: string, data?: any) => Promise<any>;
  on: (channel: string, callback: Function) => void;
  removeAllListeners: (channel: string) => void;
}

export interface ErrorAPI {
  reportError: (error: Error, context?: string) => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
    errorAPI: ErrorAPI;
  }
}