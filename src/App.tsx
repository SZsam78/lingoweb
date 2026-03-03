import { useState, useEffect } from 'react';
import { ModuleGrid } from './features/learning/ModuleGrid';
import { LessonList } from './features/learning/LessonList';
import { LessonContainer } from './features/shared/LessonContainer';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DiagnosticsPanel } from './components/DiagnosticsPanel';
import { Artikeltrainer } from './features/learning/Artikeltrainer';

type ViewState =
    | { type: 'modules' }
    | { type: 'artikel' }
    | { type: 'lessons', moduleId: string }
    | { type: 'player', lessonId: string, mode: 'learn' | 'edit' }
    | { type: 'settings' };

function App() {
    const [view, setView] = useState<ViewState>({ type: 'modules' });
    const [history, setHistory] = useState<ViewState[]>([]);

    const navigateTo = (nextView: ViewState) => {
        if (sessionStorage.getItem('unsaved_changes') === 'true') {
            if (!window.confirm("Achtung: Sie haben ungespeicherte Änderungen. Wollen Sie die Seite wirklich verlassen?")) {
                return;
            }
        }
        sessionStorage.removeItem('unsaved_changes');
        sessionStorage.setItem('last_nav', `navigate to: ${JSON.stringify(nextView)}`);
        setHistory(prev => [...prev, view]);
        setView(nextView);
    };

    const handleBack = () => {
        if (sessionStorage.getItem('unsaved_changes') === 'true') {
            if (!window.confirm("Achtung: Sie haben ungespeicherte Änderungen. Wollen Sie die Seite wirklich verlassen?")) {
                return;
            }
        }
        sessionStorage.removeItem('unsaved_changes');
        if (history.length > 0) {
            const prev = history[history.length - 1];
            sessionStorage.setItem('last_nav', `back to: ${JSON.stringify(prev)}`);
            setHistory(prevHistory => prevHistory.slice(0, -1));
            setView(prev);
        }
    };

    const getBreadcrumbs = () => {
        const bcs = [{ label: 'Lernplan', onClick: () => setView({ type: 'modules' }) }];

        if (view.type === 'artikel') {
            bcs.push({ label: 'Artikeltrainer', onClick: () => { } });
        } else if (view.type === 'lessons') {
            bcs.push({ label: view.moduleId, onClick: () => { } });
        } else if (view.type === 'player') {
            const [mod] = view.lessonId.split('-');
            bcs.push({ label: mod, onClick: () => setView({ type: 'lessons', moduleId: mod }) });
            bcs.push({ label: `Lektion ${view.lessonId.split('-L')[1]}`, onClick: () => { } });
        } else if (view.type === 'settings') {
            bcs.push({ label: 'Einstellungen', onClick: () => { } });
        }

        return bcs;
    };

    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden">
            <Sidebar
                activeView={view.type}
                onNavigate={(id) => navigateTo({ type: id as any })}
            />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header
                    breadcrumbs={getBreadcrumbs()}
                    onBack={handleBack}
                    canBack={history.length > 0}
                    onHome={() => setView({ type: 'modules' })}
                />

                <main className="flex-1 overflow-auto bg-slate-50/50">
                    {view.type === 'modules' && (
                        <ModuleGrid
                            onSelectModule={(moduleId) => navigateTo({ type: 'lessons', moduleId })}
                        />
                    )}

                    {view.type === 'artikel' && (
                        <Artikeltrainer />
                    )}

                    {view.type === 'lessons' && (
                        <LessonList
                            moduleId={view.moduleId}
                            onSelectLesson={(lessonId) => navigateTo({ type: 'player', lessonId, mode: 'learn' })}
                            onBack={handleBack}
                        />
                    )}

                    {view.type === 'player' && (
                        <LessonContainer
                            lessonId={view.lessonId}
                            initialMode={view.mode}
                            onBack={handleBack}
                        />
                    )}

                    {view.type === 'settings' && (
                        <DiagnosticsPanel />
                    )}
                </main>
            </div>
        </div>
    );
}

export default App;
