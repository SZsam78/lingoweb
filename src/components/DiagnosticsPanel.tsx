import { useEffect, useState } from 'react';
import { DB } from '@/lib/db';
import { Activity, Database, GitBranch, HardDrive, RefreshCcw, Terminal, Download, Upload } from 'lucide-react';

export function DiagnosticsPanel() {
    const [dbStatus, setDbStatus] = useState<any>(null);
    const [env, setEnv] = useState<any>(null);
    const [dbTestResult, setDbTestResult] = useState<string>('');
    const [cloudStatus, setCloudStatus] = useState<any>(null);

    const loadStatus = async () => {
        try {
            const stats = await DB.getStats();
            setCloudStatus(stats);

            setEnv({
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                language: navigator.language,
                lastNavigation: sessionStorage.getItem('last_nav') || 'N/A'
            });
        } catch (err: any) {
            setDbStatus({ error: err.message });
        }
    };

    const testDB = async () => {
        setDbTestResult('Testing...');
        try {
            const hasAPI = !!(window as any).electronAPI;
            setDbTestResult(`electronAPI: ${hasAPI ? 'YES ✅' : 'NO ❌'}`);
            if (!hasAPI) return;
            // Test parameterized query
            const result = await DB.query('SELECT id, title FROM lessons WHERE moduleId = ?', ['A1.1']);
            setDbTestResult(`electronAPI: YES ✅\nQuery returned ${result.length} lessons:\n${(result as any[]).map(r => r.id + ' – ' + r.title).join('\n')}`);
        } catch (err: any) {
            setDbTestResult(`Error: ${err.message}`);
        }
    };

    useEffect(() => {
        loadStatus();
    }, []);

    const handleExportBackup = async () => {
        try {
            const lessons = await DB.query('SELECT * FROM lessons');
            const parsedLessons = lessons.map((r: any) => JSON.parse(r.content_json));
            const backupData = {
                version: '1.0',
                timestamp: new Date().toISOString(),
                type: 'lingolume_backup',
                data: { lessons: parsedLessons }
            };
            const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `lingolume-backup-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
        } catch (err) {
            console.error("Backup Export Failed:", err);
            alert("Fehler beim Exportieren des Backups.");
        }
    };

    const handleImportBackup = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const text = e.target?.result as string;
                const backup = JSON.parse(text);

                if (backup.type !== 'lingolume_backup' || !backup.data || !backup.data.lessons) {
                    throw new Error("Ungültiges Backup-Format");
                }

                if (!window.confirm(`Möchten Sie ${backup.data.lessons.length} Lektionen importieren? Existierende Lektionen mit derselben ID werden überschrieben.`)) {
                    return;
                }

                for (const lesson of backup.data.lessons) {
                    await DB.saveLesson(lesson);
                }

                alert("Import erfolgreich abgeschlossen!");
                loadStatus(); // Refresh counters

            } catch (err) {
                console.error("Backup Import Failed:", err);
                alert("Fehler beim Importieren: Das Format der Datei ist ungültig.");
            }
        };
        reader.readAsText(file);
        // Reset input
        event.target.value = '';
    };

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black flex items-center gap-3 text-slate-800">
                        <Terminal className="h-8 w-8 text-primary" />
                        System Diagnostics
                    </h1>
                    <p className="text-muted-foreground mt-2">Offline Developer & Observability Screen</p>
                </div>
                <button
                    onClick={loadStatus}
                    className="flex items-center gap-2 px-4 py-2 border rounded-xl hover:bg-slate-50 font-bold transition-colors"
                >
                    <RefreshCcw className="h-4 w-4" /> Aktualisieren
                </button>
            </div>

            {/* Quick DB Test */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 shadow-sm space-y-3">
                <h3 className="font-bold text-blue-800">🔧 IPC-Datenbanktest</h3>
                <button
                    onClick={testDB}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors text-sm"
                >
                    Datenbankverbindung testen
                </button>
                {dbTestResult && (
                    <pre className="text-xs bg-white border rounded-xl p-4 whitespace-pre-wrap text-slate-700 font-mono">
                        {dbTestResult}
                    </pre>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Environment */}
                <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-4">
                    <h3 className="font-bold flex items-center gap-2 text-slate-800">
                        <HardDrive className="h-5 w-5 text-blue-500" /> Environment
                    </h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-muted-foreground">Platform</span>
                            <span className="font-mono bg-slate-50 px-2 py-0.5 rounded">{env?.platform}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-muted-foreground">User Agent</span>
                            <span className="font-mono bg-slate-50 px-2 py-0.5 rounded text-[10px] break-all max-w-[200px] text-right">
                                {env?.userAgent}
                            </span>
                        </div>
                        <div className="flex justify-between pt-2">
                            <span className="text-muted-foreground">App Version</span>
                            <span className="font-mono bg-green-50 text-green-700 px-2 py-0.5 rounded font-bold">1.0.0 (Offline)</span>
                        </div>
                    </div>
                </div>

                {/* Cloud Database */}
                <div className="bg-slate-900 border rounded-2xl p-6 shadow-xl shadow-slate-200 space-y-4">
                    <h3 className="font-bold flex items-center gap-2 text-white">
                        <Activity className="h-5 w-5 text-green-400" /> Cloud Database (Firestore)
                    </h3>
                    <div className="space-y-2 text-sm text-slate-300">
                        <div className="flex justify-between border-b border-white/10 pb-2">
                            <span>Status</span>
                            <span className="text-green-400 font-bold">Verbunden</span>
                        </div>
                        <div className="flex justify-between border-b border-white/10 pb-2">
                            <span>Lektionen</span>
                            <span className="font-bold text-white">{cloudStatus?.lessons || 0}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/10 pb-2">
                            <span>Benutzer</span>
                            <span className="font-bold text-white">{cloudStatus?.users || 0}</span>
                        </div>
                        <div className="flex justify-between pt-2">
                            <span>Vokabeln (Artikeltrainer)</span>
                            <span className="font-bold text-white">{cloudStatus?.vocabulary || 0}</span>
                        </div>
                    </div>
                </div>

                {/* SQLite Database */}
                <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-4 opacity-70">
                    <h3 className="font-bold flex items-center gap-2 text-slate-800">
                        <Database className="h-5 w-5 text-purple-500" /> Local SQLite (Offline)
                    </h3>
                    <div className="p-3 bg-amber-50 text-amber-700 rounded-xl text-[10px] font-bold uppercase tracking-wider mb-2">
                        Inaktiv im Browser-Modus
                    </div>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-muted-foreground">Lessons</span>
                            <span className="font-bold">0 Rows</span>
                        </div>
                        <div className="flex justify-between pt-2">
                            <span className="text-muted-foreground">Mode</span>
                            <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-[10px]">Read-Only Fallback</span>
                        </div>
                    </div>
                </div>

                {/* Routing / State */}
                <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-4">
                    <h3 className="font-bold flex items-center gap-2 text-slate-800">
                        <GitBranch className="h-5 w-5 text-orange-500" /> Routing & State
                    </h3>
                    <div className="p-4 bg-slate-900 text-slate-50 rounded-xl font-mono text-xs overflow-auto h-[120px]">
                        <div className="text-slate-400 mb-1">// Last recorded navigation action</div>
                        <div className="text-green-400">{env?.lastNavigation}</div>
                    </div>
                </div>

                {/* Backup & Restore */}
                <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-4">
                    <h3 className="font-bold flex items-center gap-2 text-slate-800">
                        <Database className="h-5 w-5 text-emerald-500" /> Backup & Restore
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        Exportieren Sie alle Ihre erstellten Lektionen als Backup-Datei, um sie später wiederherzustellen oder in eine neuere Version der App zu übernehmen.
                    </p>
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={handleExportBackup}
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 transition-colors w-full"
                        >
                            <Download className="h-5 w-5" /> Gesamtes Backup Exportieren
                        </button>

                        <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-300 rounded-xl font-bold hover:bg-slate-50 hover:border-slate-400 text-slate-600 cursor-pointer transition-all w-full">
                            <Upload className="h-5 w-5" /> Backup Importieren
                            <input
                                type="file"
                                accept=".json"
                                className="hidden"
                                onChange={handleImportBackup}
                            />
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}
