import { useState } from 'react';
import { AnyItem, ItemMetaSchema } from '@/content/schema';
import { Trash2, Image as ImageIcon, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MediaManager } from './MediaManager';

// --- Shared Meta Editor ---
export function ItemMetaEditor({ meta, onChange }: { meta: any, onChange: (meta: any) => void }) {
    return (
        <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 text-sm">
            <div className="space-y-1">
                <label className="font-bold text-slate-500 uppercase text-[10px]">Schwierigkeit</label>
                <select
                    value={meta?.difficulty || 'medium'}
                    onChange={(e) => onChange({ ...meta, difficulty: e.target.value })}
                    className="w-full p-2 rounded-lg border bg-white focus:ring-2 focus:ring-primary/20 outline-none font-sans"
                >
                    <option value="easy">Leicht</option>
                    <option value="medium">Mittel</option>
                    <option value="hard">Schwer</option>
                </select>
            </div>
            <div className="space-y-1">
                <label className="font-bold text-slate-500 uppercase text-[10px]">Punkte</label>
                <input
                    type="number"
                    value={meta?.points || 0}
                    onChange={(e) => onChange({ ...meta, points: parseInt(e.target.value) })}
                    className="w-full p-2 rounded-lg border bg-white focus:ring-2 focus:ring-primary/20 outline-none font-sans"
                />
            </div>
            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    checked={meta?.isMandatory || false}
                    onChange={(e) => onChange({ ...meta, isMandatory: e.target.checked })}
                    className="accent-primary"
                />
                <label className="text-xs font-medium">Pflichtaufgabe</label>
            </div>
            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    checked={meta?.canShowSolution ?? true}
                    onChange={(e) => onChange({ ...meta, canShowSolution: e.target.checked })}
                    className="accent-primary"
                />
                <label className="text-xs font-medium">Lösung anzeigen erlaubt</label>
            </div>
            <div className="col-span-2 space-y-1 mt-2 border-t pt-4">
                <label className="font-bold text-slate-500 uppercase text-[10px]">Google Drive Audio Link (Optional)</label>
                <input
                    type="text"
                    placeholder="Audio Link via Google Drive (https://drive.google.com/...)"
                    value={meta?.audioUrl || ''}
                    onChange={(e) => onChange({ ...meta, audioUrl: e.target.value })}
                    className="w-full p-2 rounded-lg border bg-white focus:ring-2 focus:ring-primary/20 outline-none font-sans text-xs"
                />
            </div>
        </div>
    );
}

// --- Rich Text Editor ---
export function RichTextEditor({ item, onChange }: { item: any, onChange: (item: any) => void }) {
    return (
        <div className="space-y-4">
            <MediaManager
                value={item.image}
                onChange={(image) => onChange({ ...item, image })}
            />
            <textarea
                value={item.content || ''}
                onChange={(e) => onChange({ ...item, content: e.target.value })}
                placeholder="Inhalt (Markdown unterstützt)..."
                className="w-full h-32 p-4 rounded-xl border focus:ring-2 focus:ring-primary/20 outline-none font-sans"
            />
        </div>
    );
}

// --- MCQ Editor ---
export function MCQEditor({ item, onChange }: { item: any, onChange: (item: any) => void }) {
    const addChoice = () => {
        const choices = [...(item.choices || []), { id: crypto.randomUUID(), text: '', isCorrect: false }];
        onChange({ ...item, choices });
    };

    const updateChoice = (id: string, updates: any) => {
        const choices = item.choices.map((c: any) => c.id === id ? { ...c, ...updates } : c);
        onChange({ ...item, choices });
    };

    return (
        <div className="space-y-4">
            <MediaManager
                value={item.image}
                onChange={(image) => onChange({ ...item, image })}
            />
            <input
                value={item.question || ''}
                onChange={(e) => onChange({ ...item, question: e.target.value })}
                placeholder="Frage..."
                className="w-full p-3 rounded-xl border font-bold focus:ring-2 focus:ring-primary/20 outline-none"
            />
            <div className="space-y-2">
                {item.choices?.map((choice: any) => (
                    <div key={choice.id} className="flex gap-2">
                        <button
                            onClick={() => updateChoice(choice.id, { isCorrect: !choice.isCorrect })}
                            className={cn(
                                "h-10 w-10 rounded-lg flex items-center justify-center border-2 transition-all",
                                choice.isCorrect ? "bg-green-500 border-green-500 text-white" : "border-slate-200 text-slate-400"
                            )}
                        >
                            <Check className="h-5 w-5" />
                        </button>
                        <input
                            value={choice.text}
                            onChange={(e) => updateChoice(choice.id, { text: e.target.value })}
                            className="flex-1 p-2 border rounded-lg focus:ring-primary/20 outline-none"
                            placeholder="Antwortmöglichkeit..."
                        />
                        <button
                            onClick={() => onChange({ ...item, choices: item.choices.filter((c: any) => c.id !== choice.id) })}
                            className="p-2 text-slate-300 hover:text-destructive transition-colors"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                ))}
                <button onClick={addChoice} className="text-sm font-bold text-primary hover:underline px-1">+ Option hinzufügen</button>
            </div>
        </div>
    );
}

