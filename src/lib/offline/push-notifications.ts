'use client';

import type { ExamCountdown } from './offline-settings';
import { getExamCountdowns, markCountdownNotified } from './offline-settings';

export interface PushNotificationPayload {
	title: string;
	body: string;
	icon?: string;
	badge?: string;
	tag?: string;
	data?: Record<string, unknown>;
	actions?: PushNotificationAction[];
}

export interface PushNotificationAction {
	action: string;
	title: string;
	icon?: string;
}

export type NotificationType =
	| 'study-reminder'
	| 'exam-countdown'
	| 'study-streak'
	| 'achievement'
	| 'new-content'
	| 'quiz-reminder'
	| 'offline-ready';

let pushSubscription: PushSubscription | null = null;
let notificationPermission: NotificationPermission = 'default';

export async function checkNotificationPermission(): Promise<boolean> {
	if (typeof window === 'undefined' || !('Notification' in window)) {
		return false;
	}

	notificationPermission = Notification.permission;

	if (notificationPermission === 'granted') {
		return true;
	}

	if (notificationPermission === 'default') {
		const permission = await Notification.requestPermission();
		notificationPermission = permission;
		return permission === 'granted';
	}

	return false;
}

export async function getNotificationPermission(): Promise<NotificationPermission> {
	if (typeof window !== 'undefined' && 'Notification' in window) {
		return Notification.permission;
	}
	return 'default';
}

export async function subscribeToPush(): Promise<PushSubscription | null> {
	if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
		return null;
	}

	const hasPermission = await checkNotificationPermission();
	if (!hasPermission) {
		return null;
	}

	try {
		const registration = await navigator.serviceWorker.ready;
		pushSubscription = await registration.pushManager.subscribe({
			userVisibleOnly: true,
			applicationServerKey: urlBase64ToUint8Array(getVapidPublicKey()) as unknown as BufferSource,
		});

		await fetch('/api/push/subscribe', {
			method: 'POST',
			body: JSON.stringify(pushSubscription),
			headers: { 'Content-Type': 'application/json' },
		});

		return pushSubscription;
	} catch (error) {
		console.error('Failed to subscribe to push:', error);
		return null;
	}
}

export async function unsubscribeFromPush(): Promise<boolean> {
	if (!pushSubscription) {
		return true;
	}

	try {
		await pushSubscription.unsubscribe();

		await fetch('/api/push/unsubscribe', {
			method: 'POST',
			body: JSON.stringify(pushSubscription),
			headers: { 'Content-Type': 'application/json' },
		});

		pushSubscription = null;
		return true;
	} catch (error) {
		console.error('Failed to unsubscribe from push:', error);
		return false;
	}
}

export async function showLocalNotification(
	payload: PushNotificationPayload
): Promise<Notification | null> {
	const hasPermission = await checkNotificationPermission();
	if (!hasPermission) {
		return null;
	}

	const { title, body, icon, badge, tag, data } = payload;

	const options: NotificationOptions = {
		body,
		icon: icon ?? '/icon0.svg',
		badge: badge ?? '/icon0.svg',
		tag,
		data,
	};

	return new Notification(title, options);
}

export async function showStudyReminderNotification(
	subject: string,
	topic?: string
): Promise<Notification | null> {
	const title = 'Time to study!';
	const body = topic
		? `Ready to continue learning ${topic} in ${subject}?`
		: `Ready to study some ${subject}?`;

	return showLocalNotification({
		title,
		body,
		tag: 'study-reminder',
		data: { type: 'study-reminder', subject, topic },
		actions: [
			{ action: 'start', title: "Let's go!" },
			{ action: 'snooze', title: 'Remind later' },
		],
	});
}

