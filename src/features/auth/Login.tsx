import { useState } from 'react';
import { AuthService, User } from '@/lib/auth';
import { ShieldCheck, LogIn, Loader2, Info } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

interface LoginProps {
    onLogin: (user: User) => void;
}

export function Login({ onLogin }: LoginProps) {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const user = await AuthService.login(email, password);
            if (user) {
                onLogin(user);
            } else {
                setError('Ungültige Anmeldedaten. Bitte versuchen Sie es erneut.');
            }
        } catch (err) {
            setError('Ein Fehler ist aufgetreten. Bitte prüfen Sie Ihre Verbindung.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F9F7F2] flex flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent">
            <div className="w-full max-w-[440px] space-y-8">
                {/* Logo Section */}
                <div className="text-center">
                    <div className="h-20 w-20 bg-primary rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/20 rotate-3 transform hover:rotate-0 transition-transform duration-500">
                        <LogIn className="h-10 w-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-black text-[#1A1A1A] tracking-tight mb-2 italic">LingoLume</h1>
                    <p className="text-muted-foreground font-medium uppercase tracking-[0.2em] text-[10px]">Sprachschule Management Portal</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[2.5rem] border border-[#EFEBE0] shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-primary" />

                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest mb-2 text-[#1A1A1A]">E-Mail / Benutzername</label>
                            <input
                                type="text"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-[#F9F7F2] border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl px-5 py-4 text-sm font-bold outline-none transition-all"
                                placeholder="name@lingolume.de"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest mb-2 text-[#1A1A1A]">Passwort</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-[#F9F7F2] border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl px-5 py-4 text-sm font-bold outline-none transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        {error && (
                            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 animate-shake">
                                <Info className="h-4 w-4 text-red-500" />
                                <p className="text-xs font-bold text-red-600">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#1A1A1A] text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all shadow-lg hover:shadow-black/20 flex items-center justify-center gap-2 group disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                                <>
                                    {t('anmelden')}
                                    <div className="h-2 w-2 rounded-full bg-primary group-hover:scale-150 transition-transform" />
                                </>
                            )}
                        </button>
                    </div>

                    <div className="mt-8 pt-8 border-t border-dashed text-center">
                        <div className="flex items-center justify-center gap-2 text-muted-foreground">
                            <ShieldCheck className="h-4 w-4 text-primary" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Gesichertes Admin-Panel</span>
                        </div>
                    </div>
                </form>

                <div className="text-center">
                    <p className="text-[11px] text-muted-foreground font-bold">
                        &copy; {new Date().getFullYear()} LingoLume Advanced Agentic Coding
                    </p>
                </div>
            </div>
        </div>
    );
}
