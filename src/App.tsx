import { useState, useEffect } from 'react';
import { ModuleGrid } from './features/learning/ModuleGrid';
import { LessonList } from './features/learning/LessonList';
import { LessonContainer } from './features/shared/LessonContainer';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DiagnosticsPanel } from './components/DiagnosticsPanel';
import { Artikeltrainer } from './features/learning/Artikeltrainer';
import { AdminDashboard } from './features/admin/AdminDashboard';
import { StoryMode } from './features/story/StoryMode';
import { Login } from './features/auth/Login';
import { AuthService, User } from './lib/auth';
import { useTranslation } from './lib/i18n';

type ViewState =
    | { type: 'modules' }
    | { type: 'artikel' }
    | { type: 'vokabeltrainer' }
    | { type: 'story' }
    | { type: 'media' }
    | { type: 'tools' }
    | { type: 'admin' }
    | { type: 'lessons', moduleId: string }
    | { type: 'player', lessonId: string, moduleId: string, mode: 'learn' | 'edit' }
    | { type: 'settings' };

import { firestore } from './lib/firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';

function App() {
    const [user, setUser] = useState<User | null>(AuthService.getCurrentUser());
    const [view, setView] = useState<ViewState>({ type: 'modules' });
    const [history, setHistory] = useState<ViewState[]>([]);

    useEffect(() => {
        if (!user || user.role === 'admin') return;

        // Sync user profile from Firestore to get updated permissions
        const userRef = doc(firestore, 'users', user.id);
        const unsubscribe = onSnapshot(userRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.data();
                const updatedUser: User = {
                    ...user,
                    name: data.name || user.name,
                    permissions: data.permissions || {},
                    role: data.role as 'admin' | 'user'
                };
                setUser(updatedUser);
                localStorage.setItem('lingolume_user', JSON.stringify(updatedUser));
            }
        });

        return () => unsubscribe();
    }, [user?.id]);

    if (!user) {
        return <Login onLogin={setUser} />;
    }

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

    const { t } = useTranslation();

    const getBreadcrumbs = () => {
        const bcs = [{ label: t('lernplan'), onClick: () => setView({ type: 'modules' }) }];

        if (view.type === 'artikel') {
            bcs.push({ label: t('artikeltrainer'), onClick: () => { } });
        } else if (view.type === 'story') {
            bcs.push({ label: t('story_modus'), onClick: () => { } });
        } else if (view.type === 'admin') {
            bcs.push({ label: t('admin_bereich'), onClick: () => { } });
        } else if (view.type === 'lessons') {
            bcs.push({ label: view.moduleId, onClick: () => { } });
        } else if (view.type === 'player') {
            bcs.push({ label: view.moduleId, onClick: () => setView({ type: 'lessons', moduleId: view.moduleId }) });
            // For now, don't show lesson number since ID is generic, or try to extract it from context if we had it.
            // A simple "Lektion" is better than "undefined"
            bcs.push({ label: t('lektionen'), onClick: () => { } });
        } else if (view.type === 'settings') {
            bcs.push({ label: t('einstellungen'), onClick: () => { } });
        }

        return bcs;
    };

    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden">
            <Sidebar
                user={user}
                activeView={view.type}
                onNavigate={(id) => setView({ type: id as any })}
            />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header
                    breadcrumbs={getBreadcrumbs()}
                    onBack={handleBack}
                    canBack={history.length > 0}
                    onHome={() => setView({ type: 'modules' })}
                    user={user}
                    onLogout={() => AuthService.logout()}
                />

                <main className="flex-1 overflow-auto bg-slate-50/50">
                    {view.type === 'modules' && (
                        <ModuleGrid
                            user={user}
                            onSelectModule={(moduleId) => navigateTo({ type: 'lessons', moduleId })}
                        />
                    )}

                    {view.type === 'artikel' && (
                        <Artikeltrainer />
                    )}

                    {view.type === 'story' && (
                        <StoryMode />
                    )}

                    {view.type === 'admin' && (
                        <AdminDashboard />
                    )}

                    {view.type === 'lessons' && (
                        <LessonList
                            moduleId={view.moduleId}
                            onSelectLesson={(lessonId) => navigateTo({ type: 'player', lessonId, moduleId: view.moduleId, mode: 'learn' })}
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

                    {view.type === 'vokabeltrainer' && (
                        <div className="p-8 text-center mt-20">
                            <h2 className="text-3xl font-black mb-4">Vokabeltrainer</h2>
                            <p className="text-muted-foreground">Vertiefe deinen Wortschatz mit interaktiven Übungen. Demnächst verfügbar!</p>
                        </div>
                    )}
                    {view.type === 'media' && (
                        <div className="p-8 text-center mt-20">
                            <h2 className="text-3xl font-black mb-4">Medienbibliothek</h2>
                            <p className="text-muted-foreground">Hier findest du bald alle deine heruntergeladenen Audio- und Videodateien.</p>
                        </div>
                    )}
                    {view.type === 'tools' && (
                        <div className="p-8 text-center mt-20">
                            <h2 className="text-3xl font-black mb-4">Lern-Werkzeuge</h2>
                            <p className="text-muted-foreground">Wörterbücher, Grammatiktabellen und praktische Tools in Kürze verfügbar.</p>
                        </div>
                    )}
                    {view.type === 'settings' && <div className="p-8">Einstellungen (Coming Soon)</div>}
                </main>
            </div>
        </div>
    );
}

export default App;
