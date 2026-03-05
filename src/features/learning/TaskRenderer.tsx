import React from 'react';
import { Section } from '@/content/schema';
import { cn } from '@/lib/utils';
import { MCQView } from './tasks/MCQView';
import { FillBlankView } from './tasks/FillBlankView';
import { ReorderView } from './tasks/ReorderView';
import { AudioPlayer } from './AudioPlayer';

const DialogView = ({ items, isEditing, onChange }: any) => (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {items.map((item: any, i: number) => {
            const lines = item.lines || (item.speaker && item.text ? [{ id: i, speaker: item.speaker, text: item.text }] : []);
            return (
                <div key={i} className="flex flex-col gap-6">
                    {isEditing ? (
                        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-xl border border-dashed border-slate-300">
                            <span className="material-symbols-outlined text-sm text-slate-400">link</span>
                            <input
                                value={item.meta?.audioUrl || ""}
                                onChange={(e) => onChange(item.id, { meta: { ...item.meta, audioUrl: e.target.value } })}
                                placeholder="Audio URL (https://...)"
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
                    <div className="flex flex-col gap-4">
                        {(lines || []).map((line: any, idx: number) => (
                            <div key={line.id || idx} className={cn(
                                "flex flex-col sm:flex-row sm:gap-6 p-6 rounded-3xl border-2 transition-all hover:shadow-md",
                                idx % 2 === 0
                                    ? "bg-white dark:bg-surface-dark border-slate-100 dark:border-surface-darker"
                                    : "bg-slate-50 dark:bg-slate-900/50 border-transparent sm:ml-8"
                            )}>
                                <span className="font-black text-xs uppercase tracking-[0.2em] text-primary mb-2 sm:mb-0 sm:min-w-[120px] sm:pt-1">
                                    {isEditing ? (
                                        <input
                                            value={line.speaker}
                                            onChange={(e) => {
                                                const newLines = [...lines];
                                                newLines[idx] = { ...line, speaker: e.target.value };
                                                onChange(item.id, { lines: newLines });
                                            }}
                                            className="bg-transparent border-b border-dashed border-primary/30 outline-none w-full"
                                            placeholder="Sprecher"
                                        />
                                    ) : line.speaker}
                                </span>
                                <div className="text-lg font-semibold text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap flex-1">
                                    {isEditing ? (
                                        <textarea
                                            value={line.text}
                                            onChange={(e) => {
                                                const newLines = [...lines];
                                                newLines[idx] = { ...line, text: e.target.value };
                                                onChange(item.id, { lines: newLines });
                                            }}
                                            className="w-full bg-transparent border-b border-dashed border-slate-300 outline-none resize-none"
                                            placeholder="Text..."
                                        />
                                    ) : line.text}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )
        })}
    </div>
);

// Renders a single item by its type — used in mini_test sections that contain mixed items
function ItemByType({ item, answers, onAnswer, showResults, isEditing, onChange }: any) {
    if (isEditing && !onChange) return null;

    switch (item.type) {
        case 'multiple_choice':
            return <MCQView items={[item]} answers={answers} onAnswer={onAnswer} showResults={showResults} isEditing={isEditing} onChange={onChange} />;
        case 'fill_blank':
            return <FillBlankView items={[item]} answers={answers} onAnswer={onAnswer} showResults={showResults} isEditing={isEditing} onChange={onChange} />;
        case 'reorder_sentence':
            return <ReorderView items={[item]} answers={answers} onAnswer={onAnswer} showResults={showResults} isEditing={isEditing} onChange={onChange} />;
        case 'short_write':
            return (
                <div className="flex flex-col gap-6 p-8 bg-white dark:bg-surface-dark rounded-[2rem] border-2 border-slate-100 dark:border-surface-darker shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-700">
                    {isEditing ? (
                        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-xl border border-dashed border-slate-300">
                            <input
                                value={item.meta?.audioUrl || ""}
                                onChange={(e) => onChange(item.id, { meta: { ...item.meta, audioUrl: e.target.value } })}
                                placeholder="Audio URL"
                                className="flex-1 bg-transparent text-xs outline-none"
                            />
                        </div>
                    ) : (item.meta?.audioUrl && <AudioPlayer url={item.meta.audioUrl} />)}

                    <div className="text-xl font-bold text-slate-800 dark:text-white">
                        {isEditing ? (
                            <textarea
                                value={item.prompt}
                                onChange={(e) => onChange(item.id, { prompt: e.target.value })}
                                className="w-full bg-transparent border-b border-dashed border-slate-300 outline-none resize-none"
                            />
                        ) : item.prompt}
                    </div>

                    <textarea
                        className="w-full h-40 p-6 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none resize-none text-lg font-medium"
                        placeholder="Schreibe deine Antwort hier..."
                        value={answers[item.id] || ""}
                        onChange={(e) => onAnswer(item.id, e.target.value)}
                        disabled={showResults || isEditing}
                    />
                    {(showResults || isEditing) && (
                        <div className="p-6 bg-green-50 dark:bg-green-900/10 rounded-2xl border-2 border-green-100 dark:border-green-900/30">
                            <h5 className="text-[10px] font-black text-green-600 uppercase tracking-[0.2em] mb-3">Musterlösung</h5>
                            {isEditing ? (
                                <textarea
                                    value={item.sampleSolution || ""}
                                    onChange={(e) => onChange(item.id, { sampleSolution: e.target.value })}
                                    className="w-full bg-transparent border-b border-dashed border-green-300 outline-none resize-none"
                                />
                            ) : (
                                <p className="text-green-800 dark:text-green-300 font-bold leading-relaxed">{item.sampleSolution}</p>
                            )}
                        </div>
                    )}
                </div>
            );
        case 'matching':
            return (
                <div className="flex flex-col gap-6 p-8 bg-white dark:bg-surface-dark rounded-[2rem] border-2 border-slate-100 dark:border-surface-darker shadow-sm">
                    {isEditing ? (
                        <input
                            value={item.meta?.audioUrl || ""}
                            onChange={(e) => onChange(item.id, { meta: { ...item.meta, audioUrl: e.target.value } })}
                            placeholder="Audio URL"
                            className="bg-slate-50 p-2 rounded text-xs"
                        />
                    ) : (item.meta?.audioUrl && <AudioPlayer url={item.meta.audioUrl} />)}
                    <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-primary">link</span>
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Zuordnungsaufgabe</p>
                    </div>
                    <div className="flex flex-col gap-3">
                        {(item.pairs || []).map((pair: any, j: number) => (
                            <div key={j} className="flex items-center gap-4 group">
                                <div className="flex-1">
                                    {isEditing ? (
                                        <input
                                            value={pair.left}
                                            onChange={(e) => {
                                                const newPairs = [...item.pairs];
                                                newPairs[j] = { ...pair, left: e.target.value };
                                                onChange(item.id, { pairs: newPairs });
                                            }}
                                            className="w-full p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-300 outline-none"
                                        />
                                    ) : (
                                        <span className="block p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-transparent font-bold text-slate-700 dark:text-slate-200">
                                            {pair.left}
                                        </span>
                                    )}
                                </div>
                                <span className="material-symbols-outlined text-slate-300 dark:text-slate-700">arrow_forward</span>
                                <div className="flex-1">
                                    {isEditing ? (
                                        <input
                                            value={pair.right}
                                            onChange={(e) => {
                                                const newPairs = [...item.pairs];
                                                newPairs[j] = { ...pair, right: e.target.value };
                                                onChange(item.id, { pairs: newPairs });
                                            }}
                                            className="w-full p-4 bg-primary/5 dark:bg-primary/10 rounded-2xl border-2 border-dashed border-primary/20 outline-none"
                                        />
                                    ) : (
                                        <span className="block p-4 bg-primary/5 dark:bg-primary/10 rounded-2xl border-2 border-primary/20 font-bold text-primary shadow-sm">
                                            {pair.right}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        case 'roleplay':
            return (
                <div className="flex flex-col gap-6 p-8 bg-gradient-to-br from-orange-50 to-white dark:from-primary/10 dark:to-surface-dark rounded-[2rem] border-2 border-primary/20 shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <span className="material-symbols-outlined !text-[120px]">forum</span>
                    </div>
                    {isEditing ? (
                        <input
                            value={item.meta?.audioUrl || ""}
                            onChange={(e) => onChange(item.id, { meta: { ...item.meta, audioUrl: e.target.value } })}
                            placeholder="Audio URL"
                            className="bg-white/50 p-2 rounded text-xs relative z-20"
                        />
                    ) : (item.meta?.audioUrl && <AudioPlayer url={item.meta.audioUrl} />)}

                    <div className="relative z-10 flex flex-col gap-4">
                        <h4 className="font-black uppercase text-[10px] tracking-[0.3em] text-primary">Rollenspiel</h4>
                        <div className="text-xl font-bold text-slate-800 dark:text-white leading-relaxed">
                            {isEditing ? (
                                <textarea
                                    value={item.prompt}
                                    onChange={(e) => onChange(item.id, { prompt: e.target.value })}
                                    className="w-full bg-transparent border-b border-dashed border-primary/30 outline-none resize-none"
                                />
                            ) : item.prompt}
                        </div>

                        {item.usefulPhrases && (
                            <div className="mt-4">
                                <h4 className="font-black uppercase text-[10px] tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-3">Nützliche Redemittel</h4>
                                <div className="flex flex-wrap gap-2">
                                    {(isEditing ? item.usefulPhrases.join('\n') : item.usefulPhrases).map((phrase: string, j: number) => {
                                        if (isEditing) return null; // handle specialized below
                                        return (
                                            <span key={j} className="px-4 py-2 bg-white dark:bg-surface-darker rounded-xl border-2 border-slate-100 dark:border-slate-800 text-sm font-bold text-slate-600 dark:text-slate-300 shadow-sm hover:border-primary transition-all cursor-default">
                                                {phrase}
                                            </span>
                                        );
                                    })}
                                    {isEditing && (
                                        <textarea
                                            value={item.usefulPhrases.join('\n')}
                                            onChange={(e) => onChange(item.id, { usefulPhrases: e.target.value.split('\n') })}
                                            className="w-full bg-white/50 p-4 rounded-xl border-2 border-dashed border-slate-300 text-sm font-bold outline-none"
                                            placeholder="Redemittel (pro Zeile eins)..."
                                            rows={3}
                                        />
                                    )}
                                </div>
                            </div>
                        )}

                        {(showResults || isEditing) && item.sampleSolution && (
                            <div className="mt-6 p-6 bg-green-50/80 dark:bg-green-900/20 rounded-2xl border-2 border-green-200/50 backdrop-blur-sm">
                                <h5 className="text-[10px] font-black text-green-600 uppercase tracking-[0.2em] mb-3">Beispieldialog</h5>
                                {isEditing ? (
                                    <textarea
                                        value={item.sampleSolution}
                                        onChange={(e) => onChange(item.id, { sampleSolution: e.target.value })}
                                        className="w-full bg-transparent border-b border-dashed border-green-300 outline-none resize-none"
                                    />
                                ) : (
                                    <p className="text-green-800 dark:text-green-300 font-bold leading-relaxed">{item.sampleSolution}</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            );
        case 'dialog':
            return <DialogView items={[item]} isEditing={isEditing} onChange={onChange} />;
        default:
            return null;
    }
}


interface TaskRendererProps {
    section: Section;
    answers: Record<string, any>;
    onAnswer: (itemId: string, answer: any) => void;
    showResults: boolean;
    isEditing?: boolean;
    onChange?: (itemId: string, updates: any) => void;
}

export function TaskRenderer({ section, answers, onAnswer, showResults, isEditing = false, onChange }: TaskRendererProps) {
    switch (section.type) {
        case 'dialog':
            return <DialogView items={section.items} isEditing={isEditing} onChange={onChange} />;

        case 'multiple_choice':
            return (
                <MCQView
                    items={section.items}
                    answers={answers}
                    onAnswer={onAnswer}
                    showResults={showResults}
                    isEditing={isEditing}
                    onChange={onChange}
                />
            );

        case 'fill_blank':
        case 'wortschatz':
        case 'grammatik':
            return (
                <FillBlankView
                    items={section.items}
                    answers={answers}
                    onAnswer={onAnswer}
                    showResults={showResults}
                    isEditing={isEditing}
                    onChange={onChange}
                />
            );

        case 'reorder_sentence':
            return (
                <ReorderView
                    items={section.items}
                    answers={answers}
                    onAnswer={onAnswer}
                    showResults={showResults}
                    isEditing={isEditing}
                    onChange={onChange}
                />
            );

        case 'rich_text':
        case 'reading':
            return (
                <div className="space-y-6">
                    {section.items.map((item: any, i: number) => (
                        <div key={i} className="prose dark:prose-invert max-w-none">
                            {isEditing ? (
                                <div className="space-y-4 mb-8 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-200">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Inhalt Bearbeiten</h4>
                                    <input
                                        value={item.meta?.audioUrl || ""}
                                        onChange={(e) => onChange!(item.id, { meta: { ...item.meta, audioUrl: e.target.value } })}
                                        placeholder="Audio URL"
                                        className="w-full bg-white dark:bg-slate-800 p-2 rounded text-sm outline-none"
                                    />
                                    <textarea
                                        value={item.content}
                                        onChange={(e) => onChange!(item.id, { content: e.target.value })}
                                        className="w-full bg-white dark:bg-slate-800 p-4 rounded-xl text-lg outline-none min-h-[200px]"
                                        placeholder="Textinhalt..."
                                    />
                                </div>
                            ) : (
                                <>
                                    {item.meta?.audioUrl && <AudioPlayer url={item.meta.audioUrl} />}
                                    {item.image && (
                                        <div className="mb-4 aspect-video bg-slate-100 rounded-xl overflow-hidden border">
                                            <img
                                                src={`asset://${item.image}`}
                                                alt="Lektionsinhalt"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}
                                    <div className="whitespace-pre-wrap">{item.content}</div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            );

        // Sections where items can be mixed types — render each item by its own type
        case 'short_write':
        case 'matching':
        case 'roleplay':
        case 'mini_test':
        default:
            return (
                <div className="space-y-8">
                    {section.items.map((item: any, i: number) => (
                        <div key={item.id || i}>
                            <ItemByType
                                item={item}
                                answers={answers}
                                onAnswer={onAnswer}
                                showResults={showResults}
                                isEditing={isEditing}
                                onChange={onChange}
                            />
                        </div>
                    ))}
                    {section.items.length === 0 && (
                        <div className="italic text-muted-foreground p-12 border border-dashed rounded-xl text-center">
                            Diese Sektion hat noch keine Aufgaben.
                        </div>
                    )}
                </div>
            );
    }
}