// --- Fill Blank Editor ---
export function FillBlankEditor({ item, onChange }: { item: any, onChange: (item: any) => void }) {
    return (
        <div className="space-y-4">
            <MediaManager
                value={item.image}
                onChange={(image) => onChange({ ...item, image })}
            />
            <div className="p-3 bg-blue-50 text-blue-700 rounded-lg text-xs">
                Nutzen Sie eckige Klammern für Lücken: <strong>Ich [bin|ist] Lukas.</strong> (Erstes Wort ist die richtige Antwort)
            </div>
            <textarea
                value={item.text || ''}
                onChange={(e) => onChange({ ...item, text: e.target.value })}
                placeholder="Text mit Lücken..."
                className="w-full h-24 p-4 rounded-xl border focus:ring-2 focus:ring-primary/20 outline-none"
            />
        </div>
    );
}

// --- Reorder Editor ---
export function ReorderEditor({ item, onChange }: { item: any, onChange: (item: any) => void }) {
    return (
        <div className="space-y-4">
            <input
                value={item.sentence || ''}
                onChange={(e) => onChange({ ...item, sentence: e.target.value })}
                placeholder="Der vollständige Satz..."
                className="w-full p-3 rounded-xl border focus:ring-2 focus:ring-primary/20 outline-none font-medium"
            />
            <p className="text-[10px] text-muted-foreground uppercase font-bold px-1">Wörter werden im Player automatisch gemischt.</p>
        </div>
    );
}

// --- Short Write Editor ---
export function ShortWriteEditor({ item, onChange }: { item: any, onChange: (item: any) => void }) {
    return (
        <div className="space-y-4">
            <textarea
                value={item.prompt || ''}
                onChange={(e) => onChange({ ...item, prompt: e.target.value })}
                placeholder="Schreibauftrag / Frage..."
                className="w-full p-3 rounded-xl border focus:ring-2 focus:ring-primary/20 outline-none font-medium"
            />
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400">Musterlösung</label>
                <textarea
                    value={item.sampleSolution || ''}
                    onChange={(e) => onChange({ ...item, sampleSolution: e.target.value })}
                    placeholder="Erwartete Antwort..."
                    className="w-full p-3 rounded-xl border bg-slate-50 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                />
            </div>
        </div>
    );
}

// --- Matching Editor ---
export function MatchingEditor({ item, onChange }: { item: any, onChange: (item: any) => void }) {
    const addPair = () => {
        const pairs = [...(item.pairs || []), { left: '', right: '' }];
        onChange({ ...item, pairs });
    };

    const updatePair = (index: number, updates: any) => {
        const pairs = item.pairs.map((p: any, i: number) => i === index ? { ...p, ...updates } : p);
        onChange({ ...item, pairs });
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                {item.pairs?.map((pair: any, i: number) => (
                    <div key={i} className="flex gap-2">
                        <input
                            value={pair.left}
                            onChange={(e) => updatePair(i, { left: e.target.value })}
                            className="flex-1 p-2 border rounded-lg focus:ring-primary/20 outline-none"
                            placeholder="Begriff..."
                        />
                        <div className="flex items-center text-slate-300">→</div>
                        <input
                            value={pair.right}
                            onChange={(e) => updatePair(i, { right: e.target.value })}
                            className="flex-1 p-2 border rounded-lg focus:ring-primary/20 outline-none"
                            placeholder="Zuordnung..."
                        />
                        <button
                            onClick={() => onChange({ ...item, pairs: item.pairs.filter((_: any, idx: number) => idx !== i) })}
                            className="p-2 text-slate-300 hover:text-destructive flex-shrink-0"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                ))}
            </div>
            <button onClick={addPair} className="text-sm font-bold text-primary hover:underline px-1">+ Paar hinzufügen</button>
        </div>
    );
}

