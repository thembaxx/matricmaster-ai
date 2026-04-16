// Offline caching service worker for lessons
const CACHE_NAME = 'lessons-cache-v1';
const LESSON_API_PATTERN = /\/api\/lessons/;
const LESSON_JSON_PATTERN = /\/content\/lessons\/.+\.json/;

self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((_cache) => {
			console.log('[OfflineLessons] Cache opened');
		})
	);
	self.skipWaiting();
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches.keys().then((cacheNames) => {
			return Promise.all(
				cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
			);
		})
	);
	self.clients.claim();
});

self.addEventListener('fetch', (event) => {
	const url = new URL(event.request.url);

	// Cache lesson JSON files and API responses
	if (LESSON_JSON_PATTERN.test(url.pathname) || LESSON_API_PATTERN.test(url.pathname)) {
		event.respondWith(
			caches.open(CACHE_NAME).then((cache) => {
				return cache.match(event.request).then((cachedResponse) => {
					if (cachedResponse) {
						return cachedResponse;
					}
					return fetch(event.request)
						.then((networkResponse) => {
							if (networkResponse.ok) {
								cache.put(event.request, networkResponse.clone());
							}
							return networkResponse;
						})
						.catch(() => {
							// Return offline error response
							return new Response(JSON.stringify({ error: 'Offline', cached: false }), {
								status: 503,
								headers: { 'Content-Type': 'application/json' },
							});
						});
				});
			})
		);
	}
});

self.addEventListener('message', (event) => {
	if (event.data?.type === 'CACHE_LESSONS') {
		const { lessons } = event.data;
		caches.open(CACHE_NAME).then((cache) => {
			lessons.forEach((lesson) => {
				const request = new Request(`/content/lessons/${lesson.id}.json`);
				cache.put(
					request,
					new Response(JSON.stringify(lesson), {
						headers: { 'Content-Type': 'application/json' },
					})
				);
			});
		});
	}
});
