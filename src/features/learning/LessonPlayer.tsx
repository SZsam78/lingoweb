import { useState, useEffect } from 'react';
import { Lesson, Section } from '@/content/schema';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, CheckCircle, RotateCcw, Lightbulb, Save } from 'lucide-react';
import { TaskRenderer } from './TaskRenderer';
import { DB } from '@/lib/db';
import { useTranslation } from '@/lib/i18n';
import { AuthService } from '@/lib/auth';
import { SoundService } from '@/lib/audio';

interface LessonPlayerProps {
    lessonId: string;
    onBack: () => void;
    onNextLesson?: (lessonId: string, moduleId?: string) => void;
    isEditing?: boolean;
}

// Adapts the flat JSON structure from Google Docs to the nested structure expected by the UI
function adaptLessonFormat(parsed: any): Lesson {
    if (parsed.sections) return parsed; // Already in standard format

    const items: any[] = [];
    const type = parsed.exerciseType;
    const content = parsed.content || {};

    if (type === 'richtext') {
        items.push({ id: 'item-1', type: 'rich_text', content: content.text || '' });
    } else if (type === 'multiple_choice') {
        const questions = content.questions || [];
        questions.forEach((q: any, i: number) => {
            items.push({
                id: `q - ${i} `,
                type: 'multiple_choice',
                prompt: q.question,
                choices: (q.options || []).map((opt: string, j: number) => ({
                    id: `opt - ${j} `,
                    text: opt,
                    isCorrect: opt === q.correctAnswer
                }))
            });
        });
    } else if (type === 'fill_in_blank') {
        const blanks = content.blanks || [];
        blanks.forEach((b: any, i: number) => {
            const text = b.sentence.replace('___', `[${b.correctAnswer}]`);
            items.push({
                id: `b - ${i} `,
                type: 'fill_blank',
                prompt: `Fülle die Lücke aus: ${b.sentence.replace('___', '...')} `,
                text: text,
                solutions: { "0": b.correctAnswer }
            });
        });
    } else if (type === 'dialog') {
        const lines = (content.text || "").split('\n').map((line: string, i: number) => {
            const split = line.split(':');
            if (split.length > 1) {
                return { id: `l - ${i} `, speaker: split[0].trim(), text: split.slice(1).join(':').trim() };
            }
            return { id: `l - ${i} `, speaker: '', text: line.trim() };
        }).filter((l: any) => l.text);
        items.push({ id: 'item-1', type: 'dialog', lines });
    } else if (type === 'matching') {
        items.push({ id: 'item-1', type: 'matching', pairs: content.pairs || [] });
    } else if (type === 'word_order') {
        const lines = (content.text || "").split('\n').filter(Boolean);
        lines.forEach((line: string, i: number) => {
            const cleanLine = line.replace(/^\d+\.\s*/, '');
            const parts = cleanLine.split('–').map((p: string) => p.trim());
            items.push({
                id: `wo - ${i} `,
                type: 'reorder_sentence',
                instruction: 'Bringen Sie die Wörter in die richtige Reihenfolge.',
                prompt: parts.join(' / '),
                solution: parts
            });
        });
    } else if (type === 'roleplay') {
        items.push({
            id: 'item-1',
            type: 'roleplay',
            prompt: `${content.roleplayInstructions?.roleA || ''} \n${content.roleplayInstructions?.roleB || ''} `,
            usefulPhrases: content.roleplayInstructions?.tasks || []
        });
    } else if (type === 'free_text') {
        items.push({
            id: 'item-1',
            type: 'short_write',
            prompt: "Schreibe einen kurzen Text:",
            sampleSolution: content.template || ""
        });
    } else if (type === 'mini_test') {
        const questions = content.questions || [];
        questions.forEach((q: any, i: number) => {
            items.push({
                id: `mt - ${i} `,
                type: 'multiple_choice',
                prompt: q.question,
                choices: (q.options || []).map((opt: string, j: number) => ({
                    id: `opt - ${j} `,
                    text: opt,
                    isCorrect: opt === q.correctAnswer
                }))
            });
        });
    } else {
        items.push({ id: 'item-1', type: 'rich_text', content: JSON.stringify(content, null, 2) });
    }

    const sectionTypeMap: any = {
        'richtext': 'reading', 'multiple_choice': 'multiple_choice', 'fill_in_blank': 'fill_blank',
        'dialog': 'dialog', 'matching': 'matching', 'word_order': 'reorder_sentence',
        'roleplay': 'roleplay', 'free_text': 'short_write', 'mini_test': 'mini_test'
    };

    return {
        id: parsed.id || `${parsed.moduleId} -L${String(parsed.lessonNumber || parsed.order || 1).padStart(2, '0')} `,
        moduleId: parsed.moduleId || 'Unknown',
        title: parsed.title || 'Lektion',
        version: "1.0.0",
        isPublished: true,
        sections: [
            {
                id: 'sec-1',
                type: sectionTypeMap[type] || 'reading',
                title: parsed.title || 'Lektion',
                instruction: parsed.instruction || '',
                items
            }
        ]
    };
}

