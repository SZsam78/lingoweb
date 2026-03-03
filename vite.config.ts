import { defineConfig } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron';
import renderer from 'vite-plugin-electron-renderer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Check if we are building for Electron
const isElectron = process.env.VITE_ELECTRON === 'true';
const isVercel = !!process.env.VERCEL;

export default defineConfig({
    plugins: [
        react(),
        ...(isElectron && !isVercel ? [
            electron([
                {
                    entry: 'electron/main.ts',
                    vite: {
                        build: {
                            outDir: 'dist-electron',
                            rollupOptions: {
                                external: ['better-sqlite3'],
                            },
                        },
                    },
                },
                {
                    entry: 'electron/preload.ts',
                    onstart(options) {
                        options.reload();
                    },
                },
            ]),
            renderer(),
        ] : []),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
});
