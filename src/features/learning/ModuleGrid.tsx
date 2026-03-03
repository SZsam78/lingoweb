import { MODULES } from '@/content/meta';
import { cn } from '@/lib/utils';
import { GraduationCap } from 'lucide-react';

interface ModuleGridProps {
    onSelectModule: (moduleId: string) => void;
}

const getLevelGradient = (moduleId: string) => {
    if (moduleId.startsWith('A1')) return "from-[#EE964B] to-[#B65D2A]";
    if (moduleId.startsWith('A2')) return "from-[#F9A825] to-[#E65100]";
    if (moduleId.startsWith('B1')) return "from-[#F27059] to-[#9E3A33]";
    if (moduleId.startsWith('B2')) return "from-[#D6434B] to-[#8F2D33]";
    return "from-primary to-primary/80";
};

export function ModuleGrid({ onSelectModule }: ModuleGridProps) {
    return (
        <div className="p-8 max-w-6xl mx-auto min-h-screen">
            <h1 className="text-4xl font-extrabold mb-12 text-center text-[#1A1A1A]">
                Lingo<span className="text-primary">Lume</span> Lernplan
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {MODULES.map((module) => (
                    <button
                        key={module.id}
                        onClick={() => onSelectModule(module.id)}
                        className={cn(
                            "group relative overflow-hidden rounded-[2rem] bg-card p-6 text-left transition-all hover:shadow-2xl hover:-translate-y-2 active:scale-95 border-none shadow-lg",
                        )}
                    >
                        {/* Background Gradient */}
                        <div className={cn(
                            "absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity bg-gradient-to-br",
                            getLevelGradient(module.id)
                        )} />

                        <div className="relative z-10">
                            <div className="flex items-center justify-between gap-4 mb-6">
                                <div className={cn(
                                    "p-4 rounded-2xl text-white shadow-lg bg-gradient-to-br",
                                    getLevelGradient(module.id)
                                )}>
                                    <GraduationCap className="h-6 w-6" />
                                </div>
                                <span className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase opacity-70">
                                    {module.id}
                                </span>
                            </div>
                            <h3 className="text-xl font-extrabold mb-2 text-[#1A1A1A]">{module.title}</h3>
                            <div className="mt-8 h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                                <div className={cn(
                                    "h-full transition-all duration-700 w-[10%] bg-gradient-to-r",
                                    getLevelGradient(module.id)
                                )} />
                            </div>
                            <p className="mt-3 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">0% abgeschlossen</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}

