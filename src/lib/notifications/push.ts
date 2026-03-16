import { appConfig } from '@/app.config';
import { getEnv } from '@/lib/env';

export interface PushNotification {
	title: string;
	body: string;
	icon?: string;
	badge?: string;
	tag?: string;
	data?: Record<string, unknown>;
	actions?: { action: string; title: string }[];
}

let subscriptionCache: PushSubscription | null = null;

export function getVapidPublicKey(): string | undefined {
	return getEnv('NEXT_PUBLIC_VAPID_KEY');
}

export async function subscribeToPush(): Promise<PushSubscription | null> {
	if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
		console.warn('Push notifications not supported');
		return null;
	}

	try {
		const existing = await navigator.serviceWorker.ready;
		let subscription = await existing.pushManager.getSubscription();

		if (!subscription) {
			const vapidKey = getVapidPublicKey();
			if (!vapidKey) {
				console.warn('VAPID key not configured');
				return null;
			}

			subscription = await existing.pushManager.subscribe({
				userVisibleOnly: true,
				// @ts-expect-error - Different Uint8Array types in older TS versions
				applicationServerKey: urlBase64ToUint8Array(vapidKey),
			});
		}

		subscriptionCache = subscription;

		await saveSubscriptionToServer(subscription);

		return subscription;
	} catch (error) {
		console.error('Failed to subscribe to push:', error);
		return null;
	}
}

export async function unsubscribeFromPush(): Promise<boolean> {
	try {
		if (subscriptionCache) {
			await subscriptionCache.unsubscribe();
			subscriptionCache = null;
		}
		return true;
	} catch (error) {
		console.error('Failed to unsubscribe from push:', error);
		return false;
	}
}

export function isPushSupported(): boolean {
	return 'serviceWorker' in navigator && 'PushManager' in window;
}

export async function showLocalNotification(notification: PushNotification): Promise<void> {
	if (!('serviceWorker' in navigator)) return;

	const registration = await navigator.serviceWorker.ready;

	const options = {
		body: notification.body,
		icon: notification.icon || '/icons/icon-192x192.png',
		badge: notification.badge || '/icons/badge-72x72.png',
		tag: notification.tag,
		data: notification.data,
		vibrate: [200, 100, 200],
		renotify: true,
	} as NotificationOptions;

	// Add actions if provided (works in some browsers)
	if (notification.actions) {
		// @ts-expect-error - actions is not in the standard type but works in browsers
		options.actions = notification.actions;
	}

	await registration.showNotification(notification.title, options);
}

async function saveSubscriptionToServer(subscription: PushSubscription): Promise<void> {
	try {
		await fetch('/api/notifications/subscribe', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(subscription),
		});
	} catch (error) {
		console.error('Failed to save subscription:', error);
	}
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
	if (!('Notification' in window)) {
		return 'denied';
	}

	if (Notification.permission === 'granted') {
		return 'granted';
	}

	if (Notification.permission !== 'denied') {
		const permission = await Notification.requestPermission();
		return permission;
	}

	return Notification.permission;
}

export function urlBase64ToUint8Array(base64String: string): Uint8Array {
	const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
	const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

	const rawData = window.atob(base64);
	const outputArray = new Uint8Array(rawData.length);

	for (let i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i);
	}
	return outputArray;
}

export async function sendTestNotification(): Promise<void> {
	const permission = await requestNotificationPermission();
	if (permission !== 'granted') {
		throw new Error('Notification permission not granted');
	}

	await showLocalNotification({
		title: appConfig.name,
		body: 'Push notifications are working!',
		tag: 'test-notification',
	});
}
