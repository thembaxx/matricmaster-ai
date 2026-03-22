import { type DBSchema, type IDBPDatabase, openDB } from 'idb';

export interface QuickTip {
	id: string;
	subject: string;
	topic: string;
	grade: number;
	title: string;
	content: string;
	formula?: string;
	example?: string;
	priority: number;
}

interface QuickTipsDB extends DBSchema {
	tips: {
		key: string;
		value: QuickTip;
		indexes: { 'by-subject': string; 'by-topic': string };
	};
}

let dbPromise: Promise<IDBPDatabase<QuickTipsDB>> | null = null;

async function getDB() {
	if (!dbPromise) {
		dbPromise = openDB<QuickTipsDB>('lumni-tips', 1, {
			upgrade(db) {
				const store = db.createObjectStore('tips', { keyPath: 'id' });
				store.createIndex('by-subject', 'subject');
				store.createIndex('by-topic', 'topic');
			},
		});
	}
	return dbPromise;
}

export async function initQuickTips(tips: QuickTip[]): Promise<void> {
	const db = await getDB();
	const tx = db.transaction('tips', 'readwrite');
	await Promise.all(tips.map((tip) => tx.store.put(tip)));
	await tx.done;
}

export async function getTipsBySubject(subject: string): Promise<QuickTip[]> {
	const db = await getDB();
	return db.getAllFromIndex('tips', 'by-subject', subject);
}

export async function getTipsByTopic(topic: string): Promise<QuickTip[]> {
	const db = await getDB();
	return db.getAllFromIndex('tips', 'by-topic', topic);
}

export async function getAllTips(): Promise<QuickTip[]> {
	const db = await getDB();
	return db.getAll('tips');
}

export async function searchTips(query: string): Promise<QuickTip[]> {
	const all = await getAllTips();
	const lower = query.toLowerCase();
	return all.filter(
		(tip) =>
			tip.topic.toLowerCase().includes(lower) ||
			tip.title.toLowerCase().includes(lower) ||
			tip.content.toLowerCase().includes(lower) ||
			(tip.formula?.toLowerCase().includes(lower) ?? false)
	);
}

export async function getTipCount(): Promise<number> {
	const db = await getDB();
	return db.count('tips');
}
