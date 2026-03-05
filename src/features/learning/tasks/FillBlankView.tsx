import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';
import { AudioPlayer } from '../AudioPlayer';

interface FillBlankProps {
    items: any[];
    answers: Record<string, any>; // itemId -> { index: value }
    onAnswer: (itemId: string, answer: Record<number, string>) => void;
    showResults: boolean;
    isEditing?: boolean;
    onChange?: (itemId: string, updates: any) => void;
}

export function FillBlankView({ items, answers, onAnswer, showResults, isEditing = false, onChange }: FillBlankProps) {
    return (
        <div className="space-y-10">
            {items.map((item) => (
                <FillBlankItem
                    key={item.id}
                    item={item}
                    currentAnswers={answers[item.id] || {}}
                    onUpdate={(newAnswers: Record<number, string>) => onAnswer(item.id, newAnswers)}
                    showResults={showResults}
                    isEditing={isEditing}
                    onDraftUpdate={(updates: any) => onChange!(item.id, updates)}
                />
            ))}
        </div>
    );
}

interface BlankSegment {
    type: 'blank';
    index: number;
    placeholder: string;
    options: string[] | null;
}

interface TextSegment {
    type: 'text';
    content: string;
}

type Segment = BlankSegment | TextSegment;

function FillBlankItem({ item, currentAnswers, onUpdate, showResults, isEditing, onDraftUpdate }: any) {
    const text = item.text || "";

    // Parse text into segments of text and blanks [word] or [opt1|opt2]
    const segments = useMemo<Segment[]>(() => {
        const parts: Segment[] = [];
        const regex = /\[(.*?)\]/g;
        let lastIndex = 0;
        let match;
        let blankIndex = 0;

        while ((match = regex.exec(text)) !== null) {
            // Text before the match
            if (match.index > lastIndex) {
                parts.push({ type: 'text', content: text.substring(lastIndex, match.index) });
            }

            // The blank itself
            const content = match[1];
            parts.push({
                type: 'blank',
                index: blankIndex,
                placeholder: content.includes('|') ? content.split('|')[0] : '...',
                options: content.includes('|') ? content.split('|') : null
            });

            lastIndex = regex.lastIndex;
            blankIndex++;
        }

        // Final text segment
        if (lastIndex < text.length) {
            parts.push({ type: 'text', content: text.substring(lastIndex) });
        }

        return parts;
    }, [text]);

    const handleInputChange = (idx: number, val: string) => {
        onUpdate({
            ...currentAnswers,
            [idx]: val
        });
    };

    return (
        <div className="space-y-4">
            {isEditing ? (
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-xl border border-dashed border-slate-300">
                    <span className="material-symbols-outlined text-sm text-slate-400">link</span>
                    <input
                        value={item.meta?.audioUrl || ""}
                        onChange={(e) => onDraftUpdate({ meta: { ...item.meta, audioUrl: e.target.value } })}
                        placeholder="Audio URL"
                        className="flex-1 bg-transparent text-xs outline-none"
                    />
                </div>
            ) : (
                item.meta?.audioUrl && <AudioPlayer url={item.meta.audioUrl} />
            )}

            {isEditing ? (
                <div className="mb-2">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 px-1">Instruktion / Prompt</h4>
                    <input
                        value={item.prompt || ""}
                        onChange={(e) => onDraftUpdate({ prompt: e.target.value })}
                        className="w-full bg-transparent border-b border-dashed border-slate-300 outline-none font-medium text-slate-700"
                        placeholder="Prompt (z.B. Setze die richtige Form ein)"
                    />
                </div>
            ) : (
                item.prompt && <p className="font-medium text-slate-700 dark:text-slate-300 mb-2">{item.prompt}</p>
            )}

            <div className="leading-relaxed text-lg bg-card p-6 rounded-2xl border shadow-sm">
                {isEditing ? (
                    <div className="space-y-4">
                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Lückentext-Quelltext</h4>
                            <p className="text-[10px] text-slate-400 mb-2 italic">Nutze [Lösung] oder [Option1|Option2] für Lücken.</p>
                            <textarea
                                value={item.text}
                                onChange={(e) => onDraftUpdate({ text: e.target.value })}
                                className="w-full min-h-[100px] p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border-2 border-dashed border-slate-200 outline-none font-mono text-sm"
                            />
                        </div>
                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 px-1">Lösungen (kommagetrennt)</h4>
                            <input
                                value={item.solutions?.join(', ') || ""}
                                onChange={(e) => onDraftUpdate({ solutions: e.target.value.split(',').map(s => s.trim()) })}
                                className="w-full bg-transparent border-b border-dashed border-slate-300 outline-none py-2"
                                placeholder="Lösung 1, Lösung 2..."
                            />
                        </div>
                    </div>
                ) : (
                    segments.map((seg, i) => {
                        if (seg.type === 'text') {
                            return <span key={i} className="whitespace-pre-wrap">{seg.content}</span>;
                        }

                        const val = currentAnswers[seg.index] || "";
                        const solution = (item.solutions as any)?.[seg.index] || "";
                        const isCorrect = val.trim().toLowerCase() === solution.toLowerCase();

                        return (
                            <span key={i} className="inline-block mx-1 align-baseline relative group">
                                {seg.options ? (
                                    <select
                                        disabled={showResults}
                                        value={val}
                                        onChange={(e) => handleInputChange(seg.index, e.target.value)}
                                        className={cn(
                                            "appearance-none px-3 py-1 rounded-lg border bg-slate-50 dark:bg-slate-900 transition-all font-bold min-w-[80px]",
                                            showResults
                                                ? (isCorrect ? "border-green-500 text-green-700 bg-green-50" : "border-destructive text-destructive bg-destructive/5")
                                                : "border-slate-200 focus:border-primary outline-none"
                                        )}
                                    >
                                        <option value="">-- ? --</option>
                                        {seg.options.map((opt: string) => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        type="text"
                                        disabled={showResults}
                                        value={val}
                                        onChange={(e) => handleInputChange(seg.index, e.target.value)}
                                        className={cn(
                                            "px-2 py-0.5 rounded-lg border bg-slate-50 dark:bg-slate-900 transition-all font-bold text-center",
                                            showResults
                                                ? (isCorrect ? "border-green-500 text-green-700 bg-green-50" : "border-destructive text-destructive bg-destructive/5")
                                                : "border-slate-200 focus:border-primary outline-none"
                                        )}
                                        style={{ width: `${Math.max(4, (solution || "").length + 2)}ch` }}
                                        placeholder="..."
                                    />
                                )}

                                {showResults && !isCorrect && (
                                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-green-500 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 font-bold shadow-lg">
                                        Lösung: {solution}
                                    </span>
                                )}
                            </span>
                        );
                    })
                )}
            </div>
        </div>
    );
}
