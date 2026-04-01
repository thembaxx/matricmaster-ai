const CACHE_NAME = 'lumni-v2';
const OFFLINE_URL = '/offline';

const STATIC_ASSETS = [
	'/',
	'/dashboard',
	'/flashcards',
	'/study-plan',
	'/past-papers',
	'/quiz',
	'/subjects',
	'/offline',
	'/manifest.json',
	'/icon-192.png',
	'/icon-512.png',
];

const DYNAMIC_CACHE = 'lumni-dynamic-v1';
const AI_CONVERSATION_CACHE = 'lumni-ai-conversations-v1';
const MAX_DYNAMIC_ENTRIES = 50;

self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			return cache.addAll(STATIC_ASSETS);
		})
	);
	self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
	if (event.request.method !== 'GET') return;

	if (event.request.url.includes('/api/')) {
		event.respondWith(
			fetch(event.request).catch(() => {
				return new Response(JSON.stringify({ offline: true }), {
					headers: { 'Content-Type': 'application/json' },
				});
			})
		);
		return;
	}

	if (event.request.url.includes('/_next/static/') || event.request.url.includes('/fonts/')) {
		event.respondWith(
			caches.match(event.request).then((response) => {
				if (response) return response;
				return fetch(event.request).then((networkResponse) => {
					if (networkResponse.ok) {
						const responseClone = networkResponse.clone();
						caches.open(CACHE_NAME).then((cache) => {
							cache.put(event.request, responseClone);
						});
					}
					return networkResponse;
				});
			})
		);
		return;
	}

	if (event.request.url.includes('/api/ai-tutor/')) {
		event.respondWith(
			fetch(event.request)
				.then((response) => {
					if (response.ok && response.clone) {
						const responseClone = response.clone();
						caches.open(AI_CONVERSATION_CACHE).then((cache) => {
							cache
								.put(
									event.request,
									new Response(responseClone.body, {
										headers: responseClone.headers,
										status: responseClone.status,
									})
								)
								.catch(() => {});
						});
					}
					return response;
				})
				.catch(() => {
					return caches.match(event.request).then((cached) => {
						if (cached) return cached;
						return new Response(
							JSON.stringify({
								error: 'offline',
								message: 'You are currently offline. Your progress will sync when you reconnect.',
							}),
							{
								headers: { 'Content-Type': 'application/json' },
								status: 503,
							}
						);
					});
				})
		);
		return;
	}

	event.respondWith(
		caches
			.match(event.request)
			.then((response) => {
				if (response) {
					return response;
				}
				return fetch(event.request).then((networkResponse) => {
					if (networkResponse.ok) {
						const responseClone = networkResponse.clone();
						caches.open(DYNAMIC_CACHE).then((cache) => {
							cache.put(event.request, responseClone).catch(() => {
								caches.keys().then((keys) => {
									if (keys.length > MAX_DYNAMIC_ENTRIES) {
										caches.delete(keys[0]);
									}
								});
							});
						});
					}
					return networkResponse;
				});
			})
			.catch(() => {
				if (event.request.mode === 'navigate') {
					return caches.match(OFFLINE_URL);
				}
			})
	);
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches.keys().then((cacheNames) => {
			return Promise.all(
				cacheNames
					.filter(
						(name) =>
							name !== CACHE_NAME && name !== DYNAMIC_CACHE && name !== AI_CONVERSATION_CACHE
					)
					.map((name) => caches.delete(name))
			);
		})
	);
	self.clients.claim();
});

self.addEventListener('push', (event) => {
	const data = event.data?.json() || {};
	const title = data.title || 'Lumni AI';
	const options = {
		body: data.body || 'You have a new notification',
		icon: '/icon-192.png',
		badge: '/icon-192.png',
		data: data.url || '/',
		tag: data.tag || 'default',
		requireInteraction: data.requireInteraction || false,
		vibrate: [200, 100, 200],
	};

	event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
	event.notification.close();

	const urlToOpen = event.notification.data || '/';

	event.waitUntil(
		clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
			for (const client of clientList) {
				if (client.url.includes(self.location.origin) && 'focus' in client) {
					client.navigate(urlToOpen);
					return client.focus();
				}
			}
			return clients.openWindow(urlToOpen);
		})
	);
});

self.addEventListener('message', (event) => {
	if (event.data && event.data.type === 'SKIP_WAITING') {
		self.skipWaiting();
	}

	if (event.data && event.data.type === 'CACHE_AI_CONVERSATION') {
		const { conversationId, messages } = event.data;
		caches.open(AI_CONVERSATION_CACHE).then((cache) => {
			const cacheKey = `ai-conversation-${conversationId}`;
			cache.put(
				cacheKey,
				new Response(JSON.stringify(messages), {
					headers: { 'Content-Type': 'application/json' },
				})
			);
		});
	}

	if (event.data && event.data.type === 'GET_CACHED_AI_CONVERSATION') {
		const { conversationId } = event.data;
		caches
			.open(AI_CONVERSATION_CACHE)
			.then((cache) => cache.match(`ai-conversation-${conversationId}`))
			.then((response) => {
				if (response) {
					return response.json();
				}
				return null;
			})
			.then((data) => {
				event.ports[0]?.postMessage({ type: 'AI_CONVERSATION_RESPONSE', data });
			})
			.catch(() => {
				event.ports[0]?.postMessage({ type: 'AI_CONVERSATION_RESPONSE', data: null });
			});
	}

	if (event.data && event.data.type === 'CLEAR_AI_CACHE') {
		caches.delete(AI_CONVERSATION_CACHE);
	}
});
