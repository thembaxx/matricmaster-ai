'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useEffect } from 'react';
import { getEnv } from '@/lib/env';

declare global {
	interface Window {
		posthog: {
			init: (key: string, options: Record<string, unknown>) => void;
			capture: (event: string, properties?: Record<string, unknown>) => void;
			identify: (distinctId: string, properties?: Record<string, unknown>) => void;
			reset: () => void;
			onFeatureFlags: (callback: (flags: string[]) => void) => void;
		};
	}
}

let initialized = false;

function initPostHog() {
	if (initialized) return;
	initialized = true;

	const key = getEnv('NEXT_PUBLIC_POSTHOG_KEY');
	if (!key) return;

	const script = document.createElement('script');
	script.innerHTML = `
		(function(d, w) {
			w.posthog = w.posthog || [];
			w.posthog.init('${key}', {
				api_host: 'https://app.posthog.com',
				persistence: 'localStorage',
				capture_pageview: true,
				capture_pageleave: true,
				loaded: function(posthog) {
					w.posthog = posthog;
				}
			});
		})(document, window);
	`;
	script.async = true;
	script.defer = true;
	document.body.appendChild(script);
}

export function usePostHog() {
	const pathname = usePathname();
	const searchParams = useSearchParams();

	useEffect(() => {
		initPostHog();
	}, []);

	useEffect(() => {
		if (typeof window !== 'undefined' && window.posthog) {
			window.posthog.capture('$pageview', {
				path: pathname,
				search: searchParams.toString(),
			});
		}
	}, [pathname, searchParams]);

	const capture = useCallback((event: string, properties?: Record<string, unknown>) => {
		if (typeof window !== 'undefined' && window.posthog) {
			window.posthog.capture(event, properties);
		}
	}, []);

	const identify = useCallback((distinctId: string, properties?: Record<string, unknown>) => {
		if (typeof window !== 'undefined' && window.posthog) {
			window.posthog.identify(distinctId, properties);
		}
	}, []);

	const reset = useCallback(() => {
		if (typeof window !== 'undefined' && window.posthog) {
			window.posthog.reset();
		}
	}, []);

	return { capture, identify, reset };
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
	useEffect(() => {
		initPostHog();
	}, []);

	return <>{children}</>;
}
