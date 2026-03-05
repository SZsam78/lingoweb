import { useState, useEffect } from 'react';
import { ModuleGrid } from './features/learning/ModuleGrid';
import { LessonList } from './features/learning/LessonList';
import { LessonContainer } from './features/shared/LessonContainer';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { cn } from './lib/utils';
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
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(() => {
        return localStorage.getItem('lingolume_theme') === 'dark';
    });

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('lingolume_theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('lingolume_theme', 'light');
        }
    }, [isDarkMode]);

    // Browser History Synchronization
    useEffect(() => {
        const handlePopState = (event: PopStateEvent) => {
            if (event.state && event.state.view) {
                setView(event.state.view);
                // Also update history stack to allow "going back" multiple times correctly
                // Note: This is an approximation since we manage history state manually as well
                setHistory(prev => prev.slice(0, -1));
            } else {
                setView({ type: 'modules' });
            }
        };

        window.addEventListener('popstate', handlePopState);

        // Initial state for the first page load
        if (!window.history.state) {
            window.history.replaceState({ view }, '');
        }

        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

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

        // Push to browser history
        window.history.pushState({ view: nextView }, '');

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
            // Trigger browser back for consistency
            window.history.back();
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
        <div className="flex h-[100dvh] bg-background text-foreground overflow-hidden relative overflow-x-hidden">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-all"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <div className={cn(
                "fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 w-72 shrink-0",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <Sidebar
                    user={user}
                    activeView={view.type}
                    onNavigate={(id) => {
                        setView({ type: id as any });
                        setIsSidebarOpen(false);
                    }}
                />
            </div>

            <div className="flex-1 flex flex-col overflow-hidden w-full">
                <Header
                    breadcrumbs={getBreadcrumbs()}
                    onBack={handleBack}
                    canBack={history.length > 0}
                    onHome={() => setView({ type: 'modules' })}
                    user={user}
                    onLogout={() => AuthService.logout()}
                    onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                    isDarkMode={isDarkMode}
                    onDarkModeToggle={() => setIsDarkMode(!isDarkMode)}
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
                            onNextLesson={(newLessonId, newModuleId) => navigateTo({
                                type: 'player',
                                lessonId: newLessonId,
                                moduleId: newModuleId || view.moduleId,
                                mode: 'learn'
                            })}
                        />
                    )}

                    {view.type === 'vokabeltrainer' && (
                        <div className="p-8 text-center mt-20">
                            <h2 className="text-3xl font-black mb-4">{t('vokabeltrainer')}</h2>
                            <p className="text-muted-foreground">{t('vokabeltrainer_beschreibung')}</p>
                        </div>
                    )}
                    {view.type === 'media' && (
                        <div className="p-8 text-center mt-20">
                            <h2 className="text-3xl font-black mb-4">{t('medien')}</h2>
                            <p className="text-muted-foreground">{t('medien_beschreibung')}</p>
                        </div>
                    )}
                    {view.type === 'tools' && (
                        <div className="p-8 text-center mt-20">
                            <h2 className="text-3xl font-black mb-4">{t('werkzeuge')}</h2>
                            <p className="text-muted-foreground">{t('werkzeuge_beschreibung')}</p>
                        </div>
                    )}
                    {view.type === 'settings' && <div className="p-8">Einstellungen (Coming Soon)</div>}
                </main>
            </div>
        </div>
    );
}

export default App;
