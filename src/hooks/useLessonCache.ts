'use client';

import { useCallback, useEffect } from 'react';
import type { Lesson } from './useLessons';

const CACHE_NAME = 'lessons-cache-v1';

/**
 * Hook for caching lessons for offline access
 */
export function useLessonCache(lessons: Lesson[]) {
	const cacheLessons = useCallback(async () => {
		if ('caches' in window && navigator.serviceWorker) {
			try {
				const cache = await caches.open(CACHE_NAME);
				await Promise.all(
					lessons.map(async (lesson) => {
						const url = `/api/lessons/${lesson.id}`;
						const response = new Response(JSON.stringify(lesson), {
							headers: { 'Content-Type': 'application/json' },
						});
						await cache.put(url, response);
					})
				);
				console.debug('[LessonCache] Cached', lessons.length, 'lessons');
			} catch (error) {
				console.debug('[LessonCache] Error caching:', error);
			}
		}
	}, [lessons]);

	const getCachedLesson = useCallback(async (lessonId: string): Promise<Lesson | null> => {
		if (!('caches' in window)) return null;
		try {
			const cache = await caches.open(CACHE_NAME);
			const response = await cache.match(`/api/lessons/${lessonId}`);
			if (response) {
				return await response.json();
			}
		} catch {
			// Ignore errors
		}
		return null;
	}, []);

	const isOfflineReady = useCallback(async (): Promise<boolean> => {
		if (!('caches' in window)) return false;
		try {
			const cache = await caches.open(CACHE_NAME);
			const keys = await cache.keys();
			return keys.length > 0;
		} catch {
			return false;
		}
	}, []);

	// Auto-cache lessons when they load
	useEffect(() => {
		if (lessons.length > 0) {
			cacheLessons();
		}
	}, [lessons, cacheLessons]);

	return {
		cacheLessons,
		getCachedLesson,
		isOfflineReady,
	};
}
