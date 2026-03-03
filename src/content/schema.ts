import { z } from 'zod';

// --- Base Types ---

export const SectionTypeSchema = z.enum([
    'dialog',
    'multiple_choice',
    'matching',
    'fill_blank',
    'reorder_sentence',
    'short_write',
    'roleplay',
    'mini_test',
    'reading',
    'grammatik',
    'wortschatz',
    'rich_text',
]);

export type SectionType = z.infer<typeof SectionTypeSchema>;

export const DifficultySchema = z.enum(['easy', 'medium', 'hard']);

// --- Item Metadata ---

export const ItemMetaSchema = z.object({
    difficulty: DifficultySchema.optional(),
    tags: z.array(z.string()).optional(),
    points: z.number().optional(),
    isMandatory: z.boolean().default(false),
    canShowSolution: z.boolean().default(true),
    timeEstimate: z.number().optional(), // In minutes
    imageUrl: z.string().optional(),
    imageCaption: z.string().optional(),
    audioUrl: z.string().optional(),
});

// --- Item Content Schemas ---

export const RichTextItemSchema = z.object({
    id: z.string(),
    type: z.literal('rich_text'),
    content: z.string(), // Markdown/HTML content
    meta: ItemMetaSchema.optional(),
});

export const DialogLineSchema = z.object({
    id: z.string(),
    speaker: z.string(),
    text: z.string(),
});

export const DialogItemSchema = z.object({
    id: z.string(),
    type: z.literal('dialog'),
    lines: z.array(DialogLineSchema).default([]),
    // Keep these for backwards compatibility / auto-migration temporarily
    speaker: z.string().optional(),
    text: z.string().optional(),
    audioUrl: z.string().optional(),
    meta: ItemMetaSchema.optional(),
});

export const ChoiceSchema = z.object({
    id: z.string(),
    text: z.string(),
    isCorrect: z.boolean().default(false),
});

export const MCQItemSchema = z.object({
    id: z.string(),
    type: z.literal('multiple_choice'),
    question: z.string(),
    choices: z.array(ChoiceSchema),
    isMultiSelect: z.boolean().default(false),
    meta: ItemMetaSchema.optional(),
});

export const MatchingPairSchema = z.object({
    left: z.string(),
    right: z.string(),
});

export const MatchingItemSchema = z.object({
    id: z.string(),
    type: z.literal('matching'),
    pairs: z.array(MatchingPairSchema),
    meta: ItemMetaSchema.optional(),
});

export const FillBlankItemSchema = z.object({
    id: z.string(),
    type: z.literal('fill_blank'),
    text: z.string(), // "Hallo, ich [bin|ist] Lukas."
    solutions: z.record(z.string()), // { "0": "bin" }
    meta: ItemMetaSchema.optional(),
});

export const ReorderItemSchema = z.object({
    id: z.string(),
    type: z.literal('reorder_sentence'),
    sentence: z.string(),
    meta: ItemMetaSchema.optional(),
});

export const ShortWriteItemSchema = z.object({
    id: z.string(),
    type: z.literal('short_write'),
    prompt: z.string(),
    sampleSolution: z.string().optional(),
    checklist: z.array(z.string()).optional(),
    meta: ItemMetaSchema.optional(),
});

export const RoleplayItemSchema = z.object({
    id: z.string(),
    type: z.literal('roleplay'),
    prompt: z.string(),
    usefulPhrases: z.array(z.string()).optional(),
    meta: ItemMetaSchema.optional(),
});

export const MiniTestItemSchema = z.object({
    id: z.string(),
    type: z.literal('mini_test'),
    subTasks: z.array(z.any()), // Can contain mixed types
    meta: ItemMetaSchema.optional(),
});

export const AnyItemSchema = z.union([
    RichTextItemSchema,
    DialogItemSchema,
    MCQItemSchema,
    MatchingItemSchema,
    FillBlankItemSchema,
    ReorderItemSchema,
    ShortWriteItemSchema,
    RoleplayItemSchema,
    MiniTestItemSchema,
]);

export type AnyItem = z.infer<typeof AnyItemSchema>;

// --- Section Schema ---

export const SectionSchema = z.object({
    id: z.string(),
    type: SectionTypeSchema,
    title: z.string(),
    instruction: z.string().optional(),
    items: z.array(AnyItemSchema),
    meta: z.record(z.any()).optional(),
});

export type Section = z.infer<typeof SectionSchema>;

// --- Lesson Schema ---

export const LessonSchema = z.object({
    id: z.string(),
    moduleId: z.string(),
    title: z.string(),
    sections: z.array(SectionSchema).length(8), // Fixed 8 sections
    version: z.string().default('1.0.0'),
    isPublished: z.boolean().default(false),
});

export type Lesson = z.infer<typeof LessonSchema>;

// --- Module Schema ---

export const ModuleIdSchema = z.enum(['A1.1', 'A1.2', 'A2.1', 'A2.2', 'B1.1', 'B1.2', 'B2.1', 'B2.2']);
export type ModuleId = z.infer<typeof ModuleIdSchema>;

export const ModuleSchema = z.object({
    id: ModuleIdSchema,
    title: z.string(),
    lessons: z.array(z.string()), // Array of lesson IDs
});

export type Module = z.infer<typeof ModuleSchema>;

// --- Progress Schema ---

export const ItemProgressSchema = z.object({
    itemId: z.string(),
    status: z.enum(['pending', 'completed', 'failed']),
    attempts: z.number().default(0),
    lastAnswer: z.any().optional(),
    lastResult: z.any().optional(),
    updatedAt: z.string(),
});

export type ItemProgress = z.infer<typeof ItemProgressSchema>;
