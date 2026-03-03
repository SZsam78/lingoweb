import { ChevronLeft, Home, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Breadcrumb {
    label: string;
    onClick: () => void;
}

interface HeaderProps {
    breadcrumbs: Breadcrumb[];
    onBack: () => void;
    canBack: boolean;
    onHome: () => void;
}

export function Header({ breadcrumbs, onBack, canBack, onHome }: HeaderProps) {
    return (
        <header className="h-16 border-b bg-card px-6 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md bg-card/80">
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                    <button
                        onClick={onBack}
                        disabled={!canBack}
                        className={cn(
                            "p-2 rounded-lg hover:bg-muted transition-colors",
                            !canBack && "opacity-30 cursor-not-allowed"
                        )}
                        title="Zurück"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                        onClick={onHome}
                        className="p-2 rounded-lg hover:bg-muted transition-colors"
                        title="Home"
                    >
                        <Home className="h-5 w-5" />
                    </button>
                </div>

                <nav className="flex items-center text-sm font-medium text-muted-foreground whitespace-nowrap overflow-x-auto no-scrollbar">
                    {breadcrumbs.map((bc, i) => (
                        <div key={i} className="flex items-center">
                            {i > 0 && <ChevronRight className="h-4 w-4 mx-2 text-slate-300" />}
                            <button
                                onClick={bc.onClick}
                                className={cn(
                                    "hover:text-foreground transition-colors py-1 px-2 rounded-md",
                                    i === breadcrumbs.length - 1 && "text-foreground font-bold bg-slate-100"
                                )}
                            >
                                {bc.label}
                            </button>
                        </div>
                    ))}
                </nav>
            </div>

            <div className="flex items-center gap-4">
                <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-white font-black text-xs">
                    LL
                </div>
                <span className="font-bold text-sm hidden sm:inline">LingoLume</span>
            </div>
        </header>
    );
}
