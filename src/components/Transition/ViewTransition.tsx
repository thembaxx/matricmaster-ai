'use client';

import type { ReactNode } from 'react';

interface ViewTransitionProps {
	children: ReactNode;
	name?: string;
}

export function ViewTransition({ children, name }: ViewTransitionProps) {
	if (typeof document === 'undefined') {
		return <>{children}</>;
	}

	if (!document.startViewTransition) {
		return <>{children}</>;
	}

	return (
		<div
			style={{
				viewTransitionName: name || undefined,
			}}
		>
			{children}
		</div>
	);
}

export function useViewTransition() {
	if (typeof window === 'undefined') {
		return { isSupported: false, startTransition: () => {} };
	}

	return {
		isSupported: typeof document !== 'undefined' && !!document.startViewTransition,
		startViewTransition: (callback: () => void) => {
			if (document.startViewTransition) {
				document.startViewTransition(callback);
			} else {
				callback();
			}
		},
	};
}
