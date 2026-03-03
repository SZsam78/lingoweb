import { app, BrowserWindow, ipcMain, IpcMainInvokeEvent, protocol } from 'electron';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';
import { ALL_LESSONS } from '../src/content/all-lessons';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.DIST = path.join(__dirname, '../dist');
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public');

const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];

// Must register scheme as privileged BEFORE app is ready so it bypasses CSP and behaves like http/https
protocol.registerSchemesAsPrivileged([
    {
        scheme: 'asset',
        privileges: {
            standard: true,
            secure: true,
            supportFetchAPI: true,
            bypassCSP: true,
            corsEnabled: true,
            allowServiceWorkers: true
        }
    }
]);

let win: BrowserWindow | null;

function createWindow() {
    win = new BrowserWindow({
        icon: path.join(process.env.VITE_PUBLIC!, 'electron-vite.svg'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },
        width: 1200,
        height: 800,
    });

    if (VITE_DEV_SERVER_URL) {
        win.loadURL(VITE_DEV_SERVER_URL);
    } else {
        win.loadFile(path.join(process.env.DIST!, 'index.html'));
    }
}

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
        win = null;
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

app.whenReady().then(() => {
    protocol.registerFileProtocol('asset', (request, callback) => {
        const url = request.url.slice('asset://'.length);
        const decodedUrl = decodeURI(url);
        const filePath = path.join(app.getPath('userData'), 'media', decodedUrl);
        callback({ path: filePath });
    });
    createWindow();
});

// --- SQLite Database Setup ---
const dbPath = path.join(app.getPath('userData'), 'lingolume.db');
console.log('Database Path:', dbPath);
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS lessons (
    id TEXT PRIMARY KEY,
    moduleId TEXT,
    title TEXT,
    content_json TEXT, -- Complete Lesson schema as JSON
    isPublished INTEGER DEFAULT 0,
    updatedAt TEXT
  );

  CREATE TABLE IF NOT EXISTS media (
    id TEXT PRIMARY KEY,
    originalName TEXT,
    fileName TEXT,
    mimeType TEXT,
    path TEXT,
    createdAt TEXT
  );

  CREATE TABLE IF NOT EXISTS progress (
    id TEXT PRIMARY KEY,
    itemId TEXT,
    status TEXT,
    attempts INTEGER,
    lastAnswer TEXT,
    lastResult TEXT,
    updatedAt TEXT
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

// --- Auto-Seeding Logic ---
function seedDatabase() {
    try {
        const count = (db.prepare('SELECT count(*) as count FROM lessons').get() as any).count;
        if (count === 0) {
            console.log('Database empty, starting auto-seed from bundle...');
            ALL_LESSONS.forEach((lesson: any) => {
                db.prepare(`
                    INSERT INTO lessons (id, moduleId, title, content_json, isPublished, updatedAt)
                    VALUES (?, ?, ?, ?, ?, ?)
                    ON CONFLICT(id) DO UPDATE SET
                        title = excluded.title,
                        content_json = excluded.content_json,
                        isPublished = excluded.isPublished,
                        updatedAt = excluded.updatedAt
                `).run(lesson.id, lesson.moduleId, lesson.title, JSON.stringify(lesson), 1, new Date().toISOString());
            });
            console.log(`Seeded ${ALL_LESSONS.length} lessons into database.`);
        }
    } catch (err) {
        console.error('Seeding failed:', err);
    }
}

seedDatabase();

// IPC Handlers
ipcMain.handle('db-query', (_event: IpcMainInvokeEvent, sql: string, params: any[]) => {
    return db.prepare(sql).all(...(params || []));
});

ipcMain.handle('db-execute', (_event: IpcMainInvokeEvent, sql: string, params: any[]) => {
    return db.prepare(sql).run(...(params || []));
});

ipcMain.handle('save-media', async (_event: IpcMainInvokeEvent, name: string, data: Uint8Array) => {
    const mediaDir = path.join(app.getPath('userData'), 'media');
    if (!fs.existsSync(mediaDir)) {
        fs.mkdirSync(mediaDir, { recursive: true });
    }
    const filePath = path.join(mediaDir, name);
    fs.writeFileSync(filePath, Buffer.from(data));
    return { path: filePath };
});

ipcMain.handle('log-error', async (_event: IpcMainInvokeEvent, message: string, stack?: string) => {
    const logDir = path.join(app.getPath('userData'), 'logs');
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }
    const logFile = path.join(logDir, 'error.log');
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ERROR: ${message}\nStack: ${stack || 'N/A'}\n\n`;
    console.error(logEntry);
    fs.appendFileSync(logFile, logEntry);
});
