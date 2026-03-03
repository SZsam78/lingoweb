import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { PlayCircle, CheckSquare, ChevronRight, Loader2, Video } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StoryChapter {
    id: string;
    title: string;
    videoUrl: string;
    tasks: { question: string, type: string }[];
}

export function StoryMode() {
    const [chapters, setChapters] = useState<StoryChapter[]>([]);
    const [currentChapter, setCurrentChapter] = useState<StoryChapter | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStory = async () => {
            try {
                const q = query(collection(firestore, 'story_mode'), orderBy('order', 'asc'));
                const snapshot = await getDocs(q);
                const storyList = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as any[];

                setChapters(storyList);
                if (storyList.length > 0) setCurrentChapter(storyList[0]);
            } catch (err) {
                console.error("Error fetching story:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStory();
    }, []);

    if (loading) return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );

    if (!currentChapter) return (
        <div className="p-20 text-center">
            <Video className="h-12 w-12 text-slate-200 mx-auto mb-4" />
            <h2 className="text-xl font-black">Keine Story-Inhalte gefunden</h2>
            <p className="text-muted-foreground">Bitte füge Kapitel im Admin-Bereich hinzu.</p>
        </div>
    );

    return (
        <div className="flex flex-col h-screen bg-slate-50">
            {/* Video Area */}
            <div className="bg-[#1A1A1A] aspect-video w-full max-h-[60vh] flex items-center justify-center relative group">
                {/* Placeholder for real player */}
                <div className="text-white text-center">
                    <PlayCircle className="h-20 w-20 mx-auto mb-4 hover:scale-110 transition-transform cursor-pointer" />
                    <div className="font-black text-2xl uppercase tracking-widest">{currentChapter.title}</div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[#1A1A1A] to-transparent">
                    <div className="flex items-center gap-4">
                        <div className="h-1.5 flex-1 bg-white/20 rounded-full overflow-hidden">
                            <div className="h-full bg-primary w-1/3" />
                        </div>
                        <span className="text-white text-xs font-bold">04:20 / 12:00</span>
                    </div>
                </div>
            </div>

            {/* Tasks Area */}
            <div className="flex-1 overflow-auto p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-2xl font-black text-[#1A1A1A]">Aufgaben zum Video</h3>
                            <p className="text-sm text-muted-foreground uppercase font-bold tracking-widest mt-1">Interaktives Training</p>
                        </div>
                        <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border font-black text-sm text-primary">
                            Kapitel 1/12
                        </div>
                    </div>

                    <div className="grid gap-4">
                        {(currentChapter.tasks || []).map((task, idx) => (
                            <button
                                key={idx}
                                className="w-full bg-white p-6 rounded-[1.5rem] border border-[#EFEBE0] shadow-sm flex items-center justify-between hover:border-primary/50 transition-all text-left group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 flex items-center justify-center rounded-full bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                        <CheckSquare className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="font-extrabold text-[#1A1A1A]">{task.question}</div>
                                        <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">{task.type}</div>
                                    </div>
                                </div>
                                <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-primary transition-colors" />
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
