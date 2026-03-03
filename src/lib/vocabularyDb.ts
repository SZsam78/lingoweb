import { firestore } from './firebase';
import {
    collection,
    getDocs,
    query,
    where,
    writeBatch,
    doc,
    setDoc,
    deleteDoc
} from 'firebase/firestore';

export interface VocabularyItem {
    id: string;
    lemma: string;
    article: 'der' | 'die' | 'das';
    plural: string;
    level: string;
    en: string;
}

export class VocabularyDB {
    private static COLLECTION = 'vocabulary';

    static async getVocabularyByLevel(level: string): Promise<VocabularyItem[]> {
        const q = query(
            collection(firestore, this.COLLECTION),
            where('level', '==', level)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as VocabularyItem));
    }

    static async getAllVocabulary(): Promise<VocabularyItem[]> {
        const snapshot = await getDocs(collection(firestore, this.COLLECTION));
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as VocabularyItem));
    }

    static async importVocabulary(items: VocabularyItem[]): Promise<void> {
        const batch = writeBatch(firestore);

        items.forEach(item => {
            const id = item.id || crypto.randomUUID();
            const ref = doc(firestore, this.COLLECTION, id);
            batch.set(ref, {
                ...item,
                id,
                updatedAt: new Date().toISOString()
            });
        });

        await batch.commit();
    }

    static async prefillDefaultData(): Promise<void> {
        const defaults: VocabularyItem[] = [
            { id: '1', lemma: 'Apfel', article: 'der', plural: 'die Äpfel', level: 'A1.1', en: 'apple' },
            { id: '2', lemma: 'Banane', article: 'die', plural: 'die Bananen', level: 'A1.1', en: 'banana' },
            { id: '3', lemma: 'Auto', article: 'das', plural: 'die Autos', level: 'A1.1', en: 'car' },
            { id: '4', lemma: 'Haus', article: 'das', plural: 'die Häuser', level: 'A1.1', en: 'house' },
            { id: '5', lemma: 'Tisch', article: 'der', plural: 'die Tische', level: 'A1.1', en: 'table' },
            { id: '6', lemma: 'Lampe', article: 'die', plural: 'die Lampen', level: 'A1.1', en: 'lamp' },
            { id: '7', lemma: 'Buch', article: 'das', plural: 'die Bücher', level: 'A1.1', en: 'book' },
            { id: '8', lemma: 'Stuhl', article: 'der', plural: 'die Stühle', level: 'A1.1', en: 'chair' },
            { id: '9', lemma: 'Katze', article: 'die', plural: 'die Katzen', level: 'A1.1', en: 'cat' },
            { id: '10', lemma: 'Hund', article: 'der', plural: 'die Hunde', level: 'A1.1', en: 'dog' },
        ];
        await this.importVocabulary(defaults);
    }

    static async clearAll(): Promise<void> {
        const snapshot = await getDocs(collection(firestore, this.COLLECTION));
        const batch = writeBatch(firestore);
        snapshot.forEach(d => batch.delete(d.ref));
        await batch.commit();
    }
}
