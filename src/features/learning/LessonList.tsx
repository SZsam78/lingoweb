import { useState, useEffect } from 'react';
import { LESSONS_PER_MODULE } from '@/content/meta';
import { cn } from '@/lib/utils';
import { ArrowLeft, CheckCircle2, PlayCircle, Loader2 } from 'lucide-react';
import { DB } from '@/lib/db';

interface LessonListProps {
    moduleId: string;
    onSelectLesson: (lessonId: string) => void;
    onBack: () => void;
}

interface LessonItem {
    id: string;
    number: number;
    title: string;
    completed: boolean;
}

export function LessonList({ moduleId, onSelectLesson, onBack }: LessonListProps) {
    const [lessons, setLessons] = useState<LessonItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchLessons() {
            setLoading(true);
            try {
                // Fetch lessons for this module from the database
                const dbLessons = await DB.query('SELECT * FROM lessons WHERE moduleId = ?', [moduleId]);

                // Map to our UI format
                // If the DB is empty for this module, falling back to basic metadata structure
                // but using titles from DB where available.
                const mapped = Array.from({ length: LESSONS_PER_MODULE }, (_, i) => {
                    const id = `${moduleId}-L${String(i + 1).padStart(2, '0')}`;
                    const dbMatch = (dbLessons as any[]).find(l => l.id === id);

                    return {
                        id,
                        number: i + 1,
                        title: dbMatch ? dbMatch.title : `Lektion ${i + 1}`,
                        completed: false, // Progress to be implemented
                    };
                });

                setLessons(mapped);
            } catch (error) {
                console.error("Failed to fetch lessons:", error);
                // Fallback to basic structure on error
                setLessons(Array.from({ length: LESSONS_PER_MODULE }, (_, i) => ({
                    id: `${moduleId}-L${String(i + 1).padStart(2, '0')}`,
                    number: i + 1,
                    title: `Lektion ${i + 1}`,
                    completed: false,
                })));
            } finally {
                setLoading(false);
            }
        }

        fetchLessons();
    }, [moduleId]);

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Zurück zur Übersicht
            </button>

            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-bold">{moduleId}</h2>
                    <p className="text-muted-foreground">Wählen Sie eine Lektion aus.</p>
                </div>
                <div className="text-right">
                    <p className="text-sm font-medium">Gesamtfortschritt</p>
                    <p className="text-2xl font-bold text-primary">0%</p>
                </div>
            </div>

            <div className="space-y-3">
                {lessons.map((lesson) => (
                    <button
                        key={lesson.id}
                        onClick={() => onSelectLesson(lesson.id)}
                        className={cn(
                            "w-full flex items-center justify-between p-4 rounded-xl border bg-card transition-all hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-slate-900 group",
                            lesson.completed ? "border-green-100 bg-green-50/30" : "border-slate-200 dark:border-slate-800"
                        )}
                    >
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-sm font-bold group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                {lesson.number}
                            </div>
                            <div className="text-left">
                                <h4 className="font-bold">{lesson.title}</h4>
                                <p className="text-xs text-muted-foreground">Klicken zum Starten</p>
                            </div>
                        </div>
                        {lesson.completed ? (
                            <CheckCircle2 className="h-6 w-6 text-green-500" />
                        ) : (
                            <PlayCircle className="h-6 w-6 text-slate-300 group-hover:text-primary transition-colors" />
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}
