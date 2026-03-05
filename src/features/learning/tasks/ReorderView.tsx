import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Check, X, GripHorizontal } from 'lucide-react';
import { AudioPlayer } from '../AudioPlayer';

interface ReorderProps {
    items: any[];
    answers: Record<string, string[]>;
    onAnswer: (itemId: string, answer: string[]) => void;
    showResults: boolean;
    isEditing?: boolean;
    onChange?: (itemId: string, updates: any) => void;
}

export function ReorderView({ items, answers, onAnswer, showResults, isEditing = false, onChange }: ReorderProps) {
    return (
        <div className="flex flex-col gap-12">
            {items.map((item) => {
                const currentOrder = answers[item.id] || [];
                const isCorrect = JSON.stringify(currentOrder) === JSON.stringify(item.solution);

                // Simple click-to-move implementation
                const [availableWords, setAvailableWords] = useState<string[]>([]);
                const [resultWords, setResultWords] = useState<string[]>([]);

                useEffect(() => {
                    const original = (item.sentence || item.prompt || "").split(' / ');
                    if (!answers[item.id]) {
                        setAvailableWords([...original].sort(() => Math.random() - 0.5));
                        setResultWords([]);
                    } else {
                        setResultWords(answers[item.id]);
                        const remaining = [...original];
                        answers[item.id].forEach((w: string) => {
                            const idx = remaining.indexOf(w);
                            if (idx > -1) remaining.splice(idx, 1);
                        });
                        setAvailableWords(remaining);
                    }
                }, [item, answers]);

                const addWord = (word: string, idx: number) => {
                    if (showResults) return;
                    const newAvailable = [...availableWords];
                    newAvailable.splice(idx, 1);
                    const newResult = [...resultWords, word];
                    setAvailableWords(newAvailable);
                    setResultWords(newResult);
                    onAnswer(item.id, newResult);
                };

                const removeWord = (word: string, idx: number) => {
                    if (showResults) return;
                    const newResult = [...resultWords];
                    newResult.splice(idx, 1);
                    const newAvailable = [...availableWords, word];
                    setResultWords(newResult);
                    setAvailableWords(newAvailable);
                    onAnswer(item.id, newResult);
                };

                return (
                    <div key={item.id} className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
                        {isEditing ? (
                            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-xl border border-dashed border-slate-300">
                                <span className="material-symbols-outlined text-sm text-slate-400">link</span>
                                <input
                                    value={item.meta?.audioUrl || ""}
                                    onChange={(e) => onChange!(item.id, { meta: { ...item.meta, audioUrl: e.target.value } })}
                                    placeholder="Audio URL"
                                    className="flex-1 bg-transparent text-xs outline-none"
                                />
                            </div>
                        ) : (
                            item.meta?.audioUrl && <AudioPlayer url={item.meta.audioUrl} />
                        )}

                        {isEditing && (
                            <div className="space-y-4 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border-2 border-dashed border-slate-200">
                                <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 px-1">Wort-Pool (mit / getrennt)</h4>
                                    <input
                                        value={item.sentence || item.prompt || ""}
                                        onChange={(e) => onChange!(item.id, { sentence: e.target.value })}
                                        className="w-full bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 outline-none font-bold"
                                        placeholder="Wort 1 / Wort 2 / Wort 3..."
                                    />
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 px-1">Richtige Lösung (Wörter mit Leerzeichen)</h4>
                                    <input
                                        value={item.solution?.join(' ') || ""}
                                        onChange={(e) => onChange!(item.id, { solution: e.target.value.split(' ').filter(s => s.trim()) })}
                                        className="w-full bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 outline-none font-bold text-primary"
                                        placeholder="Die richtige Antwort..."
                                    />
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col gap-4">
                            <div className={cn(
                                "min-h-[140px] p-8 rounded-[2rem] border-2 border-dashed flex flex-wrap content-start gap-4 transition-all bg-white/50 dark:bg-surface-dark/50",
                                showResults
                                    ? (isCorrect ? "border-green-500 bg-green-50 dark:bg-green-900/10" : "border-destructive bg-destructive/5")
                                    : "border-slate-200 dark:border-surface-darker hover:border-slate-300 dark:hover:border-slate-700"
                            )}>
                                {resultWords.map((word, i) => (
                                    <button
                                        key={`${word}-${i}`}
                                        onClick={() => removeWord(word, i)}
                                        className="px-6 py-3 bg-white dark:bg-surface-dark border-2 border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm font-bold text-lg hover:translate-y-[-2px] hover:shadow-md transition-all active:scale-95 text-slate-800 dark:text-white"
                                    >
                                        {word}
                                    </button>
                                ))}
                                {resultWords.length === 0 && !showResults && (
                                    <div className="m-auto flex flex-col items-center gap-2 opacity-30 select-none">
                                        <span className="material-symbols-outlined !text-[40px]">touch_app</span>
                                        <span className="font-bold text-sm uppercase tracking-widest italic text-center">
                                            Wörter auswählen
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-3 p-4 bg-slate-50/50 dark:bg-surface-darker/30 rounded-3xl min-h-[80px] items-center justify-center">
                                {availableWords.map((word, i) => (
                                    <button
                                        key={`${word}-${i}`}
                                        onClick={() => addWord(word, i)}
                                        className="px-6 py-3 bg-slate-100 dark:bg-surface-dark font-bold rounded-2xl border-2 border-transparent hover:border-primary hover:text-primary transition-all shadow-sm hover:shadow-md active:scale-95 text-slate-600 dark:text-slate-400"
                                    >
                                        {word}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {showResults && !isCorrect && (
                            <div className="p-6 bg-green-50 dark:bg-green-900/10 rounded-2xl border-2 border-green-200 dark:border-green-900/30 flex items-center gap-4">
                                <span className="material-symbols-outlined text-green-500">done_all</span>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-green-600 mb-1">Richtige Reihenfolge</span>
                                    <p className="text-green-800 dark:text-green-300 font-bold text-lg">{item.solution.join(' ')}</p>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