export function LessonPlayer({ lessonId, onBack, onNextLesson, isEditing = false }: LessonPlayerProps) {
    const { t } = useTranslation();
    const user = AuthService.getCurrentUser();
    const [lesson, setLesson] = useState<Lesson | null>(null);
    const [draftLesson, setDraftLesson] = useState<Lesson | null>(null);
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Answers state: { [sectionId]: { [itemId]: answer } }
    const [allAnswers, setAllAnswers] = useState<Record<string, Record<string, any>>>({});
    const [showResults, setShowResults] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const loadLesson = async () => {
            try {
                const data = await DB.getLesson(lessonId);
                let parsed: Lesson | null = null;
                if (data) {
                    parsed = JSON.parse(data.content_json);
                    parsed = adaptLessonFormat(parsed);
                } else {
                    console.warn("Lesson not found in DB, checking legacy local files...");
                    const [module, id] = lessonId.split('-');
                    const moduleContent = await import(`../../content/${module}/${id}.json`);
                    parsed = adaptLessonFormat(moduleContent.default);
                }
                setLesson(parsed);
                if (isEditing) setDraftLesson(JSON.parse(JSON.stringify(parsed)));
            } catch (error) {
                console.error("Failed to load lesson:", error);
            } finally {
                setLoading(false);
            }
        };
        loadLesson();
    }, [lessonId]);

    useEffect(() => {
        if (isEditing && lesson && !draftLesson) {
            setDraftLesson(JSON.parse(JSON.stringify(lesson)));
        } else if (!isEditing) {
            setDraftLesson(null);
        }
    }, [isEditing, lesson]);

    if (loading) return <div className="p-8 text-center dark:text-white">Laden...</div>;
    if (!lesson) return <div className="p-8 text-center text-destructive dark:text-red-400">Lektion nicht gefunden.</div>;

    const activeLesson = isEditing ? draftLesson : lesson;
    if (!activeLesson) return null;

    const currentSection = activeLesson.sections[currentSectionIndex];
    const progress = ((currentSectionIndex + 1) / activeLesson.sections.length) * 100;

    const handleAnswer = (itemId: string, answer: any) => {
        if (isEditing) return; // Disable interactive answers in edit mode
        setAllAnswers(prev => ({
            ...prev,
            [currentSection.id]: {
                ...(prev[currentSection.id] || {}),
                [itemId]: answer
            }
        }));
    };

    const handleDraftUpdate = (updates: Partial<Lesson>) => {
        setDraftLesson(prev => prev ? { ...prev, ...updates } : null);
        sessionStorage.setItem('unsaved_changes', 'true');
    };

    const handleSectionUpdate = (sectionId: string, updates: Partial<Section>) => {
        setDraftLesson(prev => {
            if (!prev) return null;
            return {
                ...prev,
                sections: prev.sections.map(s => s.id === sectionId ? { ...s, ...updates } : s)
            };
        });
        sessionStorage.setItem('unsaved_changes', 'true');
    };

    const handleItemUpdate = (sectionId: string, itemId: string, updates: any) => {
        setDraftLesson(prev => {
            if (!prev) return null;
            return {
                ...prev,
                sections: prev.sections.map(s => {
                    if (s.id !== sectionId) return s;
                    return {
                        ...s,
                        items: s.items.map(item => item.id === itemId ? { ...item, ...updates } : item)
                    };
                })
            };
        });
        sessionStorage.setItem('unsaved_changes', 'true');
    };

    const handleSave = async () => {
        if (!draftLesson) return;
        setIsSaving(true);
        try {
            await DB.saveLesson(draftLesson);
            setLesson(JSON.parse(JSON.stringify(draftLesson)));
            sessionStorage.removeItem('unsaved_changes');
            // Notify user or parent? For now just local success
            console.log("Lesson saved successfully");
        } catch (error) {
            console.error("Failed to save lesson:", error);
            alert("Fehler beim Speichern der Lektion.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCheck = async () => {
        setShowResults(prev => ({ ...prev, [currentSection.id]: true }));

        const sectionAnswers = allAnswers[currentSection.id] || {};
        let allCorrect = true;
        let anyAnswered = false;

        // Basic validation for sound feedback
        for (const item of currentSection.items) {
            const answer = sectionAnswers[item.id];
            if (answer !== undefined) anyAnswered = true;

            // Very basic check logic (this should ideally match individual Task components)
            if (item.type === 'multiple_choice') {
                const correctIds = item.choices.filter((c: any) => c.isCorrect).map((c: any) => c.id);
                const selectedIds = Array.isArray(answer) ? answer : [answer];
                if (correctIds.length !== selectedIds.length || !correctIds.every((id: string) => selectedIds.includes(id))) {
                    allCorrect = false;
                }
            } else if (item.type === 'fill_blank') {
                const solutions = item.solutions || {};
                const userAnswers = answer || {};
                if (Object.keys(solutions).some(k => solutions[k]?.toLowerCase().trim() !== userAnswers[k]?.toLowerCase().trim())) {
                    allCorrect = false;
                }
            }
            // Add more types as needed or default to true for non-validatable types
        }

        if (anyAnswered) {
            if (allCorrect) SoundService.playSuccess();
            else SoundService.playError();
        }

        if (!user) return;
        for (const item of currentSection.items) {
            const answer = sectionAnswers[item.id];
            // We use the same simple logic for progress tracking
            let isCorrect = true;
            if (item.type === 'multiple_choice') {
                const correctIds = item.choices.filter((c: any) => c.isCorrect).map((c: any) => c.id);
                const selectedIds = Array.isArray(answer) ? answer : [answer];
                isCorrect = correctIds.length === selectedIds.length && correctIds.every((id: string) => selectedIds.includes(id));
            }
            await (DB as any).updateProgress(user.id, lessonId, item.id, isCorrect ? 'completed' : 'failed', answer);
        }
    };

    const handleReset = () => {
        setAllAnswers(prev => ({ ...prev, [currentSection.id]: {} }));
        setShowResults(prev => ({ ...prev, [currentSection.id]: false }));
    };

    const handleNextLesson = async () => {
        if (!lesson || !onNextLesson) {
            onBack();
            return;
        }
        try {
            const dbLessons = await DB.query('SELECT * FROM lessons WHERE moduleId = ?', [lesson.moduleId]);
            let mapped = dbLessons.map((doc: any) => {
                let data = doc;
                if (doc.content_json) {
                    try { data = typeof doc.content_json === 'string' ? JSON.parse(doc.content_json) : doc.content_json; } catch (e) { }
                }
                let num = data.order || data.lessonNumber;
                if (typeof num !== 'number') {
                    const match = (data.id || doc.id)?.match(/-L(\d+)/);
                    num = match ? parseInt(match[1], 10) : 0;
                }
                return { id: doc.id || data.id, number: num };
            }).sort((a: any, b: any) => a.number - b.number);
            const currentIndex = mapped.findIndex((l: any) => l.id === lessonId);
            if (currentIndex !== -1 && currentIndex < mapped.length - 1) {
                onNextLesson(mapped[currentIndex + 1].id, lesson.moduleId);
            } else {
                const { MODULES } = await import('@/content/meta');
                const modIndex = MODULES.findIndex(m => m.id === lesson.moduleId);
                if (modIndex !== -1 && modIndex < MODULES.length - 1) {
                    const nextModuleId = MODULES[modIndex + 1].id;
                    onNextLesson(`${nextModuleId}-L01`, nextModuleId);
                } else {
                    onBack();
                }
            }
        } catch (e) {
            console.error("Navigation error", e);
            onBack();
        }
    };

    return (
        <div className="relative flex h-full w-full flex-col overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
            <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-surface-darker px-6 py-4 bg-white dark:bg-surface-dark shrink-0 z-10 shadow-sm transition-colors duration-300">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="flex items-center justify-center rounded-full h-10 w-10 bg-slate-100 dark:bg-surface-darker text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all hover:scale-105 active:scale-95"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                    <div className="hidden md:flex flex-col">
                        <h2 className="text-lg font-bold leading-tight tracking-tight text-slate-900 dark:text-white">
                            {isEditing ? (
                                <input
                                    value={activeLesson.title}
                                    onChange={(e) => handleDraftUpdate({ title: e.target.value })}
                                    className="bg-transparent border-b border-dashed border-slate-300 focus:border-primary outline-none px-1"
                                />
                            ) : activeLesson.title}
                        </h2>
                    </div>
                </div>

                <div className="flex-1 max-w-xl mx-8 hidden sm:block">
                    <div className="w-full bg-slate-200 dark:bg-surface-darker rounded-full h-3 overflow-visible relative">
                        <div
                            className="bg-primary h-3 rounded-full transition-all duration-500 ease-out relative"
                            style={{ width: `${progress}%` }}
                        >
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white dark:bg-primary border-2 border-primary shadow-lg rounded-full cursor-default group">
                                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    {Math.round(progress)}%
                                </span>
                            </div>
                        </div>
                    </div>
                    <p className="text-[10px] text-right mt-1 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">
                        {Math.round(progress)}% {t('abgeschlossen')}
                    </p>
                </div>

                <div className="flex gap-3">
                    <div className="flex items-center gap-2 rounded-lg h-10 px-4 bg-orange-100 dark:bg-primary/20 text-primary font-bold border border-orange-200 dark:border-primary/30 shadow-sm">
                        <span className="material-symbols-outlined !text-[20px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        <span>0</span>
                    </div>
                </div>
            </header>

            <main className="flex flex-1 overflow-hidden">
                <div className="flex flex-1 w-full max-w-[1440px] mx-auto overflow-hidden">
                    <aside className="hidden lg:flex flex-col w-1/3 border-r border-slate-200 dark:border-surface-darker bg-slate-50/50 dark:bg-slate-900/50 p-6 overflow-y-auto custom-scrollbar transition-colors">
                        <div className="flex items-center gap-2 mb-6">
                            <span className="material-symbols-outlined text-primary">auto_stories</span>
                            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                                {t('lernressourcen')}
                            </h3>
                        </div>

                        <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 border border-slate-200 dark:border-surface-darker shadow-sm mb-6 transition-all border-b-4 border-b-slate-100 dark:border-b-amber-900/20">
                            <p className="text-sm font-bold mb-4 text-slate-600 dark:text-slate-300 flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">headphones</span>
                                Audio-Dialog
                            </p>
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-4">
                                    <button className="w-12 h-12 flex items-center justify-center rounded-full bg-primary text-white hover:bg-orange-600 transition-all shadow-lg hover:scale-105 active:scale-95 group">
                                        <span className="material-symbols-outlined !text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                                    </button>
                                    <div className="flex-1">
                                        <div className="h-2 w-full bg-slate-100 dark:bg-surface-darker rounded-full overflow-hidden">
                                            <div className="h-full bg-primary w-1/4 rounded-full"></div>
                                        </div>
                                        <div className="flex justify-between mt-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                            <span>0:14</span>
                                            <span>0:45</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 min-h-0 flex flex-col">
                            <p className="text-sm font-bold mb-3 text-slate-600 dark:text-slate-300 uppercase tracking-widest px-1">
                                {t('kontext_vokabeln')}
                            </p>
                            <div className="flex-1 bg-white dark:bg-surface-dark rounded-2xl p-6 border border-slate-200 dark:border-surface-darker shadow-sm overflow-y-auto custom-scrollbar transition-all">
                                <div className="prose prose-sm dark:prose-invert text-slate-600 dark:text-slate-400">
                                    <div className="mb-6 leading-relaxed font-medium">
                                        {isEditing ? (
                                            <textarea
                                                value={currentSection.instruction || ""}
                                                onChange={(e) => handleSectionUpdate(currentSection.id, { instruction: e.target.value })}
                                                className="w-full bg-transparent border-b border-dashed border-slate-300 focus:border-primary outline-none resize-none min-h-[100px]"
                                                placeholder="Anweisungen für diese Sektion..."
                                            />
                                        ) : (
                                            <p>{currentSection.instruction || "In dieser Lektion vertiefst du dein Verständnis durch interaktive Übungen."}</p>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center py-3 border-b border-slate-50 dark:border-slate-800 group hover:bg-slate-50 dark:hover:bg-slate-800 -mx-2 px-2 rounded-lg transition-colors">
                                            <span className="font-bold text-slate-700 dark:text-slate-200">Guten Tag</span>
                                            <span className="text-primary text-xs font-black uppercase tracking-widest italic">Good day</span>
                                        </div>
                                        <div className="flex justify-between items-center py-3 border-b border-slate-50 dark:border-slate-800 group hover:bg-slate-50 dark:hover:bg-slate-800 -mx-2 px-2 rounded-lg transition-colors">
                                            <span className="font-bold text-slate-700 dark:text-slate-200">Wie heißen Sie?</span>
                                            <span className="text-primary text-xs font-black uppercase tracking-widest italic">What is your name?</span>
                                        </div>
                                    </div>

                                    <div className="mt-8 p-4 bg-slate-50 dark:bg-surface-darker rounded-xl border border-dotted border-slate-200 dark:border-slate-700">
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed italic">
                                            Kulturelle Notiz: In formellen Situationen wie im Büro verwendet man im Deutschen meist das "Sie" statt "du".
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>

                    <section className="flex-1 flex flex-col p-6 sm:p-12 lg:p-16 overflow-y-auto custom-scrollbar bg-white dark:bg-background-dark/80 transition-all">
                        <div className="w-full max-w-2xl mx-auto">
                            <div className="lg:hidden mb-8 p-4 bg-orange-50 dark:bg-primary/10 rounded-2xl border border-primary/20 flex items-center gap-4 transition-all animate-in fade-in slide-in-from-top-4">
                                <span className="material-symbols-outlined text-primary">info</span>
                                <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                                    Nutze die Ressourcen oben für diese Aufgabe.
                                </p>
                            </div>

                            <div className="flex flex-col mb-12">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></span>
                                    <p className="text-primary text-xs font-black tracking-[0.2em] uppercase">
                                        Interaktive Übung
                                    </p>
                                </div>
                                <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-6 text-slate-900 dark:text-white tracking-tight">
                                    {isEditing ? (
                                        <input
                                            value={currentSection.title}
                                            onChange={(e) => handleSectionUpdate(currentSection.id, { title: e.target.value })}
                                            className="w-full bg-transparent border-b border-dashed border-slate-300 focus:border-primary outline-none"
                                        />
                                    ) : currentSection.title}
                                </h1>
                                <div className="text-slate-500 dark:text-slate-400 text-lg font-medium leading-relaxed">
                                    {isEditing ? (
                                        <textarea
                                            value={currentSection.instruction || ""}
                                            onChange={(e) => handleSectionUpdate(currentSection.id, { instruction: e.target.value })}
                                            className="w-full bg-transparent border-b border-dashed border-slate-300 focus:border-primary outline-none resize-none"
                                            rows={2}
                                        />
                                    ) : (
                                        <p>{currentSection.instruction || "Wähle die richtige Antwort basierend auf dem Material."}</p>
                                    )}
                                </div>
                            </div>

                            <div className="pb-24">
                                <TaskRenderer
                                    section={currentSection}
                                    answers={allAnswers[currentSection.id] || {}}
                                    onAnswer={handleAnswer}
                                    showResults={showResults[currentSection.id] || false}
                                    isEditing={isEditing}
                                    onChange={(itemId, updates) => handleItemUpdate(currentSection.id, itemId, updates)}
                                />
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            <footer className="border-t border-slate-200 dark:border-surface-darker bg-white dark:bg-surface-dark py-6 px-10 shrink-0 z-10 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] transition-colors">
                <div className="max-w-[1400px] mx-auto flex justify-between items-center gap-4 md:gap-8">
                    <button
                        onClick={onBack}
                        className="flex items-center justify-center rounded-2xl h-14 px-10 bg-slate-100 dark:bg-surface-darker text-slate-600 dark:text-slate-300 font-black hover:bg-slate-200 dark:hover:bg-slate-700 transition-all uppercase tracking-widest text-xs border-b-4 border-b-slate-200 dark:border-b-black/20"
                    >
                        {t('zurueck')}
                    </button>

                    <div className="flex-1 md:flex-none"></div>

                    <div className="flex gap-4 w-full sm:w-auto flex-1 sm:flex-none justify-end">
                        {isEditing ? (
                            <button
                                onClick={handleSave}
                                disabled={isSaving || !draftLesson}
                                className="flex items-center justify-center rounded-2xl h-14 px-12 bg-primary text-white text-lg font-black shadow-xl shadow-orange-500/20 hover:bg-orange-600 active:transform active:translate-y-1 transition-all uppercase tracking-widest border-b-4 border-b-orange-700/30"
                            >
                                <Save className="h-5 w-5 mr-2" />
                                {isSaving ? "Speichert..." : "Änderungen Speichern"}
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={handleCheck}
                                    className="flex items-center justify-center rounded-2xl h-14 px-16 bg-primary text-white text-lg font-black shadow-xl shadow-orange-500/20 hover:bg-orange-600 active:transform active:translate-y-1 transition-all uppercase tracking-widest border-b-4 border-b-orange-700/30"
                                >
                                    {t('pruefen')}
                                </button>

                                {showResults[currentSection.id] && (
                                    <button
                                        onClick={() => {
                                            if (currentSectionIndex === activeLesson.sections.length - 1) {
                                                handleNextLesson();
                                            } else {
                                                setCurrentSectionIndex(prev => prev + 1);
                                            }
                                        }}
                                        className="flex items-center justify-center rounded-2xl h-14 px-8 bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-2 border-slate-900 dark:border-white font-black hover:opacity-90 transition-all uppercase tracking-widest text-xs"
                                    >
                                        <span className="material-symbols-outlined">arrow_forward</span>
                                        <span className="ml-2">Weiter</span>
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </footer>
        </div>
    );
}
