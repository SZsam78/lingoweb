import React from 'react';
import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';
import { AudioPlayer } from '../AudioPlayer';

interface MCQProps {
    items: any[];
    answers: Record<string, any>;
    onAnswer: (itemId: string, answer: any) => void;
    showResults: boolean;
    isEditing?: boolean;
    onChange?: (itemId: string, updates: any) => void;
}

export function MCQView({ items, answers, onAnswer, showResults, isEditing = false, onChange }: MCQProps) {
    return (
        <div className="flex flex-col gap-10">
            {items.map((item) => (
                <div key={item.id} className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
                    {isEditing ? (
                        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-xl border border-dashed border-slate-300 mb-4">
                            <span className="material-symbols-outlined text-sm text-slate-400">link</span>
                            <input
                                value={item.meta?.audioUrl || ""}
                                onChange={(e) => onChange!(item.id, { meta: { ...item.meta, audioUrl: e.target.value } })}
                                placeholder="Audio URL"
                                className="flex-1 bg-transparent text-xs outline-none"
                            />
                        </div>
                    ) : (
                        item.meta?.audioUrl && (
                            <div className="mb-2">
                                <AudioPlayer url={item.meta.audioUrl} />
                            </div>
                        )
                    )}
                    {isEditing && (
                        <div className="mb-6">
                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 px-1">Frage</h4>
                            <textarea
                                value={item.question || item.prompt || ""}
                                onChange={(e) => onChange!(item.id, { question: e.target.value })}
                                className="w-full bg-transparent border-b border-dashed border-slate-300 outline-none resize-none font-bold text-xl"
                                placeholder="Frage eingeben..."
                                rows={2}
                            />
                        </div>
                    )}
                    <div className="grid grid-cols-1 gap-4">
                        {item.choices.map((choice: any) => {
                            const isSelected = answers[item.id] === choice.id;
                            const isCorrect = choice.isCorrect;

                            let baseClasses = "relative flex items-center p-6 rounded-[2rem] border-2 cursor-pointer transition-all transform hover:scale-[1.01] group overflow-hidden shadow-sm";
                            let stateClasses = "border-slate-200 dark:border-surface-darker bg-white dark:bg-surface-dark hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md";

                            if (isSelected) {
                                stateClasses = "border-primary bg-primary/5 dark:bg-primary/10 shadow-[0_0_25px_rgba(249,115,22,0.15)] ring-1 ring-primary/20";
                            }

                            if (showResults) {
                                if (isCorrect) {
                                    stateClasses = "border-green-500 bg-green-50 dark:bg-green-900/10 shadow-[0_0_20px_rgba(34,197,94,0.1)] ring-1 ring-green-500/30 ring-offset-2 dark:ring-offset-background-dark animate-pulse";
                                } else if (isSelected) {
                                    stateClasses = "border-destructive bg-destructive/5 dark:bg-destructive/10 ring-1 ring-destructive/30";
                                }
                            }

                            return (
                                <button
                                    key={choice.id}
                                    disabled={showResults}
                                    onClick={() => onAnswer(item.id, choice.id)}
                                    className={cn(baseClasses, stateClasses)}
                                >
                                    <div className="flex items-center gap-5 w-full relative z-10">
                                        <div className={cn(
                                            "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all shrink-0",
                                            isSelected ? "bg-primary border-primary text-white shadow-md scale-110" : "border-slate-300 dark:border-slate-600 group-hover:border-slate-400"
                                        )}>
                                            {isSelected ? (
                                                <span className="material-symbols-outlined !text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                                            ) : null}
                                        </div>
                                        <div className="flex grow flex-col text-left">
                                            {isEditing ? (
                                                <div className="flex flex-col gap-2">
                                                    <input
                                                        value={choice.text}
                                                        onChange={(e) => {
                                                            const newChoices = item.choices.map((c: any) => c.id === choice.id ? { ...c, text: e.target.value } : c);
                                                            onChange!(item.id, { choices: newChoices });
                                                        }}
                                                        className="bg-transparent border-b border-dashed border-primary/30 outline-none w-full font-bold text-lg"
                                                        placeholder="Optionstext"
                                                    />
                                                    <label className="flex items-center gap-2 cursor-pointer mt-1">
                                                        <input
                                                            type="checkbox"
                                                            checked={choice.isCorrect}
                                                            onChange={(e) => {
                                                                const newChoices = item.choices.map((c: any) => c.id === choice.id ? { ...c, isCorrect: e.target.checked } : c);
                                                                onChange!(item.id, { choices: newChoices });
                                                            }}
                                                            className="accent-primary"
                                                        />
                                                        <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Richtig</span>
                                                    </label>
                                                </div>
                                            ) : (
                                                <p className={cn(
                                                    "text-xl tracking-tight transition-colors",
                                                    isSelected ? "font-bold text-slate-900 dark:text-white" : "font-semibold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white"
                                                )}>
                                                    {choice.text}
                                                </p>
                                            )}
                                        </div>

                                        {showResults && isCorrect && !isSelected && (
                                            <span className="material-symbols-outlined text-green-500 !text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                        )}
                                        {showResults && isSelected && !isCorrect && (
                                            <span className="material-symbols-outlined text-destructive !text-[24px]">cancel</span>
                                        )}
                                    </div>

                                    {/* Subtle background glow for selected state */}
                                    {isSelected && (
                                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50"></div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}

