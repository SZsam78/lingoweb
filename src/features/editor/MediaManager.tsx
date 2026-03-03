import { useState } from 'react';
import { DB } from '@/lib/db';
import { Image as ImageIcon, X, Loader2 } from 'lucide-react';

interface MediaManagerProps {
    value?: string;
    onChange: (fileName: string) => void;
}

export function MediaManager({ value, onChange }: MediaManagerProps) {
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const result = await DB.uploadMedia(file);
            onChange(result.fileName);
        } catch (error) {
            console.error('Media upload failed:', error);
            alert('Fehler beim Hochladen des Bildes.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400">Medien / Bild</label>
            {value ? (
                <div className="relative aspect-video rounded-xl overflow-hidden border bg-slate-100 group">
                    <img
                        src={`asset://${value}`}
                        alt="Preview"
                        className="w-full h-full object-cover"
                    />
                    <button
                        onClick={() => onChange('')}
                        className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            ) : (
                <label className="flex flex-col items-center justify-center aspect-video rounded-xl border-2 border-dashed border-slate-200 hover:border-primary hover:bg-slate-50 cursor-pointer transition-all">
                    {isUploading ? (
                        <Loader2 className="h-6 w-6 text-primary animate-spin" />
                    ) : (
                        <>
                            <ImageIcon className="h-6 w-6 text-slate-300 mb-2" />
                            <span className="text-xs font-bold text-slate-400">Bild hochladen</span>
                        </>
                    )}
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        disabled={isUploading}
                    />
                </label>
            )}
        </div>
    );
}
