export class DB {
    static async query<T>(sql: string, params: any[] = []): Promise<T[]> {
        if (window.electronAPI && window.electronAPI.dbQuery) {
            const result = await window.electronAPI.dbQuery(sql, params);
            console.log('[DB.query]', sql, params, '->', result);
            return result;
        }
        console.warn('[DB.query] No electronAPI! Falling back to mock. SQL:', sql);
        // Fallback for browser (Local Storage)
        if (sql.includes('SELECT * FROM lessons')) {
            const id = params[0];
            const data = localStorage.getItem(`mock_db_lesson_${id}`);
            return data ? [JSON.parse(data)] : [];
        }
        if (sql.includes('SELECT * FROM progress')) {
            const id = params[0];
            const data = localStorage.getItem(`mock_db_progress_${id}`);
            return data ? [JSON.parse(data)] : [];
        }
        return [];
    }

    static async execute(sql: string, params: any[] = []): Promise<any> {
        if (window.electronAPI && window.electronAPI.dbExecute) {
            return window.electronAPI.dbExecute(sql, params);
        }
        console.warn('Electron API not found. Used Mock Execute:', sql, params);
        // Fallback for browser (Local Storage)
        if (sql.includes('UPDATE lessons') || sql.includes('INSERT INTO lessons')) {
            // For UPDATE: [lesson.title, JSON.stringify(lesson), lesson.isPublished ? 1 : 0, updatedAt, lesson.id]
            // For INSERT: [lesson.id, lesson.moduleId, lesson.title, JSON.stringify(lesson), 0, updatedAt]
            const isInsert = sql.includes('INSERT');
            const id = isInsert ? params[0] : params[4];
            const contentIndex = isInsert ? 3 : 1;

            try {
                const lessonData = JSON.parse(params[contentIndex]);
                // Store the row format that getLesson expects `{ content_json: string }`
                localStorage.setItem(`mock_db_lesson_${id}`, JSON.stringify({
                    id: lessonData.id,
                    content_json: params[contentIndex]
                }));
            } catch (e) {
                console.error("Mock DB parse error", e);
            }
        }
        if (sql.includes('UPDATE progress') || sql.includes('INSERT INTO progress')) {
            const isInsert = sql.includes('INSERT');
            const itemId = isInsert ? params[1] : params[5];
            localStorage.setItem(`mock_db_progress_${itemId}`, JSON.stringify({ itemId, status: params[2] }));
        }
        return { changes: 1 };
    }

    static async getProgress(itemId: string): Promise<any> {
        const results = await this.query('SELECT * FROM progress WHERE itemId = ?', [itemId]);
        return results[0] || null;
    }

    static async updateProgress(itemId: string, status: string, lastAnswer: any, lastResult: any) {
        const updatedAt = new Date().toISOString();
        const existing = await this.getProgress(itemId);

        if (existing) {
            return this.execute(
                'UPDATE progress SET status = ?, attempts = attempts + 1, lastAnswer = ?, lastResult = ?, updatedAt = ? WHERE itemId = ?',
                [status, JSON.stringify(lastAnswer), JSON.stringify(lastResult), updatedAt, itemId]
            );
        } else {
            return this.execute(
                'INSERT INTO progress (id, itemId, status, attempts, lastAnswer, lastResult, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [crypto.randomUUID(), itemId, status, 1, JSON.stringify(lastAnswer), JSON.stringify(lastResult), updatedAt]
            );
        }
    }

    // --- Authoring & Media ---

    static async getLesson(lessonId: string): Promise<any> {
        const results = await this.query('SELECT * FROM lessons WHERE id = ?', [lessonId]);
        return results[0] || null;
    }

    static async saveLesson(lesson: any) {
        const existing = await this.getLesson(lesson.id);
        const updatedAt = new Date().toISOString();
        if (existing) {
            return this.execute(
                'UPDATE lessons SET title = ?, content_json = ?, isPublished = ?, updatedAt = ? WHERE id = ?',
                [lesson.title, JSON.stringify(lesson), lesson.isPublished ? 1 : 0, updatedAt, lesson.id]
            );
        } else {
            return this.execute(
                'INSERT INTO lessons (id, moduleId, title, content_json, isPublished, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
                [lesson.id, lesson.moduleId, lesson.title, JSON.stringify(lesson), 0, updatedAt]
            );
        }
    }

    static async uploadMedia(file: File): Promise<any> {
        const id = crypto.randomUUID();
        const updatedAt = new Date().toISOString();
        const extension = file.name.split('.').pop();
        const fileName = `${id}.${extension}`;

        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        const result = await window.electronAPI.saveMedia(fileName, uint8Array);

        await this.execute(
            'INSERT INTO media (id, originalName, fileName, mimeType, path, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
            [id, file.name, fileName, file.type, result.path, updatedAt]
        );
        return { id, fileName, path: result.path };
    }
}
