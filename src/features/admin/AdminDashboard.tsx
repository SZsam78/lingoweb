import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Zap, Trash2, UploadCloud, Users, Database, PlaySquare, ShieldCheck } from 'lucide-react';
import { DB } from '@/lib/db';
import { UserList } from './UserList';
import { useTranslation } from '@/lib/i18n';

export function AdminDashboard() {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'users' | 'content' | 'story'>('content');
    const [isProcessing, setIsProcessing] = useState(false);
    const [jsonInput, setJsonInput] = useState('');

    const tabs = [
        { id: 'users' as const, label: t('benutzerverwaltung'), icon: Users },
        { id: 'content' as const, label: t('inhalte'), icon: Database },
        { id: 'story' as const, label: t('story_modus'), icon: PlaySquare },
    ];

    const handleBatchImport = async () => {
        if (!window.confirm("Alle ~550 Lektionen (A1-B2) in Firestore laden? Vorhandene Daten werden überschrieben.")) return;

        setIsProcessing(true);
        try {
            // Fetch the lessons from the bundled assets
            const response = await fetch('/lessons.json');
            if (!response.ok) throw new Error("Could not find lesson data asset.");
            const data = await response.json();

            // Batch save to DB
            for (const lesson of data) {
                await DB.saveLesson(lesson);
            }
            alert(`Erfolgreich ${data.length} Lektionen importiert!`);
        } catch (err: any) {
            console.error(err);
            alert("Fehler beim Import: " + err.message);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto min-h-screen">
            <header className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <ShieldCheck className="h-8 w-8 text-primary" />
                    <h1 className="text-3xl font-black text-[#1A1A1A]">Admin Dashboard</h1>
                </div>
                <p className="text-muted-foreground">{t('verwaltung_beschreibung')}</p>
            </header>

            <div className="flex gap-2 mb-8 bg-[#F0EEE6] p-1.5 rounded-2xl w-fit">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "flex items-center gap-2 px-6 py-2.5 rounded-xl font-extrabold text-sm transition-all",
                            activeTab === tab.id
                                ? "bg-white text-primary shadow-sm"
                                : "text-muted-foreground hover:text-[#1A1A1A]"
                        )}
                    >
                        <tab.icon className="h-4 w-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-[2rem] border border-[#EFEBE0] shadow-xl p-8 min-h-[500px]">
                {activeTab === 'content' && (
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-xl font-black mb-2">Universal Content Importer</h2>
                            <p className="text-sm text-muted-foreground mb-6">Importiere Massendaten direkt in Firestore.</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <button
                                    onClick={handleBatchImport}
                                    disabled={isProcessing}
                                    className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-primary/20 bg-primary/5 rounded-3xl hover:bg-primary/10 transition-all group"
                                >
                                    <Zap className="h-10 w-10 text-primary mb-3 group-hover:scale-110 transition-transform" />
                                    <span className="font-black text-primary text-center">INITIAL-LOAD (A1 - B2)</span>
                                    <span className="text-[10px] text-muted-foreground mt-1 uppercase font-bold">554 Lektionen laden</span>
                                </button>

                                <div className="flex flex-col gap-4 p-6 bg-slate-50 rounded-3xl border">
                                    <div className="flex items-center gap-2 mb-2">
                                        <UploadCloud className="h-5 w-5 text-muted-foreground" />
                                        <span className="font-bold text-sm text-[#1A1A1A]">Manueller JSON Import</span>
                                    </div>
                                    <textarea
                                        value={jsonInput}
                                        onChange={(e) => setJsonInput(e.target.value)}
                                        placeholder="Paste JSON here..."
                                        className="flex-1 min-h-[150px] bg-white border rounded-xl p-3 text-xs font-mono focus:ring-2 focus:ring-primary/20 outline-none"
                                    />
                                    <button
                                        disabled={!jsonInput || isProcessing}
                                        className="bg-[#1A1A1A] text-white py-3 rounded-xl font-bold text-sm hover:opacity-90 disabled:opacity-30"
                                    >
                                        Validieren & Speichern
                                    </button>

                                    <button
                                        onClick={async () => {
                                            setIsProcessing(true);
                                            try {
                                                const res = await fetch('/test_upload.json');
                                                const data = await res.json();
                                                for (const l of data) await DB.saveLesson(l);
                                                alert("Test-Lektion erfolgreich hochgeladen! Diese ist jetzt unter A1.1 im Lernplan sichtbar.");
                                            } catch (err) { alert("Upload Fehler"); }
                                            finally { setIsProcessing(false); }
                                        }}
                                        className="mt-4 w-full border-2 border-primary/20 text-primary py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary/5 transition-all"
                                    >
                                        VERIFIZIERUNGS-TEST: TESTLEKTION LADEN
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-dashed">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-black text-lg">Datenbank Wartung</h3>
                                    <p className="text-xs text-muted-foreground">Vorsicht: Diese Aktionen löschen Daten permanent.</p>
                                </div>
                                <button className="flex items-center gap-2 px-4 py-2 text-white bg-red-500 rounded-xl font-bold text-sm hover:bg-red-600 transition-colors">
                                    <Trash2 className="h-4 w-4" /> Lektionen leeren
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <UserList />
                )}

                {activeTab === 'story' && (
                    <div className="flex flex-col items-center justify-center h-[400px] text-center">
                        <PlaySquare className="h-12 w-12 text-slate-200 mb-4" />
                        <h3 className="font-black text-xl mb-2 text-[#1A1A1A]">Story-Kapitel Editor</h3>
                        <p className="text-sm text-muted-foreground max-w-xs">Verknüpfe Videos mit interaktiven Aufgaben für den Story-Modus.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
