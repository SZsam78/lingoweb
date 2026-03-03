import { MODULES } from '@/content/meta';
import { cn } from '@/lib/utils';
import { GraduationCap } from 'lucide-react';

interface ModuleGridProps {
    onSelectModule: (moduleId: string) => void;
}

export function ModuleGrid({ onSelectModule }: ModuleGridProps) {
    return (
        <div className="p-8 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                LingoLume Lernplattform
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {MODULES.map((module) => (
                    <button
                        key={module.id}
                        onClick={() => onSelectModule(module.id)}
                        className={cn(
                            "group relative overflow-hidden rounded-2xl border bg-card p-6 text-left transition-all hover:shadow-xl hover:-translate-y-1 active:scale-95",
                            "border-slate-200 dark:border-slate-800"
                        )}
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                <GraduationCap className="h-6 w-6" />
                            </div>
                            <span className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                                {module.id}
                            </span>
                        </div>
                        <h3 className="text-xl font-bold mb-2">{module.title}</h3>
                        <div className="mt-4 h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-primary w-0 transition-all duration-500" />
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">0% abgeschlossen</p>
                    </button>
                ))}
            </div>
        </div>
    );
}
