import {
	type CachedTask,
	cacheTasks,
	clearOldTasks,
	getCachedTasksBySubject,
	updateTaskCompletion,
} from './task-cache';

const MAX_TASKS_PER_SUBJECT = 3;
const CACHE_REFRESH_DELAY_MS = 2000;

interface StudyTask {
	id: string;
	title: string;
	description: string;
	subject: string;
	topic: string;
	type: CachedTask['type'];
	content?: string;
	flashcards?: { front: string; back: string }[];
	completed: boolean;
}

type TaskFetcher = (subject: string) => Promise<StudyTask[]>;

let fetchUpcomingTasks: TaskFetcher = async () => [];
let _isInitialized = false;

export function configureTaskCacheManager(fetcher: TaskFetcher) {
	fetchUpcomingTasks = fetcher;
}

export async function initTaskCacheManager() {
	if (_isInitialized) return;
	await clearOldTasks();
	_isInitialized = true;
}

export async function prefetchTasksForSubjects(subjects: string[]): Promise<void> {
	for (const subject of subjects) {
		try {
			const existing = await getCachedTasksBySubject(subject);
			const incompleteCount = existing.filter((t) => !t.completed).length;

			if (incompleteCount >= MAX_TASKS_PER_SUBJECT) continue;

			const needed = MAX_TASKS_PER_SUBJECT - incompleteCount;
			const fetched = await fetchUpcomingTasks(subject);

			const newTasks: CachedTask[] = fetched
				.filter((t) => !existing.some((e) => e.id === t.id))
				.slice(0, needed)
				.map((t) => ({
					...t,
					cachedAt: Date.now(),
				}));

			if (newTasks.length > 0) {
				await cacheTasks(newTasks);
			}
		} catch {
			// Fetch failed for subject, skip silently
		}
	}
}

export async function completeTaskAndRefresh(taskId: string, subject: string): Promise<void> {
	await updateTaskCompletion(taskId, true);

	setTimeout(async () => {
		try {
			const existing = await getCachedTasksBySubject(subject);
			const incompleteCount = existing.filter((t) => !t.completed).length;

			if (incompleteCount < MAX_TASKS_PER_SUBJECT) {
				const fetched = await fetchUpcomingTasks(subject);
				const needed = MAX_TASKS_PER_SUBJECT - incompleteCount;
				const newTasks: CachedTask[] = fetched
					.filter((t) => !existing.some((e) => e.id === t.id))
					.slice(0, needed)
					.map((t) => ({
						...t,
						cachedAt: Date.now(),
					}));

				if (newTasks.length > 0) {
					await cacheTasks(newTasks);
				}
			}
		} catch {
			// Background refresh failed, task still marked complete
		}
	}, CACHE_REFRESH_DELAY_MS);
}

export async function getCachedTaskCount(): Promise<number> {
	const { getCachedTaskCount: getDBCount } = await import('./task-cache');
	return getDBCount();
}

export async function getCachedTaskCountBySubject(subject: string): Promise<number> {
	const tasks = await getCachedTasksBySubject(subject);
	return tasks.filter((t) => !t.completed).length;
}

export async function getTotalCachedTaskCount(): Promise<number> {
	const { getCachedTasks } = await import('./task-cache');
	const tasks = await getCachedTasks();
	return tasks.filter((t) => !t.completed).length;
}

export async function isTaskCached(taskId: string): Promise<boolean> {
	const { isTaskCached: checkCached } = await import('./task-cache');
	return checkCached(taskId);
}
