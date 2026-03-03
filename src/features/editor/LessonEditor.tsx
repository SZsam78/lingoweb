import { useState, useEffect } from 'react';
import { Lesson, AnyItem } from '@/content/schema';
import { DB } from '@/lib/db';
import { Plus, Save, ChevronDown, ChevronUp, Download } from 'lucide-react';
import { ItemEditorFactory } from './ItemEditorFactory';

interface LessonEditorProps {
    lessonId: string;
}

export function LessonEditor({ lessonId }: LessonEditorProps) {
    const [lesson, setLesson] = useState<Lesson | null>(null);
    const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        sessionStorage.removeItem('unsaved_changes');
        const loadLesson = async () => {
            try {
                setError(null);
                let parsedLesson: Lesson | null = null;

                try {
                    const data = await DB.getLesson(lessonId);
                    if (data && data.content_json) {
                        parsedLesson = JSON.parse(data.content_json);
                    }
                } catch (dbErr) {
                    console.warn("DB check failed or no data, falling back to skeleton.", dbErr);
                }

                if (parsedLesson && Array.isArray(parsedLesson.sections) && parsedLesson.sections.length === 8) {
                    setLesson(parsedLesson);
                } else if (parsedLesson && Array.isArray(parsedLesson.sections) && parsedLesson.sections.length === 9) {
                    // Quick migration for existing 9-section drafts
                    const updatedLesson = { ...parsedLesson, sections: parsedLesson.sections.slice(0, 8) };
                    setLesson(updatedLesson);
                } else {
                    const [mod] = lessonId.split('-');
                    const skeleton: Lesson = {
                        id: lessonId,
                        moduleId: mod as any,
                        title: `Lektion ${lessonId.split('-L')[1] || '01'}`,
                        version: '1.0.0',
                        isPublished: false,
                        sections: [
                            { id: 'sec1', type: 'dialog', title: 'Einstieg', items: [] },
                            { id: 'sec2', type: 'multiple_choice', title: 'Verstehen', items: [] },
                            { id: 'sec3', type: 'wortschatz', title: 'Wortschatz', items: [] },
                            { id: 'sec4', type: 'grammatik', title: 'Grammatik', items: [] },
                            { id: 'sec5', type: 'reading', title: 'Fertigkeit Lesen', items: [] },
                            { id: 'sec6', type: 'short_write', title: 'Fertigkeit Schreiben', items: [] },
                            { id: 'sec7', type: 'roleplay', title: 'Fertigkeit Sprechen', items: [] },
                            { id: 'sec8', type: 'mini_test', title: 'Mini-Test', items: [] },
                        ]
                    };
                    setLesson(skeleton);
                    try {
                        await DB.saveLesson(skeleton); // Speichert Draft automatisch
                    } catch (saveErr) {
                        console.error("Could not auto-save skeleton:", saveErr);
                    }
                }
            } catch (err: any) {
                console.error("Failed to load lesson in editor:", err);
                setError(`Lektion konnte nicht geladen werden (${err.message}).`);
            }
        };
        loadLesson();
    }, [lessonId]);

    const handleSave = async () => {
        if (!lesson) return;
        try {
            setIsSaving(true);
            await DB.saveLesson(lesson);
            sessionStorage.removeItem('unsaved_changes');
        } catch (err) {
            console.error("Save failed:", err);
            alert("Fehler beim Speichern der Lektion.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleExport = () => {
        if (!lesson) return;
        const blob = new Blob([JSON.stringify(lesson, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${lesson.id}.json`;
        a.click();
    };

    const updateSectionTitle = (sectionId: string, newTitle: string) => {
        if (!lesson) return;
        const newSections = lesson.sections.map(s =>
            s.id === sectionId ? { ...s, title: newTitle } : s
        );
        setLesson({ ...lesson, sections: newSections });
        sessionStorage.setItem('unsaved_changes', 'true');
    };

    const addItemToSection = (sectionId: string, itemType: string) => {
        if (!lesson) return;
        const section = lesson.sections.find(s => s.id === sectionId);
        if (!section) return;

        const newItem: AnyItem = {
            id: crypto.randomUUID(),
            type: itemType as any,
            meta: { isMandatory: false, canShowSolution: true }
        } as any;

        if (itemType === 'rich_text') (newItem as any).content = '';
        if (itemType === 'dialog') Object.assign(newItem, { speaker: 'A', text: '' });
        if (itemType === 'multiple_choice') Object.assign(newItem, { question: '', choices: [] });
        if (itemType === 'matching') Object.assign(newItem, { pairs: [] });
        if (itemType === 'fill_blank') Object.assign(newItem, { text: '', solutions: {} });
        if (itemType === 'reorder_sentence') Object.assign(newItem, { sentence: '' });
        if (itemType === 'short_write') Object.assign(newItem, { prompt: '' });
        if (itemType === 'roleplay') Object.assign(newItem, { prompt: '', usefulPhrases: [] });
        if (itemType === 'mini_test') Object.assign(newItem, { subTasks: [] });

        const newSections = lesson.sections.map(s =>
            s.id === sectionId ? { ...s, items: [...s.items, newItem] } : s
        );
        setLesson({ ...lesson, sections: newSections });
        sessionStorage.setItem('unsaved_changes', 'true');
    };

    const updateItem = (sectionId: string, itemId: string, updates: any) => {
        if (!lesson) return;
        const newSections = lesson.sections.map(s => {
            if (s.id === sectionId) {
                return {
                    ...s,
                    items: s.items.map(item => item.id === itemId ? { ...item, ...updates } : item)
                };
            }
            return s;
        });
        setLesson({ ...lesson, sections: newSections });
        sessionStorage.setItem('unsaved_changes', 'true');
    };

    const deleteItem = (sectionId: string, itemId: string) => {
        if (!lesson) return;
        const newSections = lesson.sections.map(s => {
            if (s.id === sectionId) {
                return { ...s, items: s.items.filter(item => item.id !== itemId) };
            }
            return s;
        });
        setLesson({ ...lesson, sections: newSections });
        sessionStorage.setItem('unsaved_changes', 'true');
    };

    if (error) {
        return (
            <div className="p-12 text-center space-y-4">
                <div className="text-destructive font-bold">{error}</div>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
                >
                    Neu laden
                </button>
            </div>
        );
    }

    if (!lesson) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            <div className="text-muted-foreground font-medium">Lektion wird geladen...</div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Lektion bearbeiten</h2>
                    <p className="text-sm text-muted-foreground">{lesson.id} • {lesson.title}</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 border rounded-xl font-bold hover:bg-slate-50 transition-colors"
                    >
                        <Download className="h-4 w-4" /> Export
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 transition-opacity"
                    >
                        <Save className="h-4 w-4" /> {isSaving ? "Speichert..." : "Speichern"}
                    </button>
                </div>
            </div>

            <div className="space-y-4 pb-20">
                {lesson.sections.map((section, idx) => (
                    <div key={section.id} className="border rounded-2xl bg-card overflow-hidden shadow-sm">
                        <button
                            onClick={() => setActiveSectionId(activeSectionId === section.id ? null : section.id)}
                            className="w-full flex items-center justify-between p-6 hover:bg-muted/50 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <span className="flex items-center justify-center h-8 w-8 rounded-full bg-slate-100 text-xs font-bold text-slate-500">
                                    {idx + 1}
                                </span>
                                <div className="text-left flex-1" onClick={(e) => e.stopPropagation()}>
                                    <input
                                        value={section.title}
                                        onChange={(e) => updateSectionTitle(section.id, e.target.value)}
                                        className="font-bold bg-transparent border-none outline-none focus:ring-2 focus:ring-primary/20 rounded px-1 -ml-1 w-full max-w-sm"
                                    />
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider pl-1">{section.type}</p>
                                </div>
                            </div>
                            {activeSectionId === section.id ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                        </button>

                        {activeSectionId === section.id && (
                            <div className="p-6 pt-0 border-t bg-slate-50/30">
                                <div className="space-y-6 py-6 font-sans">
                                    {section.items.length === 0 && (
                                        <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-2xl border border-dashed border-slate-200">
                                            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                                <Plus className="h-6 w-6 text-slate-300" />
                                            </div>
                                            <h4 className="font-bold text-slate-600">Noch keine Aufgaben</h4>
                                            <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                                                Wählen Sie unten einen Aufgabentyp aus, um Ihre erste Aufgabe in "{section.title}" zu erstellen.
                                            </p>
                                        </div>
                                    )}
                                    {section.items.map((item) => (
                                        <ItemEditorFactory
                                            key={item.id}
                                            item={item}
                                            onChange={(updates) => updateItem(section.id, item.id, updates)}
                                            onDelete={() => deleteItem(section.id, item.id)}
                                        />
                                    ))}

                                    <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-200 border-dashed">
                                        {[
                                            { type: 'rich_text', label: 'Rich Text' },
                                            { type: 'dialog', label: 'Dialog' },
                                            { type: 'multiple_choice', label: 'Multiple Choice' },
                                            { type: 'matching', label: 'Zuordnung' },
                                            { type: 'fill_blank', label: 'Lückentext' },
                                            { type: 'reorder_sentence', label: 'Schüttelsatz' },
                                            { type: 'short_write', label: 'Freitext' },
                                            { type: 'roleplay', label: 'Rollenspiel' },
                                            { type: 'mini_test', label: 'Mini-Test' },
                                        ].map(t => (
                                            <button
                                                key={t.type}
                                                onClick={() => addItemToSection(section.id, t.type)}
                                                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-white border shadow-sm hover:border-primary hover:text-primary transition-all flex items-center gap-1 text-slate-500"
                                            >
                                                <Plus className="h-3 w-3" /> {t.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
