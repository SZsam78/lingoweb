import { useState, useEffect } from 'react';
import { Lesson, Section } from '@/content/schema';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, CheckCircle, RotateCcw, Lightbulb } from 'lucide-react';
import { TaskRenderer } from './TaskRenderer';
import { DB } from '@/lib/db';
import { useTranslation } from '@/lib/i18n';
import { AuthService } from '@/lib/auth';

interface LessonPlayerProps {
    lessonId: string;
    onBack: () => void;
    onNextLesson?: (lessonId: string, moduleId?: string) => void;
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
                id: `q-${i}`,
                type: 'multiple_choice',
                prompt: q.question,
                choices: (q.options || []).map((opt: string, j: number) => ({
                    id: `opt-${j}`,
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
                id: `b-${i}`,
                type: 'fill_blank',
                prompt: `Fülle die Lücke aus: ${b.sentence.replace('___', '...')}`,
                text: text,
                solutions: { "0": b.correctAnswer }
            });
        });
    } else if (type === 'dialog') {
        const lines = (content.text || "").split('\n').map((line: string, i: number) => {
            const split = line.split(':');
            if (split.length > 1) {
                return { id: `l-${i}`, speaker: split[0].trim(), text: split.slice(1).join(':').trim() };
            }
            return { id: `l-${i}`, speaker: '', text: line.trim() };
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
                id: `wo-${i}`,
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
            prompt: `${content.roleplayInstructions?.roleA || ''}\n${content.roleplayInstructions?.roleB || ''}`,
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
                id: `mt-${i}`,
                type: 'multiple_choice',
                prompt: q.question,
                choices: (q.options || []).map((opt: string, j: number) => ({
                    id: `opt-${j}`,
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
        id: parsed.id || `${parsed.moduleId}-L${String(parsed.lessonNumber || parsed.order || 1).padStart(2, '0')}`,
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

export function LessonPlayer({ lessonId, onBack, onNextLesson }: LessonPlayerProps) {
    const { t } = useTranslation();
    const user = AuthService.getCurrentUser();
    const [lesson, setLesson] = useState<Lesson | null>(null);
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    // Answers state: { [sectionId]: { [itemId]: answer } }
    const [allAnswers, setAllAnswers] = useState<Record<string, Record<string, any>>>({});
    const [showResults, setShowResults] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const loadLesson = async () => {
            try {
                const data = await DB.getLesson(lessonId);
                if (data) {
                    let parsed = JSON.parse(data.content_json);
                    parsed = adaptLessonFormat(parsed);
                    setLesson(parsed);
                } else {
                    // Fallback to legacy JSON if needed or show error
                    console.warn("Lesson not found in DB, checking legacy local files...");
                    const [module, id] = lessonId.split('-');
                    const moduleContent = await import(`../../content/${module}/${id}.json`);
                    setLesson(adaptLessonFormat(moduleContent.default));
                }
            } catch (error) {
                console.error("Failed to load lesson:", error);
            } finally {
                setLoading(false);
            }
        };
        loadLesson();
    }, [lessonId]);

    if (loading) return <div className="p-8 text-center">Laden...</div>;
    if (!lesson) return <div className="p-8 text-center text-destructive">Lektion nicht gefunden.</div>;

    const currentSection = lesson.sections[currentSectionIndex];

    const handleAnswer = (itemId: string, answer: any) => {
        setAllAnswers(prev => ({
            ...prev,
            [currentSection.id]: {
                ...(prev[currentSection.id] || {}),
                [itemId]: answer
            }
        }));
    };

    const handleCheck = async () => {
        setShowResults(prev => ({ ...prev, [currentSection.id]: true }));

        if (!user) return;

        // Save progress for each item in section
        const sectionAnswers = allAnswers[currentSection.id] || {};
        for (const item of currentSection.items) {
            const answer = sectionAnswers[item.id];
            // Simple validation for test
            const isCorrect = true;
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
                return {
                    id: doc.id || data.id,
                    number: num
                };
            }).sort((a: any, b: any) => a.number - b.number);

            const currentIndex = mapped.findIndex((l: any) => l.id === lessonId);

            if (currentIndex !== -1 && currentIndex < mapped.length - 1) {
                // Next lesson in current module
                onNextLesson(mapped[currentIndex + 1].id, lesson.moduleId);
            } else {
                // Module finished, transition to next module
                const { MODULES } = await import('@/content/meta');
                const modIndex = MODULES.findIndex(m => m.id === lesson.moduleId);
                if (modIndex !== -1 && modIndex < MODULES.length - 1) {
                    const nextModuleId = MODULES[modIndex + 1].id;
                    // For simplicity, just send them to the first logical lesson of the next module
                    onNextLesson(`${nextModuleId}-L01`, nextModuleId);
                } else {
                    onBack(); // End of all modules
                }
            }
        } catch (e) {
            console.error("Navigation error", e);
            onBack();
        }
    };

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-black">
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-4 bg-card border-b">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <h1 className="font-bold">{lesson.title}</h1>
                        <p className="text-xs text-muted-foreground">{lesson.moduleId} • Lektion {lesson.id.split('-L')[1]}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="text-sm font-medium mr-4">
                        {currentSectionIndex + 1} / {lesson.sections.length}
                    </div>
                    <div className="w-48 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-300"
                            style={{ width: `${((currentSectionIndex + 1) / lesson.sections.length) * 100}%` }}
                        />
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 w-full mx-auto overflow-y-auto no-scrollbar">
                <div className="min-h-full py-8 px-4 md:px-8 flex flex-col items-center">
                    <div className="w-full max-w-3xl bg-card rounded-2xl border p-6 md:p-10 shadow-sm transition-all">
                        <h2 className="text-2xl md:text-3xl font-bold mb-3 text-[#1A1A1A]">{currentSection.title}</h2>
                        {currentSection.instruction && (
                            <p className="text-base md:text-lg text-muted-foreground mb-8 italic">{currentSection.instruction}</p>
                        )}

                        <div className="space-y-8 pb-10">
                            <TaskRenderer
                                section={currentSection}
                                answers={allAnswers[currentSection.id] || {}}
                                onAnswer={handleAnswer}
                                showResults={showResults[currentSection.id] || false}
                            />
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer Controls */}
            <footer className="w-full border-t bg-card/95 backdrop-blur-md p-4 lg:p-6 sticky bottom-0 z-50">
                <div className="max-w-3xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
                    <button
                        onClick={() => setCurrentSectionIndex(prev => Math.max(0, prev - 1))}
                        disabled={currentSectionIndex === 0}
                        className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold disabled:opacity-30 text-muted-foreground hover:bg-slate-100 transition-colors"
                    >
                        {t('zurueck')}
                    </button>

                    <div className="flex flex-1 justify-center gap-2 lg:gap-4 w-full sm:w-auto">
                        <button
                            onClick={handleReset}
                            className="flex items-center justify-center flex-1 sm:flex-none gap-2 px-6 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-colors"
                        >
                            <RotateCcw className="h-5 w-5" />
                            <span className="hidden sm:inline">{t('zuruecksetzen')}</span>
                        </button>
                        <button
                            onClick={handleCheck}
                            className="flex items-center justify-center flex-1 sm:flex-none gap-2 px-8 py-3 rounded-xl bg-primary text-white font-black uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-md"
                        >
                            <CheckCircle className="h-5 w-5" /> {t('pruefen')}
                        </button>
                    </div>
                    <button
                        onClick={() => {
                            if (currentSectionIndex === lesson.sections.length - 1) {
                                handleNextLesson();
                            } else {
                                setCurrentSectionIndex(prev => prev + 1);
                            }
                        }}
                        className="w-full sm:w-auto px-6 py-3 rounded-xl border-2 border-slate-200 font-black text-[#1A1A1A] hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center group"
                    >
                        Next
                        <ChevronRight className="inline h-5 w-5 ml-1 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </footer>
        </div>
    );
}
