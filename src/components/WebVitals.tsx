'use client';

import { useReportWebVitals } from 'next/web-vitals';

export function WebVitals() {
	useReportWebVitals((metric) => {
		if (process.env.NODE_ENV === 'development') {
			console.log(`[Web Vitals] ${metric.name}:`, metric.value.toFixed(2), metric);
		}

		if (process.env.NODE_ENV === 'production') {
			fetch('/api/analytics/web-vitals', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: metric.name,
					value: metric.value,
					id: metric.id,
					page: window.location.pathname,
					timestamp: Date.now(),
				}),
			}).catch(() => {});
		}
	});

	return null;
}

export default WebVitals;
