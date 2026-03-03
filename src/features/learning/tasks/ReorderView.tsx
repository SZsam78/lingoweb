import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Check, X, GripHorizontal } from 'lucide-react';
import { AudioPlayer } from '../AudioPlayer';

interface ReorderProps {
    items: any[];
    answers: Record<string, string[]>;
    onAnswer: (itemId: string, answer: string[]) => void;
    showResults: boolean;
}

export function ReorderView({ items, answers, onAnswer, showResults }: ReorderProps) {
    return (
        <div className="space-y-8">
            {items.map((item) => {
                const currentOrder = answers[item.id] || item.prompt.split(' / ').sort(() => Math.random() - 0.5);
                const isCorrect = JSON.stringify(currentOrder) === JSON.stringify(item.solution);

                // Simple click-to-move implementation for now
                const [availableWords, setAvailableWords] = useState<string[]>([]);
                const [resultWords, setResultWords] = useState<string[]>([]);

                useEffect(() => {
                    if (!answers[item.id]) {
                        setAvailableWords(item.prompt.split(' / '));
                        setResultWords([]);
                    } else {
                        setResultWords(answers[item.id]);
                        const original = item.prompt.split(' / ');
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
                    <div key={item.id} className="space-y-4">
                        {item.meta?.audioUrl && <AudioPlayer url={item.meta.audioUrl} />}
                        <p className="font-medium">{item.instruction || "Bringen Sie die Wörter in die richtige Reihenfolge."}</p>

                        <div className={cn(
                            "min-h-[60px] p-2 rounded-xl border-2 border-dashed flex flex-wrap gap-2 transition-all",
                            showResults
                                ? (isCorrect ? "border-green-500 bg-green-50" : "border-destructive bg-destructive/5")
                                : "border-slate-200"
                        )}>
                            {resultWords.map((word, i) => (
                                <button
                                    key={`${word}-${i}`}
                                    onClick={() => removeWord(word, i)}
                                    className="px-3 py-1 bg-white border rounded-lg shadow-sm hover:translate-y-[-1px] transition-transform"
                                >
                                    {word}
                                </button>
                            ))}
                            {resultWords.length === 0 && !showResults && (
                                <span className="text-muted-foreground text-sm m-auto">Klicken Sie auf die Wörter unten.</span>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {availableWords.map((word, i) => (
                                <button
                                    key={`${word}-${i}`}
                                    onClick={() => addWord(word, i)}
                                    className="px-3 py-1 bg-slate-100 border border-transparent rounded-lg hover:border-primary transition-all"
                                >
                                    {word}
                                </button>
                            ))}
                        </div>

                        {showResults && !isCorrect && (
                            <p className="text-sm text-green-600 font-medium">Lösung: {item.solution.join(' ')}</p>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
