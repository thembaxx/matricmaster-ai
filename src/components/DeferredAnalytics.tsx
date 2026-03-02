'use client';

import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { useEffect, useState } from 'react';

export function DeferredAnalytics() {
	const [shouldRender, setShouldRender] = useState(false);

	useEffect(() => {
		// Use requestIdleCallback if available, fallback to 2s timeout
		if (typeof window !== 'undefined') {
			const idleCallback = window.requestIdleCallback || ((cb) => setTimeout(cb, 2000));
			const handle = idleCallback(() => setShouldRender(true));

			return () => {
				if (window.cancelIdleCallback) {
					window.cancelIdleCallback(handle as number);
				} else {
					clearTimeout(handle as unknown as ReturnType<typeof setTimeout>);
				}
			};
		}
	}, []);

	if (!shouldRender) return null;

	return (
		<>
			<Analytics />
			<SpeedInsights />
		</>
	);
}