export async function showExamCountdownNotification(
	countdown: ExamCountdown
): Promise<Notification | null> {
	const daysText = countdown.daysRemaining === 1 ? 'tomorrow' : `${countdown.daysRemaining} days`;

	const title = `📅 ${countdown.subject} exam in ${daysText}`;
	const body = countdown.title;

	return showLocalNotification({
		title,
		body,
		tag: `exam-${countdown.id}`,
		data: { type: 'exam-countdown', ...countdown },
		actions: [
			{ action: 'study', title: 'Start studying' },
			{ action: 'dismiss', title: 'Got it' },
		],
	});
}

export async function showStudyStreakNotification(streak: number): Promise<Notification | null> {
	const title = `🔥 ${streak} day streak!`;
	const body = "You're on fire! Keep up the great study session.";

	return showLocalNotification({
		title,
		body,
		tag: 'study-streak',
		data: { type: 'study-streak', streak },
	});
}

export async function showAchievementNotification(
	achievement: string,
	description: string
): Promise<Notification | null> {
	const title = '🏆 Achievement Unlocked!';
	const body = `${achievement}: ${description}`;

	return showLocalNotification({
		title,
		body,
		tag: 'achievement',
		data: { type: 'achievement', achievement, description },
	});
}

export async function showNewContentNotification(
	subject: string,
	contentType: string
): Promise<Notification | null> {
	const title = `📚 New ${contentType} available`;
	const body = `Fresh ${contentType} just added for ${subject}`;

	return showLocalNotification({
		title,
		body,
		tag: 'new-content',
		data: { type: 'new-content', subject, contentType },
	});
}

export async function showQuizReminderNotification(
	quizTitle: string
): Promise<Notification | null> {
	const title = '📝 Quiz waiting!';
	const body = `You have an incomplete quiz: ${quizTitle}`;

	return showLocalNotification({
		title,
		body,
		tag: 'quiz-reminder',
		data: { type: 'quiz-reminder', quizTitle },
		actions: [
			{ action: 'continue', title: 'Continue' },
			{ action: 'dismiss', title: 'Later' },
		],
	});
}

export async function showOfflineReadyNotification(): Promise<Notification | null> {
	const title = '📱 Offline mode ready!';
	const body = 'Lumi is ready for offline use. Your data is saved locally.';

	return showLocalNotification({
		title,
		body,
		tag: 'offline-ready',
		data: { type: 'offline-ready' },
	});
}

export function setupNotificationHandlers(): void {
	if (typeof window === 'undefined') return;

	navigator.serviceWorker?.ready.then((registration) => {
		registration.active?.postMessage({ type: 'CLEAR_BADGE' });
	});

	if ('Notification' in window) {
		Notification.requestPermission().then(() => {});
	}
}

export async function checkExamCountdowns(): Promise<void> {
	const countdowns = await getExamCountdowns();
	const now = Date.now();

	for (const countdown of countdowns) {
		if (countdown.notified || countdown.notifyAt > now) {
			continue;
		}

		if (countdown.daysRemaining <= 7 && !countdown.notified) {
			await showExamCountdownNotification(countdown);
			await markCountdownNotified(countdown.id);
		}
	}
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
	const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
	const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

	const rawData = atob(base64);
	const outputArray = new Uint8Array(rawData.length);

	for (let i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i);
	}

	return outputArray;
}

function getVapidPublicKey(): string {
	return (
		process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ??
		'BEl62iUYgUiv1I992qoo-X9__HgRZZD_20_hT27JEqCO4H85L2R2NqxPrBcg7IPZb8R3NnqJ9-93FEP1uCb88FNvM8FQcR_qZ5SPdevqR8F7k108'
	);
}

export async function initPushNotifications(): Promise<void> {
	if (typeof window === 'undefined') return;

	if (!navigator.onLine) return;

	const hasPermission = await checkNotificationPermission();
	if (!hasPermission) return;

	if ('serviceWorker' in navigator) {
		const registration = await navigator.serviceWorker.ready;

		registration.pushManager.getSubscription().then((subscription) => {
			if (!subscription) {
				subscribeToPush();
			}
		});
	}

	await checkExamCountdowns();
}
