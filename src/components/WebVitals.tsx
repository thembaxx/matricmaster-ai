'use client';

import { useReportWebVitals } from 'next/web-vitals';
import { useEffect } from 'react';

function sendToAnalytics(payload: {
	name: string;
	value: number;
	id: string;
	page: string;
	timestamp: number;
}) {
	const send = () => {
		fetch('/api/analytics/web-vitals', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
		}).catch(() => {});
	};
	if (typeof requestIdleCallback !== 'undefined') {
		requestIdleCallback(() => send(), { timeout: 2500 });
	} else {
		setTimeout(send, 0);
	}
}

export function WebVitals() {
	useReportWebVitals((metric) => {
		if (process.env.NODE_ENV === 'development') {
			console.log(`[Web Vitals] ${metric.name}:`, metric.value.toFixed(2), metric);
		}

		if (process.env.NODE_ENV === 'production') {
			sendToAnalytics({
				name: metric.name,
				value: metric.value,
				id: metric.id,
				page: window.location.pathname,
				timestamp: Date.now(),
			});
		}
	});

	useEffect(() => {
		if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
			navigator.serviceWorker
				.register('/sw.js')
				.then((registration) => {
					console.log('[SW] Registered:', registration.scope);
				})
				.catch((error) => {
					console.error('[SW] Registration failed:', error);
				});
		}
	}, []);

	return null;
}

export default WebVitals;
