import { useState, useEffect } from 'react';
import { ChevronLeft, Home, ChevronRight, LogOut, User as UserIcon, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { User } from '@/lib/auth';
import { useTranslation, Language } from '@/lib/i18n';

interface Breadcrumb {
    label: string;
    onClick: () => void;
}

interface HeaderProps {
    breadcrumbs: Breadcrumb[];
    onBack: () => void;
    canBack: boolean;
    onHome: () => void;
    user: User;
    onLogout: () => void;
}

export function Header({ breadcrumbs, onBack, canBack, onHome, user, onLogout }: HeaderProps) {
    const { language, setLanguage, t } = useTranslation();
    const [showLangMenu, setShowLangMenu] = useState(false);

    const languages: { code: Language; label: string; flag: string }[] = [
        { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
        { code: 'en', label: 'English', flag: '🇺🇸' },
        { code: 'fr', label: 'Français', flag: '🇫🇷' },
        { code: 'es', label: 'Español', flag: '🇪🇸' },
        { code: 'ar', label: 'العربية', flag: '🇸🇦' },
        { code: 'uk', label: 'Українська', flag: '🇺🇦' },
        { code: 'ja', label: '日本語', flag: '🇯🇵' },
        { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
    ];

    useEffect(() => {
        document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = language;
    }, [language]);
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
                {/* Language Switcher */}
                <div className="relative">
                    <button
                        onClick={() => setShowLangMenu(!showLangMenu)}
                        className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-xl border border-transparent hover:border-primary/20 transition-all font-bold text-xs uppercase tracking-widest"
                    >
                        <Globe className="h-4 w-4 text-primary" />
                        <span className="hidden sm:inline">{languages.find(l => l.code === language)?.flag}</span>
                    </button>

                    {showLangMenu && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl border shadow-2xl z-50 p-2 animate-in fade-in zoom-in-95 duration-200">
                            {languages.map(lang => (
                                <button
                                    key={lang.code}
                                    onClick={() => {
                                        setLanguage(lang.code);
                                        setShowLangMenu(false);
                                    }}
                                    className={cn(
                                        "w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-colors",
                                        language === lang.code ? "bg-primary text-white" : "hover:bg-slate-50 text-slate-600"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <span>{lang.flag}</span>
                                        <span>{lang.label}</span>
                                    </div>
                                    {language === lang.code && <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex flex-col items-end mr-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#1A1A1A]">{user.name}</span>
                    <span className="text-[8px] font-bold text-muted-foreground uppercase">{user.role}</span>
                </div>
                <div className="h-10 w-10 bg-slate-100 rounded-xl flex items-center justify-center text-primary border shadow-sm">
                    <UserIcon className="h-5 w-5" />
                </div>
                <button
                    onClick={onLogout}
                    className="p-2 ml-2 h-10 w-10 bg-slate-100 rounded-xl border flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-500 transition-all shadow-sm"
                    title="Abmelden"
                >
                    <LogOut className="h-5 w-5" />
                </button>
            </div>
        </header>
    );
}
