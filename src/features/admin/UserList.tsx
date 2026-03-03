import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { ShieldCheck, User, Trash2, ChevronDown, ChevronUp, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserProfile {
    id: string;
    email: string;
    name: string;
    role: string;
    permissions: Record<string, boolean>;
    is_active: boolean;
}

export function UserList() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const snapshot = await getDocs(collection(firestore, 'users'));
                const userList = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as UserProfile[];
                setUsers(userList);
            } catch (err) {
                console.error("Error fetching users:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const togglePermission = async (userId: string, moduleKey: string, currentVal: boolean) => {
        try {
            const userRef = doc(firestore, 'users', userId);
            const user = users.find(u => u.id === userId);
            if (!user) return;

            const newPermissions = { ...user.permissions, [moduleKey]: !currentVal };
            await updateDoc(userRef, { permissions: newPermissions });

            setUsers(users.map(u => u.id === userId ? { ...u, permissions: newPermissions } : u));
        } catch (err) {
            console.error("Error updating permission:", err);
        }
    };

    const modules = [
        { key: 'A1.1', label: 'Modul A1.1' },
        { key: 'A1.2', label: 'Modul A1.2' },
        { key: 'A2.1', label: 'Modul A2.1' },
        { key: 'A2.2', label: 'Modul A2.2' },
        { key: 'B1.1', label: 'Modul B1.1' },
        { key: 'B1.2', label: 'Modul B1.2' },
        { key: 'B2.1', label: 'Modul B2.1' },
        { key: 'B2.2', label: 'Modul B2.2' },
        { key: 'vocab_trainer', label: 'Vokabeltrainer' },
        { key: 'story_mode', label: 'Storymodus' },
    ];

    if (loading) return (
        <div className="flex justify-center p-12">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
        </div>
    );

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-black mb-6">Benutzerverwaltung</h2>
            <div className="space-y-3">
                {users.map((user) => (
                    <div key={user.id} className="border rounded-2xl bg-white overflow-hidden shadow-sm transition-all hover:shadow-md">
                        <div
                            className="flex items-center justify-between p-5 cursor-pointer"
                            onClick={() => setExpandedUserId(expandedUserId === user.id ? null : user.id)}
                        >
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "h-10 w-10 rounded-full flex items-center justify-center text-white",
                                    user.role === 'admin' ? "bg-[#1A1A1A]" : "bg-primary/20 text-primary"
                                )}>
                                    {user.role === 'admin' ? <ShieldCheck className="h-5 w-5" /> : <User className="h-5 w-5" />}
                                </div>
                                <div>
                                    <div className="font-black text-sm">{user.name || 'Unbekannt'}</div>
                                    <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{user.email}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className={cn(
                                    "px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest",
                                    user.role === 'admin' ? "bg-[#1A1A1A] text-white" : "bg-slate-100 text-slate-500"
                                )}>
                                    {user.role}
                                </span>
                                {expandedUserId === user.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </div>
                        </div>

                        {expandedUserId === user.id && (
                            <div className="p-6 pt-0 border-t bg-slate-50/30">
                                <div className="mt-6 space-y-6">
                                    <div>
                                        <div className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4">Berechtigungen (Rechte-Matrix)</div>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {modules.map(mod => (
                                                <button
                                                    key={mod.key}
                                                    onClick={() => togglePermission(user.id, mod.key, user.permissions?.[mod.key] || false)}
                                                    className={cn(
                                                        "flex items-center justify-between p-3 rounded-xl border text-left transition-all",
                                                        user.permissions?.[mod.key]
                                                            ? "bg-primary/5 border-primary text-primary font-bold shadow-sm"
                                                            : "bg-white border-slate-200 text-slate-400 hover:border-slate-300"
                                                    )}
                                                >
                                                    <span className="text-xs">{mod.label}</span>
                                                    {user.permissions?.[mod.key] && <div className="h-2 w-2 rounded-full bg-primary" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-dashed">
                                        <button className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-400 hover:text-red-500 transition-colors">
                                            <Trash2 className="h-3.5 w-3.5" /> Benutzer löschen
                                        </button>
                                        <button className="flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] text-white rounded-xl text-xs font-bold">
                                            <Lock className="h-3.5 w-3.5" /> Passwort zurücksetzen
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
