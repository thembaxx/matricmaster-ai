export interface CachedResource {
	url: string;
	content: string;
	timestamp: number;
	expiresAt: number;
}

const CACHE_VERSION = 'v1';
const CACHE_NAME = `lumni-${CACHE_VERSION}`;

const STATIC_ASSETS = ['/', '/dashboard', '/flashcards', '/study-plan', '/offline'];

const API_CACHE_DURATION = 5 * 60 * 1000;

export async function cacheStaticAssets(): Promise<void> {
	if (typeof window === 'undefined' || !('caches' in window)) return;

	try {
		const cache = await caches.open(CACHE_NAME);
		await cache.addAll(STATIC_ASSETS);
		console.log('Static assets cached');
	} catch (error) {
		console.debug('Failed to cache static assets:', error);
	}
}

export async function cacheApiResponse(url: string, response: Response): Promise<void> {
	if (typeof window === 'undefined' || !('caches' in window)) return;

	try {
		const cache = await caches.open(`${CACHE_NAME}-api`);
		const clonedResponse = response.clone();
		await cache.put(url, clonedResponse);
	} catch (error) {
		console.debug('Failed to cache API response:', error);
	}
}

export async function getCachedApiResponse(url: string): Promise<Response | null> {
	if (typeof window === 'undefined' || !('caches' in window)) return null;

	try {
		const cache = await caches.open(`${CACHE_NAME}-api`);
		const cachedResponse = await cache.match(url);

		if (cachedResponse) {
			const timestamp = Number(cachedResponse.headers.get('x-cache-timestamp') || 0);
			if (Date.now() - timestamp < API_CACHE_DURATION) {
				return cachedResponse;
			}
		}
		return null;
	} catch (error) {
		console.warn('Failed to get cached response:', error);
		return null;
	}
}

export function isOffline(): boolean {
	return typeof navigator !== 'undefined' ? !navigator.onLine : false;
}

export function onOffline(callback: () => void): () => void {
	if (typeof window === 'undefined') return () => {};

	const handler = () => callback();

	window.addEventListener('offline', handler);
	window.addEventListener('online', handler);

	return () => {
		window.removeEventListener('offline', handler);
		window.removeEventListener('online', handler);
	};
}

export async function clearOldCaches(): Promise<void> {
	if (typeof window === 'undefined' || !('caches' in window)) return;

	try {
		const keys = await caches.keys();
		const oldKeys = keys.filter((key) => !key.startsWith(`lumni-${CACHE_VERSION}`));

		await Promise.all(oldKeys.map((key) => caches.delete(key)));
		console.log('Old caches cleared');
	} catch (error) {
		console.debug('Failed to clear old caches:', error);
	}
}

export async function getCacheSize(): Promise<number> {
	if (typeof window === 'undefined' || !('caches' in window)) return 0;

	try {
		const keys = await caches.keys();
		let totalSize = 0;

		for (const key of keys) {
			if (key.startsWith('lumni-')) {
				const cache = await caches.open(key);
				const requests = await cache.keys();

				for (const request of requests) {
					const response = await cache.match(request);
					if (response) {
						const blob = await response.clone().blob();
						totalSize += blob.size;
					}
				}
			}
		}

		return totalSize;
	} catch (error) {
		console.warn('Failed to calculate cache size:', error);
		return 0;
	}
}

export function formatBytes(bytes: number): string {
	if (bytes === 0) return '0 Bytes';
	const k = 1024;
	const sizes = ['Bytes', 'KB', 'MB', 'GB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
}

export const OFFLINE_PAGES = [
	'/dashboard',
	'/flashcards',
	'/study-plan',
	'/review',
	'/past-papers',
];

export function shouldCachePage(pathname: string): boolean {
	return OFFLINE_PAGES.some((page) => pathname.startsWith(page));
}

import quickTipsData from '@/data/quick-tips.json';
import { getAllTips, getTipsBySubject, initQuickTips, type QuickTip } from './offline/quick-tips';
import {
	type CachedTask,
	cacheTasks,
	getCachedTaskCount,
	getCachedTasks,
} from './offline/task-cache';

export async function initializeOfflineData(): Promise<void> {
	if (typeof window === 'undefined') return;

	try {
		const tips = await getAllTips();
		if (tips.length === 0) {
			await initQuickTips(quickTipsData.tips as QuickTip[]);
		}
	} catch (error) {
		console.debug('Failed to initialize offline data:', error);
	}
}

export async function prefetchNextTasks(tasks: CachedTask[]): Promise<void> {
	try {
		await cacheTasks(tasks.slice(0, 3));
	} catch (error) {
		console.debug('Failed to prefetch tasks:', error);
	}
}

export type { CachedTask, QuickTip };
export { getAllTips, getCachedTaskCount, getCachedTasks, getTipsBySubject };
