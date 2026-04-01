import { type IDBPDatabase, openDB } from 'idb';

const DB_NAME = 'lumni-study-plan';
const DB_VERSION = 1;

interface CachedStudyPlan {
	id: string;
	blocks: Array<{
		id: string;
		subject: string;
		topic: string;
		startTime: string;
		endTime: string;
		priority: 'high' | 'medium' | 'low';
	}>;
	cachedAt: number;
	expiresAt: number;
}

let db: IDBPDatabase | null = null;

async function getDb(): Promise<IDBPDatabase> {
	if (db) return db;
	db = await openDB(DB_NAME, DB_VERSION, {
		upgrade(database) {
			if (!database.objectStoreNames.contains('study-plan')) {
				database.createObjectStore('study-plan', { keyPath: 'id' });
			}
		},
	});
	return db;
}

export async function cacheStudyPlan(plan: CachedStudyPlan): Promise<void> {
	const store = await getDb();
	await store.put('study-plan', plan);
}

export async function getCachedStudyPlan(planId: string): Promise<CachedStudyPlan | null> {
	const store = await getDb();
	const cached = await store.get('study-plan', planId);

	if (!cached) return null;
	if (Date.now() > cached.expiresAt) {
		await store.delete('study-plan', planId);
		return null;
	}

	return cached;
}

export async function getAllCachedPlans(): Promise<CachedStudyPlan[]> {
	const store = await getDb();
	return store.getAll('study-plan');
}
