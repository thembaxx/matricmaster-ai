'use client';

import { useEffect, useRef } from 'react';
import {
	getAllExamTimers,
	getUserPreferences,
	updateStudyStreak,
} from '@/lib/offline/offline-settings';
import {
	checkExamCountdowns,
	checkNotificationPermission,
	initPushNotifications,
	showOfflineReadyNotification,
	showStudyReminderNotification,
	showStudyStreakNotification,
} from '@/lib/offline/push-notifications';

export function useNotificationTriggers() {
	const initializedRef = useRef(false);

	useEffect(() => {
		if (typeof window === 'undefined' || initializedRef.current) return;

		initializedRef.current = true;

		initializeNotifications();

		return () => {
			initializedRef.current = false;
		};
	}, []);

	return null;
}

async function initializeNotifications() {
	const permission = await checkNotificationPermission();

	if (permission) {
		await initPushNotifications();

		await checkExamCountdowns();

		await checkStudyStreak();

		await checkOfflineTimer();
	}
}

async function checkStudyStreak() {
	try {
		const prefs = await getUserPreferences();

		if (prefs.lastStudyDate) {
			const newStreak = await updateStudyStreak();

			if (newStreak === 7) {
				await showStudyStreakNotification(7);
			} else if (newStreak === 30) {
				await showStudyStreakNotification(30);
			} else if (newStreak > prefs.studyStreak && newStreak % 5 === 0) {
				await showStudyStreakNotification(newStreak);
			}
		}
	} catch (error) {
		console.debug('Study streak check failed:', error);
	}
}

async function checkOfflineTimer() {
	try {
		const timers = await getAllExamTimers();

		for (const timer of timers) {
			if (timer.isPaused) continue;

			const remainingMs = timer.remaining;
			const inOneHour = 60 * 60 * 1000;

			if (remainingMs <= inOneHour && remainingMs > 0) {
				console.debug('Timer running low:', timer.id, remainingMs);
			}
		}
	} catch (error) {
		console.debug('Timer check failed:', error);
	}
}

export function triggerStudyReminder(subject: string, topic?: string) {
	showStudyReminderNotification(subject, topic);
}

export function triggerOfflineReady() {
	showOfflineReadyNotification();
}

export function useAutoNotifications() {
	return useNotificationTriggers();
}
