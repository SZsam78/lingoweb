import { useState } from 'react';
import { LessonPlayer } from '../learning/LessonPlayer';
import { LessonEditor } from '../editor/LessonEditor';
import { BookOpen, Edit3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LessonContainerProps {
    lessonId: string;
    initialMode?: 'learn' | 'edit';
    onBack: () => void;
    onNextLesson?: (lessonId: string, moduleId?: string) => void;
}

export function LessonContainer({ lessonId, initialMode = 'learn', onBack, onNextLesson }: LessonContainerProps) {
    const [mode, setMode] = useState<'learn' | 'edit'>(initialMode);

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Tab Switcher */}
            <div className="flex justify-center p-2 bg-card border-b bg-slate-50/50">
                <div className="bg-slate-200/50 p-1 rounded-xl flex gap-1">
                    <button
                        onClick={() => setMode('learn')}
                        className={cn(
                            "flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all",
                            mode === 'learn' ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <BookOpen className="h-4 w-4" /> Lernen
                    </button>
                    <button
                        onClick={() => setMode('edit')}
                        className={cn(
                            "flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all",
                            mode === 'edit' ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <Edit3 className="h-4 w-4" /> Bearbeiten
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-auto">
                {mode === 'learn' ? (
                    <LessonPlayer lessonId={lessonId} onBack={onBack} onNextLesson={onNextLesson} />
                ) : (
                    <LessonEditor lessonId={lessonId} />
                )}
            </div>
        </div>
    );
}
