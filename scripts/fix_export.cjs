const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const dbPath = '/Users/samyzouari/Library/Application Support/lingolume/lingolume.db';
const outputDir = '/Users/samyzouari/Desktop/gravi/src/content/A1.1';

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

for (let i = 1; i <= 12; i++) {
    const lessonId = `A1.1-L${String(i).padStart(2, '0')}`;
    try {
        // Use sqlite3 command to get the JSON content
        // We use -cmd and -newline to try and get the raw string
        const cmd = `sqlite3 "${dbPath}" "SELECT content_json FROM lessons WHERE id = '${lessonId}';"`;
        const content = execSync(cmd).toString().trim();

        if (content) {
            // Validate if it's already valid JSON. 
            // If it has literal newlines, JSON.parse will fail.
            // We might need to escape them.
            try {
                const parsed = JSON.parse(content);
                fs.writeFileSync(path.join(outputDir, `L${String(i).padStart(2, '0')}.json`), JSON.stringify(parsed, null, 2));
                console.log(`Successfully exported ${lessonId}`);
            } catch (pErr) {
                console.warn(`Content for ${lessonId} is not valid JSON, attempting to fix...`);
                // If it's not valid JSON because of newlines, we can try to wrap it or fix it.
                // But usually the DB should store it correctly.
                // Let's try to get it via -json mode if available.
            }
        }
    } catch (err) {
        console.error(`Failed to export ${lessonId}:`, err.message);
    }
}
