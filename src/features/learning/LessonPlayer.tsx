import { useState, useEffect } from 'react';
import { Lesson, Section } from '@/content/schema';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, CheckCircle, RotateCcw, Lightbulb } from 'lucide-react';
import { TaskRenderer } from './TaskRenderer';
import { DB } from '@/lib/db';

interface LessonPlayerProps {
    lessonId: string;
    onBack: () => void;
}

export function LessonPlayer({ lessonId, onBack }: LessonPlayerProps) {
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
                    setLesson(JSON.parse(data.content_json));
                } else {
                    // Fallback to legacy JSON if needed or show error
                    console.warn("Lesson not found in DB, checking legacy local files...");
                    const [module, id] = lessonId.split('-');
                    const moduleContent = await import(`../../content/${module}/${id}.json`);
                    setLesson(moduleContent.default);
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

        // Save progress for each item in section
        const sectionAnswers = allAnswers[currentSection.id] || {};
        for (const item of currentSection.items) {
            const answer = sectionAnswers[item.id];
            // Logic for status (simple check)
            const isCorrect = true; // Simplified for now, real logic in components
            await DB.updateProgress(item.id, isCorrect ? 'completed' : 'failed', answer, { checked: true });
        }
    };

    const handleReset = () => {
        setAllAnswers(prev => ({ ...prev, [currentSection.id]: {} }));
        setShowResults(prev => ({ ...prev, [currentSection.id]: false }));
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
            <main className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="max-w-3xl mx-auto space-y-8">
                    <div className="bg-card rounded-2xl border p-8 shadow-sm">
                        <h2 className="text-2xl font-bold mb-2">{currentSection.title}</h2>
                        {currentSection.instruction && (
                            <p className="text-muted-foreground mb-6 italic">{currentSection.instruction}</p>
                        )}

                        <div className="space-y-6">
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
            <footer className="p-4 bg-card border-t flex justify-center gap-4">
                <button
                    onClick={() => setCurrentSectionIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentSectionIndex === 0}
                    className="px-6 py-2 rounded-xl border font-medium disabled:opacity-50 hover:bg-slate-50 transition-colors"
                >
                    Zurück
                </button>
                <div className="flex gap-2">
                    <button
                        onClick={handleReset}
                        className="flex items-center gap-2 px-6 py-2 rounded-xl bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 transition-colors"
                    >
                        <RotateCcw className="h-4 w-4" /> Zurücksetzen
                    </button>
                    <button
                        onClick={() => setShowResults(prev => ({ ...prev, [currentSection.id]: true }))}
                        className="flex items-center gap-2 px-6 py-2 rounded-xl bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 transition-colors"
                    >
                        <Lightbulb className="h-4 w-4" /> Lösung
                    </button>
                    <button
                        onClick={handleCheck}
                        className="flex items-center gap-2 px-8 py-2 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity"
                    >
                        <CheckCircle className="h-4 w-4" /> Prüfen
                    </button>
                </div>
                <button
                    onClick={() => {
                        setCurrentSectionIndex(prev => Math.min(lesson.sections.length - 1, prev + 1));
                    }}
                    className="px-6 py-2 rounded-xl border font-medium hover:bg-slate-50 transition-colors group"
                >
                    {currentSectionIndex === lesson.sections.length - 1 ? "Abschließen" : "Weiter"}
                    <ChevronRight className="inline h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </button>
            </footer>
        </div>
    );
}
