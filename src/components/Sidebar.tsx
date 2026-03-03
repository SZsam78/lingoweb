import { LayoutGrid, Settings, HelpCircle, LogOut, GraduationCap, PlaySquare, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

interface SidebarProps {
    activeView: string;
    onNavigate: (id: string) => void;
    userRole?: 'admin' | 'user';
}

export function Sidebar({ activeView, onNavigate, userRole = 'user' }: SidebarProps) {
    const { t } = useTranslation();

    const items = [
        { id: 'modules', label: t('lernplan'), icon: LayoutGrid },
        { id: 'artikel', label: t('artikeltrainer'), icon: GraduationCap },
        { id: 'story', label: t('story_modus'), icon: PlaySquare },
        ...(userRole === 'admin' ? [{ id: 'admin', label: t('admin_bereich'), icon: ShieldCheck }] : []),
        { id: 'settings', label: t('einstellungen'), icon: Settings },
    ];

    return (
        <aside className="w-72 bg-[#F9F7F2] border-r border-[#EFEBE0] flex flex-col h-screen shadow-sm">
            <div className="p-8">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
                        <span className="text-white font-black text-xl">L</span>
                    </div>
                    <h1 className="text-2xl font-black tracking-tighter text-[#1A1A1A]">
                        Lingo<span className="text-primary font-black">Lume</span>
                    </h1>
                </div>
            </div>

            <nav className="flex-1 px-4 space-y-3">
                <div className="px-4 mb-2">
                    <span className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase opacity-60">Hauptmenü</span>
                </div>
                {items.map((item) => {
                    const Icon = item.icon;
                    const active = activeView === item.id || (activeView === 'lessons' && item.id === 'modules');

                    return (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className={cn(
                                "w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all font-extrabold text-sm",
                                active
                                    ? "bg-primary text-white shadow-xl shadow-primary/25 translate-x-1"
                                    : "text-[#1A1A1A]/60 hover:bg-[#F0EEE6] hover:text-[#1A1A1A]"
                            )}
                        >
                            <Icon className={cn("h-5 w-5", active ? "text-white" : "text-primary/70")} />
                            {item.label}
                        </button>
                    );
                })}
            </nav>

            <div className="p-6 space-y-4">
                <div className="bg-[#F0EEE6] p-5 rounded-[2rem] border border-[#E6E2D6] relative overflow-hidden group">
                    <div className="relative z-10">
                        <div className="text-[10px] font-bold text-primary/70 uppercase tracking-widest mb-3">Community</div>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-md">
                                <span className="text-lg">👋</span>
                            </div>
                            <div>
                                <div className="text-xs font-black text-[#1A1A1A]">Helfe anderen!</div>
                                <div className="text-[10px] text-muted-foreground font-bold">Werde Mentor</div>
                            </div>
                        </div>
                    </div>
                </div>

                <button className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-muted-foreground hover:bg-[#F0EEE6] transition-all font-bold text-sm">
                    <LogOut className="h-5 w-5" />
                    {t('abmelden')}
                </button>
            </div>
        </aside>
    );
}

