import { type DBSchema, type IDBPDatabase, openDB } from 'idb';

export interface CachedTask {
	id: string;
	title: string;
	description: string;
	subject: string;
	topic: string;
	type: 'lesson' | 'quiz' | 'flashcards' | 'past-paper';
	content?: string;
	flashcards?: { front: string; back: string }[];
	completed: boolean;
	cachedAt: number;
}

interface TaskCacheDB extends DBSchema {
	tasks: {
		key: string;
		value: CachedTask;
		indexes: { 'by-subject': string; 'by-completed': number };
	};
	syncQueue: {
		key: string;
		value: { action: string; data: unknown; timestamp: number };
	};
}

let dbPromise: Promise<IDBPDatabase<TaskCacheDB>> | null = null;

async function getTaskDB() {
	if (!dbPromise) {
		dbPromise = openDB<TaskCacheDB>('matricmaster-tasks', 1, {
			upgrade(db) {
				const taskStore = db.createObjectStore('tasks', { keyPath: 'id' });
				taskStore.createIndex('by-subject', 'subject');
				taskStore.createIndex('by-completed', 'completed');
				db.createObjectStore('syncQueue', { keyPath: 'action' });
			},
		});
	}
	return dbPromise;
}

export async function cacheTasks(tasks: CachedTask[]): Promise<void> {
	const db = await getTaskDB();
	const tx = db.transaction('tasks', 'readwrite');
	await Promise.all(tasks.map((task) => tx.store.put({ ...task, cachedAt: Date.now() })));
	await tx.done;
}

export async function getCachedTasks(): Promise<CachedTask[]> {
	const db = await getTaskDB();
	return db.getAll('tasks');
}

export async function getCachedTasksBySubject(subject: string): Promise<CachedTask[]> {
	const db = await getTaskDB();
	return db.getAllFromIndex('tasks', 'by-subject', subject);
}

export async function updateTaskCompletion(taskId: string, completed: boolean): Promise<void> {
	const db = await getTaskDB();
	const task = await db.get('tasks', taskId);
	if (task) {
		task.completed = completed;
		await db.put('tasks', task);
	}
}

export async function clearOldTasks(): Promise<void> {
	const db = await getTaskDB();
	const tasks = await db.getAll('tasks');
	const now = Date.now();
	const DAY_MS = 24 * 60 * 60 * 1000;

	const tx = db.transaction('tasks', 'readwrite');
	for (const task of tasks) {
		if (now - task.cachedAt > 7 * DAY_MS) {
			await tx.store.delete(task.id);
		}
	}
	await tx.done;
}

export async function getCachedTaskCount(): Promise<number> {
	const db = await getTaskDB();
	return db.count('tasks');
}

export async function addToSyncQueue(action: string, data: unknown): Promise<void> {
	const db = await getTaskDB();
	await db.put('syncQueue', { action, data, timestamp: Date.now() });
}

export async function getSyncQueue(): Promise<
	{ action: string; data: unknown; timestamp: number }[]
> {
	const db = await getTaskDB();
	return db.getAll('syncQueue');
}

export async function clearSyncQueue(): Promise<void> {
	const db = await getTaskDB();
	await db.clear('syncQueue');
}

export async function isTaskCached(taskId: string): Promise<boolean> {
	const db = await getTaskDB();
	const task = await db.get('tasks', taskId);
	return !!task;
}
