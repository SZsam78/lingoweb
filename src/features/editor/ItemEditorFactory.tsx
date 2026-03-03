import { AnyItem } from '@/content/schema';
import {
    RichTextEditor,
    MCQEditor,
    FillBlankEditor,
    ReorderEditor,
    ShortWriteEditor,
    MatchingEditor,
    RoleplayEditor,
    ItemMetaEditor,
    DialogEditor,
    MiniTestEditor
} from './ItemEditors';
import { Trash2, GripVertical } from 'lucide-react';

interface ItemEditorProps {
    item: AnyItem;
    onChange: (item: AnyItem) => void;
    onDelete: () => void;
}

export function ItemEditorFactory({ item, onChange, onDelete }: ItemEditorProps) {
    const renderSpecificEditor = () => {
        switch (item.type) {
            case 'rich_text':
                return <RichTextEditor item={item} onChange={onChange} />;
            case 'multiple_choice':
                return <MCQEditor item={item} onChange={onChange} />;
            case 'fill_blank':
                return <FillBlankEditor item={item} onChange={onChange} />;
            case 'reorder_sentence':
                return <ReorderEditor item={item} onChange={onChange} />;
            case 'short_write':
                return <ShortWriteEditor item={item} onChange={onChange} />;
            case 'matching':
                return <MatchingEditor item={item} onChange={onChange} />;
            case 'roleplay':
                return <RoleplayEditor item={item} onChange={onChange} />;
            case 'dialog':
                return <DialogEditor item={item} onChange={onChange} />;
            case 'mini_test':
                return <MiniTestEditor item={item} onChange={onChange} />;
            default:
                return <div className="p-4 text-xs text-muted-foreground italic">Editor für {(item as any).type} coming soon...</div>;
        }
    };

    return (
        <div className="p-6 bg-white border rounded-2xl shadow-sm space-y-6 group">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <GripVertical className="h-5 w-5 text-slate-300 cursor-grab" />
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">{item.type}</span>
                </div>
                <button
                    onClick={onDelete}
                    className="p-2 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-destructive transition-all"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>

            {renderSpecificEditor()}

            <ItemMetaEditor
                meta={item.meta || {}}
                onChange={(meta) => onChange({ ...item, meta })}
            />
        </div>
    );
}
