import React from 'react';
import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';
import { AudioPlayer } from '../AudioPlayer';

interface MCQProps {
    items: any[];
    answers: Record<string, any>;
    onAnswer: (itemId: string, answer: any) => void;
    showResults: boolean;
}

export function MCQView({ items, answers, onAnswer, showResults }: MCQProps) {
    return (
        <div className="space-y-8">
            {items.map((item) => (
                <div key={item.id} className="space-y-4">
                    {item.meta?.audioUrl && <AudioPlayer url={item.meta.audioUrl} />}
                    <p className="font-medium text-lg">{item.prompt}</p>
                    <div className="grid grid-cols-1 gap-3">
                        {item.choices.map((choice: any) => {
                            const isSelected = answers[item.id] === choice.id;
                            const isCorrect = choice.isCorrect;

                            let stateClasses = "border-slate-200 hover:border-primary/50";
                            if (isSelected) stateClasses = "border-primary bg-primary/5 shadow-sm ring-1 ring-primary";
                            if (showResults) {
                                if (isCorrect) stateClasses = "border-green-500 bg-green-50 ring-1 ring-green-500";
                                else if (isSelected) stateClasses = "border-destructive bg-destructive/5 ring-1 ring-destructive";
                            }

                            return (
                                <button
                                    key={choice.id}
                                    disabled={showResults}
                                    onClick={() => onAnswer(item.id, choice.id)}
                                    className={cn(
                                        "flex items-center justify-between p-4 rounded-xl border transition-all text-left",
                                        stateClasses
                                    )}
                                >
                                    <span>{choice.text}</span>
                                    {showResults && isCorrect && <Check className="h-5 w-5 text-green-600" />}
                                    {showResults && isSelected && !isCorrect && <X className="h-5 w-5 text-destructive" />}
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
