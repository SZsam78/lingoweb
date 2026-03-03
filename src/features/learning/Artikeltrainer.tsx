import React, { useState, useEffect } from 'react';
import { VocabularyDB, VocabularyItem } from '@/lib/vocabularyDb';
import { Upload, ChevronRight, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Artikeltrainer() {
    const [mode, setMode] = useState<'learn' | 'import'>('learn');

    return (
        <div className="flex flex-col h-full bg-slate-50/50 p-8 overflow-y-auto">
            <div className="max-w-4xl w-full mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-slate-900">Artikeltrainer</h1>
                        <p className="text-muted-foreground mt-2">Der, die oder das? Lerne die deutschen Begleiter.</p>
                    </div>
                    <div className="flex bg-white rounded-xl shadow-sm border p-1">
                        <button
                            onClick={() => setMode('learn')}
                            className={cn(
                                "px-6 py-2 rounded-lg text-sm font-semibold transition-all",
                                mode === 'learn' ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-slate-50 text-slate-600"
                            )}
                        >
                            Lernen
                        </button>
                        <button
                            onClick={() => setMode('import')}
                            className={cn(
                                "px-6 py-2 rounded-lg text-sm font-semibold transition-all",
                                mode === 'import' ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-slate-50 text-slate-600"
                            )}
                        >
                            Import
                        </button>
                    </div>
                </div>

                {mode === 'learn' ? <LearnMode /> : <ImportMode />}
            </div>
        </div>
    );
}

function LearnMode() {
    const [items, setItems] = useState<VocabularyItem[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedLevel, setSelectedLevel] = useState('A1.1');
    const [result, setResult] = useState<'pending' | 'correct' | 'incorrect'>('pending');

    const levels = ['A1.1', 'A1.2', 'A2.1', 'A2.2', 'B1.1', 'B1.2'];

    useEffect(() => {
        loadVocab();
    }, [selectedLevel]);

    const loadVocab = async () => {
        const data = await VocabularyDB.getVocabularyByLevel(selectedLevel);
        setItems(data);
        setCurrentIndex(0);
        setResult('pending');
    };

    const handleAnswer = (article: 'der' | 'die' | 'das') => {
        if (result !== 'pending') return;

        const currentItem = items[currentIndex];
        if (currentItem.article === article) {
            setResult('correct');
        } else {
            setResult('incorrect');
        }
    };

    const nextWord = () => {
        setResult('pending');
        setCurrentIndex(prev => (prev + 1) % items.length);
    };

    if (items.length === 0) {
        return (
            <div className="bg-white rounded-3xl p-12 text-center border shadow-sm">
                <h3 className="text-xl font-bold mb-4">Keine Wörter gefunden</h3>
                <p className="text-muted-foreground mb-6">Für das Level {selectedLevel} gibt es noch keine Vokabeln im System.</p>
                <div className="flex justify-center gap-2">
                    {levels.map(l => (
                        <button
                            key={l}
                            onClick={() => setSelectedLevel(l)}
                            className={cn("px-4 py-2 rounded-full border text-sm", selectedLevel === l && "bg-slate-900 text-white")}
                        >
                            {l}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    const currentItem = items[currentIndex];

    return (
        <div className="space-y-6">
            <div className="flex gap-2">
                {levels.map(l => (
                    <button
                        key={l}
                        onClick={() => setSelectedLevel(l)}
                        className={cn("px-4 py-2 rounded-full border text-sm font-medium transition-all",
                            selectedLevel === l ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 hover:bg-slate-50")}
                    >
                        {l}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-3xl p-12 text-center border shadow-sm relative overflow-hidden">
                <div className="absolute top-6 left-6 text-sm font-bold text-slate-400">
                    Wort {currentIndex + 1} von {items.length}
                </div>

                <div className="my-16">
                    <h2 className={cn(
                        "text-6xl font-black tracking-tight mb-8 transition-colors duration-300",
                        result === 'correct' ? "text-green-600" : result === 'incorrect' ? "text-red-600" : "text-slate-900"
                    )}>
                        {result !== 'pending' && <span className="opacity-50 mr-2">{currentItem.article}</span>}
                        {currentItem.lemma}
                    </h2>

                    <div className="h-24">
                        {result !== 'pending' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-2">
                                <div className="inline-flex items-center gap-2 px-6 py-3 bg-slate-50 rounded-2xl border text-lg">
                                    <span className="font-bold text-slate-400">Plural:</span>
                                    <span className="font-medium">{currentItem.plural}</span>
                                </div>
                                <p className="text-slate-500 italic mt-2">{currentItem.en}</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-center gap-4 max-w-lg mx-auto">
                    {(['der', 'die', 'das'] as const).map(article => (
                        <button
                            key={article}
                            disabled={result !== 'pending'}
                            onClick={() => handleAnswer(article)}
                            className={cn(
                                "flex-1 py-6 rounded-2xl text-2xl font-black border-2 transition-all",
                                result === 'pending' ? "bg-white hover:bg-slate-50 hover:border-primary/50 text-slate-700" :
                                    result === 'correct' && currentItem.article === article ? "bg-green-500 border-green-600 text-white" :
                                        result === 'incorrect' && currentItem.article === article ? "bg-green-100 border-green-500 text-green-700" : // Show correct one if wrong
                                            "bg-slate-50 border-slate-200 text-slate-400 opacity-50"
                            )}
                        >
                            {article}
                        </button>
                    ))}
                </div>

                {result !== 'pending' && (
                    <div className="mt-12 flex justify-center animate-in fade-in">
                        <button
                            onClick={nextWord}
                            className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-full font-bold hover:bg-slate-800 transition-colors shadow-lg"
                        >
                            Nächstes Wort <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

function ImportMode() {
    const [jsonInput, setJsonInput] = useState('');
    const [status, setStatus] = useState('');

    const handleImport = async () => {
        try {
            const data = JSON.parse(jsonInput);
            if (!Array.isArray(data)) throw new Error("JSON muss ein Array sein.");
            await VocabularyDB.importVocabulary(data);
            setStatus(`✅ Erfolgreich importiert: ${data.length} Wörter!`);
            setJsonInput('');
        } catch (e: any) {
            setStatus(`❌ Fehler: ${e.message}`);
        }
    };

    return (
        <div className="bg-white rounded-3xl p-8 border shadow-sm">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5 text-primary" />
                Vokabel-Import
            </h2>
            <p className="text-muted-foreground mb-6">
                Fügen Sie hier das JSON-Format für den Artikeltrainer ein. Benötigte Felder: <code className="bg-slate-100 px-2 py-1 rounded">lemma, article, plural, level, en</code>.
            </p>

            <textarea
                className="w-full h-64 p-4 border rounded-xl font-mono text-sm bg-slate-50 focus:border-primary outline-none transition-colors mb-4"
                placeholder={'[\n  {\n    "lemma": "Baum",\n    "article": "der",\n    "plural": "die Bäume",\n    "level": "A1.1",\n    "en": "tree"\n  }\n]'}
                value={jsonInput}
                onChange={e => setJsonInput(e.target.value)}
            />

            <div className="flex items-center justify-between">
                <div className="font-medium text-sm">{status}</div>
                <button
                    onClick={handleImport}
                    className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold shadow-md hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                    <Upload className="w-4 h-4" /> Importieren
                </button>
            </div>
        </div>
    );
}
