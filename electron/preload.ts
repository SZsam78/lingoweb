import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
    dbQuery: (sql: string, params: any[]) => ipcRenderer.invoke('db-query', sql, params),
    dbExecute: (sql: string, params: any[]) => ipcRenderer.invoke('db-execute', sql, params),
    saveMedia: (name: string, data: Uint8Array) => ipcRenderer.invoke('save-media', name, data),
    logError: (message: string, stack?: string) => ipcRenderer.invoke('log-error', message, stack),
});
