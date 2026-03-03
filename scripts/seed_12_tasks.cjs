// Seed the 12 A1.1 tasks into the SQLite database
// Each task maps to a section in Lesson A1.1-L01

const Database = require('better-sqlite3');
const path = require('path');
const os = require('os');

// Use the lingolume userData path
const dbPath = path.join(os.homedir(), 'Library', 'Application Support', 'lingolume', 'lingolume.db');
console.log('Connecting to DB at:', dbPath);

const db = new Database(dbPath);

// The 12 tasks as 8-section lessons (we'll spread across L01)
// Matching exactly the data format produced by the editor
const lessonId = 'A1.1-L01';
const moduleId = 'A1.1';

const lesson = {
    id: lessonId,
    moduleId: moduleId,
    title: 'Lektion 1: Hallo – Ich stelle mich vor',
    version: '1.0.0',
    isPublished: true,
    sections: [
        // SECTION 1 – Rich Text (Aufgabe 1)
        {
            id: 'sec1',
            type: 'rich_text',
            title: 'Willkommen im Deutschkurs A1.1',
            instruction: 'Lies den Text. Markiere wichtige Wörter und sprich die Sätze laut nach.',
            items: [
                {
                    id: 'item1-1',
                    type: 'rich_text',
                    content: `Hallo und willkommen im Deutschkurs A1.1!\n\nIn diesem Kurs lernst du:\n• Menschen begrüßen\n• Dich vorstellen\n• Fragen stellen\n• Einfache Sätze bilden\n\nWichtige Wörter:\nHallo | Guten Morgen | Tschüss | Ich heiße … | Ich komme aus … | Ich spreche …\n\nTipp: Sprich langsam und deutlich.`,
                    meta: { isMandatory: false, canShowSolution: true }
                }
            ]
        },

        // SECTION 2 – Dialog (Aufgabe 2)
        {
            id: 'sec2',
            type: 'dialog',
            title: 'Begrüßung im Kurs',
            instruction: 'Lies den Dialog und übe ihn laut. Sprich beide Rollen oder arbeite mit einer Partnerin / einem Partner.',
            items: [
                {
                    id: 'item2-1',
                    type: 'dialog',
                    lines: [
                        { id: 'd1', speaker: 'Person A', text: 'Hallo! Ich heiße Anna. Wie heißt du?' },
                        { id: 'd2', speaker: 'Person B', text: 'Hallo Anna! Ich heiße Omar.' },
                        { id: 'd3', speaker: 'Person A', text: 'Freut mich.' },
                        { id: 'd4', speaker: 'Person B', text: 'Freut mich auch.' },
                        { id: 'd5', speaker: 'Person A', text: 'Tschüss, bis morgen!' },
                        { id: 'd6', speaker: 'Person B', text: 'Tschüss!' },
                    ],
                    meta: { isMandatory: false, canShowSolution: true }
                }
            ]
        },

        // SECTION 3 – Multiple Choice (Aufgabe 3)
        {
            id: 'sec3',
            type: 'multiple_choice',
            title: 'Begrüßungen und Verabschiedungen erkennen',
            instruction: 'Wähle pro Frage die richtige Antwort.',
            items: [
                {
                    id: 'item3-1',
                    type: 'multiple_choice',
                    question: 'Was ist eine Begrüßung?',
                    choices: [
                        { id: 'c1', text: 'Tschüss', isCorrect: false },
                        { id: 'c2', text: 'Hallo', isCorrect: true },
                        { id: 'c3', text: 'Bis morgen', isCorrect: false },
                    ],
                    meta: { isMandatory: true, canShowSolution: true }
                },
                {
                    id: 'item3-2',
                    type: 'multiple_choice',
                    question: 'Was ist eine Verabschiedung?',
                    choices: [
                        { id: 'c1', text: 'Guten Morgen', isCorrect: false },
                        { id: 'c2', text: 'Wie heißt du?', isCorrect: false },
                        { id: 'c3', text: 'Tschüss', isCorrect: true },
                    ],
                    meta: { isMandatory: true, canShowSolution: true }
                },
                {
                    id: 'item3-3',
                    type: 'multiple_choice',
                    question: 'Was passt? „___! Ich heiße Lara."',
                    choices: [
                        { id: 'c1', text: 'Hallo', isCorrect: true },
                        { id: 'c2', text: 'Danke', isCorrect: false },
                        { id: 'c3', text: 'Bitte', isCorrect: false },
                    ],
                    meta: { isMandatory: true, canShowSolution: true }
                },
                {
                    id: 'item3-4',
                    type: 'multiple_choice',
                    question: 'Was sagt man am Morgen?',
                    choices: [
                        { id: 'c1', text: 'Gute Nacht', isCorrect: false },
                        { id: 'c2', text: 'Guten Morgen', isCorrect: true },
                        { id: 'c3', text: 'Bis bald', isCorrect: false },
                    ],
                    meta: { isMandatory: true, canShowSolution: true }
                }
            ]
        },

        // SECTION 4 – Matching (Aufgabe 4)
        {
            id: 'sec4',
            type: 'matching',
            title: 'Länder und Sprachen zuordnen',
            instruction: 'Ordne die Länder den passenden Sprachen zu. Achte auf die Wörter: Land und Sprache.',
            items: [
                {
                    id: 'item4-1',
                    type: 'matching',
                    pairs: [
                        { left: 'Deutschland', right: 'Deutsch' },
                        { left: 'Österreich', right: 'Deutsch' },
                        { left: 'Spanien', right: 'Spanisch' },
                        { left: 'Italien', right: 'Italienisch' },
                        { left: 'Türkei', right: 'Türkisch' },
                        { left: 'Frankreich', right: 'Französisch' },
                    ],
                    meta: { isMandatory: true, canShowSolution: true }
                }
            ]
        },

        // SECTION 5 – Fill Blank (Aufgabe 5)
        {
            id: 'sec5',
            type: 'fill_blank',
            title: 'Sich vorstellen: heißen, kommen, sein, spreche',
            instruction: 'Setze die richtigen Wörter in die Lücken ein. Verwende: heiße, komme, bin, spreche',
            items: [
                {
                    id: 'item5-1',
                    type: 'fill_blank',
                    text: 'Hallo! Ich [heiße|heiß] Maria.\nIch [komme|kommen] aus Portugal.\nIch [bin|bist] 24 Jahre alt.\nIch [spreche|sprich] Portugiesisch und ein bisschen Deutsch.',
                    meta: { isMandatory: true, canShowSolution: true }
                }
            ]
        },

        // SECTION 6 – Reorder / Schüttelsatz (Aufgabe 6)
        {
            id: 'sec6',
            type: 'reorder_sentence',
            title: 'Sätze ordnen: einfache Satzstellung',
            instruction: 'Bringe die Wörter in die richtige Reihenfolge. In einfachen Aussagesätzen steht das Verb oft auf Position 2.',
            items: [
                {
                    id: 'item6-1',
                    type: 'reorder_sentence',
                    sentence: 'Ich heiße Samir.',
                    meta: { isMandatory: true, canShowSolution: true }
                },
                {
                    id: 'item6-2',
                    type: 'reorder_sentence',
                    sentence: 'Ich komme aus Marokko.',
                    meta: { isMandatory: true, canShowSolution: true }
                },
                {
                    id: 'item6-3',
                    type: 'reorder_sentence',
                    sentence: 'Ich spreche Deutsch und Arabisch.',
                    meta: { isMandatory: true, canShowSolution: true }
                },
                {
                    id: 'item6-4',
                    type: 'reorder_sentence',
                    sentence: 'Wie heißt du?',
                    meta: { isMandatory: true, canShowSolution: true }
                }
            ]
        },

        // SECTION 7 – Short Write (Aufgabe 7)
        {
            id: 'sec7',
            type: 'short_write',
            title: 'Stell dich vor (4–5 Sätze)',
            instruction: 'Schreibe 4–5 einfache Sätze über dich.',
            items: [
                {
                    id: 'item7-1',
                    type: 'short_write',
                    prompt: 'Schreibe einen kurzen Vorstellungstext über dich.\nNutze diese Satzanfänge:\n• Ich heiße …\n• Ich komme aus …\n• Ich wohne in …\n• Ich spreche …\n• Ich bin … Jahre alt.',
                    sampleSolution: 'Ich heiße Elena.\nIch komme aus Spanien.\nIch wohne in Berlin.\nIch spreche Spanisch und ein bisschen Deutsch.\nIch bin 29 Jahre alt.',
                    meta: { isMandatory: true, canShowSolution: true }
                }
            ]
        },

        // SECTION 8 – Mini-Test (Aufgabe 8–12 komprimiert)
        {
            id: 'sec8',
            type: 'mini_test',
            title: 'Mini-Test 1: Hallo, ich bin …',
            instruction: 'Bearbeite alle Aufgaben und überprüfe danach die Lösungen. Der Mini-Test wiederholt Begrüßung, Vorstellung und einfache Fragen.',
            items: [
                // Aufgabe 8: Rollenspiel (as rich_text with instructions)
                {
                    id: 'item8-1',
                    type: 'roleplay',
                    prompt: 'Spielt zu zweit einen kurzen Dialog. Eine Person ist neu im Kurs.\n\nRolle A (Kursteilnehmer/in): Begrüße, frage nach dem Namen, Herkunft, Sprachen und verabschiede dich.\n\nRolle B (neue Person): Stell dich vor, nenne Herkunft und Sprachen, stelle eine Rückfrage und verabschiede dich.',
                    usefulPhrases: ['Hallo! Wie heißt du?', 'Ich heiße …', 'Woher kommst du?', 'Ich komme aus …', 'Welche Sprachen sprichst du?', 'Ich spreche …', 'Und du?', 'Tschüss!'],
                    sampleSolution: 'A: Hallo! Wie heißt du?\nB: Hallo! Ich heiße Amir.\nA: Woher kommst du?\nB: Ich komme aus Syrien. Und du?\nA: Ich komme aus Deutschland. Welche Sprachen sprichst du?\nB: Ich spreche Arabisch und ein bisschen Deutsch.\nA: Super. Tschüss, bis morgen!\nB: Tschüss!',
                    meta: { isMandatory: false, canShowSolution: true }
                },
                // Aufgabe 9: Mini-Test Multiple Choice
                {
                    id: 'item9-1',
                    type: 'multiple_choice',
                    question: 'Was passt? „Ich ___ Ali."',
                    choices: [
                        { id: 'c1', text: 'heiße', isCorrect: true },
                        { id: 'c2', text: 'heißt', isCorrect: false },
                        { id: 'c3', text: 'bist', isCorrect: false },
                    ],
                    meta: { isMandatory: true, canShowSolution: true }
                },
                {
                    id: 'item9-2',
                    type: 'multiple_choice',
                    question: 'Was ist richtig?',
                    choices: [
                        { id: 'c1', text: 'Ich komme aus Türkei.', isCorrect: false },
                        { id: 'c2', text: 'Ich komme aus der Türkei.', isCorrect: true },
                        { id: 'c3', text: 'Ich kommen aus der Türkei.', isCorrect: false },
                    ],
                    meta: { isMandatory: true, canShowSolution: true }
                },
                // Aufgabe 10: Zuordnung Fragen & Antworten
                {
                    id: 'item10-1',
                    type: 'matching',
                    pairs: [
                        { left: 'Wie heißt du?', right: 'Ich heiße Sofia.' },
                        { left: 'Woher kommst du?', right: 'Ich komme aus Italien.' },
                        { left: 'Welche Sprachen sprichst du?', right: 'Ich spreche Deutsch und Englisch.' },
                        { left: 'Wie geht\'s?', right: 'Gut, danke. Und dir?' },
                    ],
                    meta: { isMandatory: true, canShowSolution: true }
                },
                // Aufgabe 11: Lückentext – sein im Präsens
                {
                    id: 'item11-1',
                    type: 'fill_blank',
                    text: 'Ich [bin|bist] neu im Kurs.\nDu [bist|bin] aus Brasilien.\nEr [ist|sind] 22 Jahre alt.\nWir [sind|ist] im Deutschkurs.\nSie (Plural) [sind|ist] freundlich.',
                    meta: { isMandatory: true, canShowSolution: true }
                },
                // Aufgabe 12: Schüttelsatz + Freitext
                {
                    id: 'item12-1',
                    type: 'reorder_sentence',
                    sentence: 'Woher kommst du?',
                    meta: { isMandatory: true, canShowSolution: true }
                },
                {
                    id: 'item12-2',
                    type: 'reorder_sentence',
                    sentence: 'Welche Sprachen sprichst du?',
                    meta: { isMandatory: true, canShowSolution: true }
                },
                {
                    id: 'item12-3',
                    type: 'reorder_sentence',
                    sentence: 'Ich heiße Lina.',
                    meta: { isMandatory: true, canShowSolution: true }
                },
                {
                    id: 'item12-4',
                    type: 'short_write',
                    prompt: 'Antworte auf die Frage: „Wie heißt du?"',
                    sampleSolution: 'Ich heiße [Name].',
                    meta: { isMandatory: false, canShowSolution: true }
                }
            ]
        }
    ]
};

const contentJson = JSON.stringify(lesson);
const updatedAt = new Date().toISOString();

// Check if lesson already exists
const existing = db.prepare('SELECT id FROM lessons WHERE id = ?').get(lessonId);

if (existing) {
    db.prepare('UPDATE lessons SET title = ?, content_json = ?, isPublished = ?, updatedAt = ? WHERE id = ?')
        .run(lesson.title, contentJson, 1, updatedAt, lessonId);
    console.log('✅ Updated existing lesson:', lessonId);
} else {
    db.prepare('INSERT INTO lessons (id, moduleId, title, content_json, isPublished, updatedAt) VALUES (?, ?, ?, ?, ?, ?)')
        .run(lessonId, moduleId, lesson.title, contentJson, 1, updatedAt);
    console.log('✅ Inserted new lesson:', lessonId);
}

db.close();
console.log('Done! 12 tasks seeded into A1.1-L01.');
