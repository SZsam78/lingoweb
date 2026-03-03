export interface IElectronAPI {
    dbQuery: (sql: string, params: any[]) => Promise<any[]>;
    dbExecute: (sql: string, params: any[]) => Promise<any>;
    saveMedia: (name: string, data: Uint8Array) => Promise<{ path: string }>;
    logError: (message: string, stack?: string) => Promise<void>;
}

declare global {
    interface Window {
        electronAPI: IElectronAPI;
    }
}
