import { LayoutGrid, Settings, HelpCircle, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
    activeView: string;
    onNavigate: (view: string) => void;
}

export function Sidebar({ activeView, onNavigate }: SidebarProps) {
    const items = [
        { id: 'modules', label: 'Lernplan', icon: LayoutGrid },
        { id: 'artikel', label: 'Artikeltrainer', icon: LayoutGrid }, // Using LayoutGrid temporarily, you can change icon later
        { id: 'settings', label: 'Einstellungen', icon: Settings },
    ];

    return (
        <aside className="w-64 bg-card border-r flex flex-col h-screen">
            <div className="p-6 border-b">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-primary rounded-lg" />
                    <h1 className="text-xl font-black tracking-tight">LingoLume</h1>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {items.map((item) => {
                    const Icon = item.icon;
                    const active = activeView === item.id || (activeView === 'lessons' && item.id === 'modules');

                    return (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium",
                                active
                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                    : "text-muted-foreground hover:bg-slate-100 hover:text-foreground"
                            )}
                        >
                            <Icon className="h-5 w-5" />
                            {item.label}
                        </button>
                    );
                })}
            </nav>

            <div className="p-4 border-t space-y-1">
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-slate-100 transition-all font-medium">
                    <HelpCircle className="h-5 w-5" />
                    Hilfe
                </button>
                <div className="pt-2">
                    <div className="px-4 py-3 bg-slate-50 rounded-xl">
                        <div className="text-xs font-bold text-slate-400 uppercase mb-2">Benutzer</div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-bold">Offline User</span>
                            <LogOut className="h-4 w-4 text-slate-400" />
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