// --- Roleplay Editor ---
export function RoleplayEditor({ item, onChange }: { item: any, onChange: (item: any) => void }) {
    return (
        <div className="space-y-4">
            <textarea
                value={item.prompt || ''}
                onChange={(e) => onChange({ ...item, prompt: e.target.value })}
                placeholder="Szenario / Rollenbeschreibung..."
                className="w-full h-24 p-4 rounded-xl border focus:ring-2 focus:ring-primary/20 outline-none"
            />
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400">Hilfreiche Redemittel (einzeln durch Komma getrennt)</label>
                <textarea
                    value={item.usefulPhrases?.join(', ') || ''}
                    onChange={(e) => onChange({ ...item, usefulPhrases: e.target.value.split(',').map((s: string) => s.trim()) })}
                    placeholder="Ich möchte..., Könnten Sie...?"
                    className="w-full p-3 rounded-xl border bg-slate-50 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                />
            </div>
        </div>
    );
}

// --- Dialog Editor ---
export function DialogEditor({ item, onChange }: { item: any, onChange: (item: any) => void }) {
    // Auto-migrate old single-line format
    if (item.speaker !== undefined && item.text !== undefined && !item.lines) {
        setTimeout(() => {
            onChange({
                ...item,
                lines: [{ id: crypto.randomUUID(), speaker: item.speaker, text: item.text }],
                speaker: undefined,
                text: undefined
            });
        }, 0);
    }

    const lines = item.lines || [];

    const addLine = () => {
        // Default to alternate speaker if possible
        const lastSpeaker = lines.length > 0 ? lines[lines.length - 1].speaker : 'A';
        const nextSpeaker = lastSpeaker === 'A' ? 'B' : 'A';

        onChange({
            ...item,
            lines: [...lines, { id: crypto.randomUUID(), speaker: nextSpeaker, text: '' }]
        });
    };

    const updateLine = (id: string, updates: any) => {
        onChange({
            ...item,
            lines: lines.map((l: any) => l.id === id ? { ...l, ...updates } : l)
        });
    };

    const removeLine = (id: string) => {
        onChange({
            ...item,
            lines: lines.filter((l: any) => l.id !== id)
        });
    };

    const moveLine = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === lines.length - 1) return;

        const newLines = [...lines];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        [newLines[index], newLines[swapIndex]] = [newLines[swapIndex], newLines[index]];

        onChange({ ...item, lines: newLines });
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                {lines.map((line: any, idx: number) => (
                    <div key={line.id} className="flex gap-2 group">
                        <div className="flex flex-col gap-0.5 justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => moveLine(idx, 'up')} disabled={idx === 0} className="text-slate-300 hover:text-slate-600 disabled:opacity-30">
                                <span className="text-xs">▲</span>
                            </button>
                            <button onClick={() => moveLine(idx, 'down')} disabled={idx === lines.length - 1} className="text-slate-300 hover:text-slate-600 disabled:opacity-30">
                                <span className="text-xs">▼</span>
                            </button>
                        </div>
                        <input
                            value={line.speaker}
                            onChange={(e) => updateLine(line.id, { speaker: e.target.value })}
                            placeholder="A/B..."
                            className="w-16 p-3 rounded-xl border font-bold text-center focus:ring-2 focus:ring-primary/20 outline-none"
                        />
                        <textarea
                            value={line.text}
                            onChange={(e) => updateLine(line.id, { text: e.target.value })}
                            placeholder="Gesprochener Text..."
                            className="flex-1 p-3 min-h-[48px] rounded-xl border focus:ring-2 focus:ring-primary/20 outline-none resize-y"
                            rows={1}
                        />
                        <button
                            onClick={() => removeLine(line.id)}
                            className="p-3 text-slate-300 hover:text-destructive flex-shrink-0"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                ))}
            </div>
            {lines.length === 0 && (
                <div className="text-sm text-slate-500 italic p-4 border border-dashed rounded-xl text-center">
                    Noch keine Dialogzeilen vorhanden.
                </div>
            )}
            <button onClick={addLine} className="text-sm font-bold text-primary hover:underline px-1">+ Zeile hinzufügen</button>
        </div>
    );
}

// --- Mini-Test Editor ---
export function MiniTestEditor({ item, onChange }: { item: any, onChange: (item: any) => void }) {
    // This is a simplified container representation for now.
    return (
        <div className="space-y-4 p-4 bg-orange-50 border border-orange-100 rounded-xl">
            <div className="text-orange-800 font-bold text-sm">Mini-Test (Gemischte Aufgaben)</div>
            <p className="text-xs text-orange-600">
                Dieser Containertyp dient dazu, Unteraufgaben zu gruppieren.
                Fügen Sie stattdessen reguläre Multiple Choice oder Zuordnungsaufgaben direkt im Section "Mini-Test" hinzu.
            </p>
        </div>
    );
}
