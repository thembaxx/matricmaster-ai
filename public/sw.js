const CACHE_NAME = 'matricmaster-v1';
const RUNTIME_CACHE = 'matricmaster-runtime-v1';

const PRECACHE_ASSETS = ['/', '/manifest.json', '/icon-192.png', '/icon-512.png'];

const CACHE_STRATEGIES = {
	cacheFirst: [
		/\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/,
		/api\.dicebear\.com/,
		/fonts\.gstatic\.com/,
		/fonts\.googleapis\.com/,
	],
	networkFirst: [/api\//],
	staleWhileRevalidate: [/\.(?:js|css)$/],
};

self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			return cache.addAll(PRECACHE_ASSETS);
		})
	);
	self.skipWaiting();
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches.keys().then((cacheNames) => {
			return Promise.all(
				cacheNames
					.filter((cacheName) => cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE)
					.map((cacheName) => caches.delete(cacheName))
			);
		})
	);
	self.clients.claim();
});

self.addEventListener('fetch', (event) => {
	const { request } = event;
	const url = new URL(request.url);

	if (request.method !== 'GET') return;

	if (url.origin !== location.origin) {
		if (CACHE_STRATEGIES.cacheFirst.some((pattern) => pattern.test(url.href))) {
			event.respondWith(cacheFirst(request));
			return;
		}
		return;
	}

	if (CACHE_STRATEGIES.networkFirst.some((pattern) => pattern.test(url.pathname))) {
		event.respondWith(networkFirst(request));
		return;
	}

	if (CACHE_STRATEGIES.staleWhileRevalidate.some((pattern) => pattern.test(url.pathname))) {
		event.respondWith(staleWhileRevalidate(request));
		return;
	}

	event.respondWith(cacheFirst(request));
});

async function cacheFirst(request) {
	const cachedResponse = await caches.match(request);
	if (cachedResponse) {
		return cachedResponse;
	}

	try {
		const networkResponse = await fetch(request);
		if (networkResponse.ok) {
			const cache = await caches.open(RUNTIME_CACHE);
			cache.put(request, networkResponse.clone());
		}
		return networkResponse;
	} catch {
		return new Response('Offline', { status: 503 });
	}
}

async function networkFirst(request) {
	try {
		const networkResponse = await fetch(request);
		if (networkResponse.ok) {
			const cache = await caches.open(RUNTIME_CACHE);
			cache.put(request, networkResponse.clone());
		}
		return networkResponse;
	} catch {
		const cachedResponse = await caches.match(request);
		if (cachedResponse) {
			return cachedResponse;
		}
		return new Response('Offline', { status: 503 });
	}
}

async function staleWhileRevalidate(request) {
	const cachedResponse = await caches.match(request);

	const fetchPromise = fetch(request).then((networkResponse) => {
		if (networkResponse.ok) {
			const cache = caches.open(RUNTIME_CACHE);
			cache.then((c) => c.put(request, networkResponse.clone()));
		}
		return networkResponse;
	});

	return cachedResponse || fetchPromise;
}
