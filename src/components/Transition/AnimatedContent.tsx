'use client';

import type { ReactNode } from 'react';
import { startTransition, useDeferredValue, useTransition } from 'react';

interface AnimatedContentProps {
	children: ReactNode;
	show: boolean;
	enter?: string;
	exit?: string;
}

export function AnimatedContent({
	children,
	show,
	enter = 'vt-fade-in',
	exit = 'vt-fade-out',
}: AnimatedContentProps) {
	const [isPending] = useTransition();

	if (!show && !isPending) return null;

	return (
		<div className={`animated-content ${show ? enter : exit}`} data-enter={enter} data-exit={exit}>
			{children}
		</div>
	);
}

export function useDeferredValueWithTransition<T>(value: T): T {
	const deferred = useDeferredValue(value);
	return deferred;
}

export function startViewTransition(callback: () => void) {
	if (typeof document !== 'undefined' && document.startViewTransition) {
		document.startViewTransition(callback);
	} else {
		startTransition(callback);
	}
}
