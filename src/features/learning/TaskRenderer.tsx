import React from 'react';
import { Section } from '@/content/schema';
import { MCQView } from './tasks/MCQView';
import { FillBlankView } from './tasks/FillBlankView';
import { ReorderView } from './tasks/ReorderView';
import { AudioPlayer } from './AudioPlayer';

const DialogView = ({ items }: any) => (
    <div className="space-y-4">
        {items.map((item: any, i: number) => {
            const lines = item.lines || (item.speaker && item.text ? [{ id: i, speaker: item.speaker, text: item.text }] : []);
            return (
                <div key={i} className="space-y-4">
                    {item.meta?.audioUrl && <AudioPlayer url={item.meta.audioUrl} />}
                    {(lines || []).map((line: any) => (
                        <div key={line.id} className="flex gap-4">
                            <span className="font-bold min-w-[100px] text-primary">{line.speaker}:</span>
                            <span className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl flex-1 border shadow-sm whitespace-pre-wrap">{line.text}</span>
                        </div>
                    ))}
                </div>
            )
        })}
    </div>
);

// Renders a single item by its type — used in mini_test sections that contain mixed items
function ItemByType({ item, answers, onAnswer, showResults }: any) {
    switch (item.type) {
        case 'multiple_choice':
            return <MCQView items={[item]} answers={answers} onAnswer={onAnswer} showResults={showResults} />;
        case 'fill_blank':
            return <FillBlankView items={[item]} answers={answers} onAnswer={onAnswer} showResults={showResults} />;
        case 'reorder_sentence':
            return <ReorderView items={[item]} answers={answers} onAnswer={onAnswer} showResults={showResults} />;
        case 'short_write':
            return (
                <div className="space-y-4 bg-card p-6 rounded-2xl border shadow-sm">
                    {item.meta?.audioUrl && <AudioPlayer url={item.meta.audioUrl} />}
                    <p className="font-bold text-lg">{item.prompt}</p>
                    <textarea
                        className="w-full h-32 p-4 rounded-xl border bg-slate-50 dark:bg-slate-900 focus:border-primary outline-none transition-all resize-none"
                        placeholder="Schreibe deine Antwort hier..."
                        value={answers[item.id] || ""}
                        onChange={(e) => onAnswer(item.id, e.target.value)}
                        disabled={showResults}
                    />
                    {showResults && item.sampleSolution && (
                        <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-xl border border-green-200">
                            <h5 className="text-xs font-bold text-green-700 uppercase mb-2">Musterlösung</h5>
                            <p className="text-sm text-green-800 whitespace-pre-wrap">{item.sampleSolution}</p>
                        </div>
                    )}
                </div>
            );
        case 'matching':
            return (
                <div className="p-4 bg-card rounded-2xl border shadow-sm">
                    {item.meta?.audioUrl && <AudioPlayer url={item.meta.audioUrl} />}
                    <p className="text-sm font-medium text-muted-foreground mb-3">Zuordnungsaufgabe:</p>
                    <div className="space-y-2">
                        {(item.pairs || []).map((pair: any, j: number) => (
                            <div key={j} className="flex items-center gap-3 text-sm">
                                <span className="flex-1 p-2 bg-slate-50 rounded-lg border font-medium">{pair.left}</span>
                                <span className="text-slate-400">→</span>
                                <span className="flex-1 p-2 bg-primary/5 rounded-lg border border-primary/20 font-medium">{pair.right}</span>
                            </div>
                        ))}
                    </div>
                </div>
            );
        case 'roleplay':
            return (
                <div className="space-y-4 bg-card p-4 rounded-2xl border border-primary/20">
                    {item.meta?.audioUrl && <AudioPlayer url={item.meta.audioUrl} />}
                    <h4 className="font-black uppercase text-[10px] tracking-widest text-primary">Rollenspiel</h4>
                    <p className="font-medium whitespace-pre-wrap">{item.prompt}</p>
                    {item.usefulPhrases && (
                        <div className="pt-2">
                            <h4 className="font-black uppercase text-[10px] tracking-widest text-slate-400 mb-2">Hilfreiche Redemittel</h4>
                            <div className="flex flex-wrap gap-2">
                                {item.usefulPhrases.map((phrase: string, j: number) => (
                                    <span key={j} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-sm">{phrase}</span>
                                ))}
                            </div>
                        </div>
                    )}
                    {showResults && item.sampleSolution && (
                        <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                            <h5 className="text-xs font-bold text-green-700 uppercase mb-2">Beispieldialog</h5>
                            <p className="text-sm text-green-800 whitespace-pre-wrap">{item.sampleSolution}</p>
                        </div>
                    )}
                </div>
            );
        case 'dialog':
            return <DialogView items={[item]} />;
        default:
            return null;
    }
}

interface TaskRendererProps {
    section: Section;
    answers: Record<string, any>;
    onAnswer: (itemId: string, answer: any) => void;
    showResults: boolean;
}

export function TaskRenderer({ section, answers, onAnswer, showResults }: TaskRendererProps) {
    switch (section.type) {
        case 'dialog':
            return <DialogView items={section.items} />;

        case 'multiple_choice':
            return (
                <MCQView
                    items={section.items}
                    answers={answers}
                    onAnswer={onAnswer}
                    showResults={showResults}
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
                />
            );

        case 'reorder_sentence':
            return (
                <ReorderView
                    items={section.items}
                    answers={answers}
                    onAnswer={onAnswer}
                    showResults={showResults}
                />
            );

        case 'rich_text':
        case 'reading':
            return (
                <div className="space-y-6">
                    {section.items.map((item: any, i: number) => (
                        <div key={i} className="prose dark:prose-invert max-w-none">
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
                            <ItemByType item={item} answers={answers} onAnswer={onAnswer} showResults={showResults} />
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
