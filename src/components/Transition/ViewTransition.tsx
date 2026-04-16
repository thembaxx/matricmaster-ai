'use client';

import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { ViewTransition as ReactViewTransition, startTransition } from 'react';

type TransitionType =
	| 'nav-forward'
	| 'nav-back'
	| 'modal-in'
	| 'modal-out'
	| 'fade'
	| 'slide'
	| 'slide-up'
	| 'slide-down'
	| 'none';

interface ViewTransitionProps {
	children: ReactNode;
	name?: string;
	enter?: string | { [key: string]: string };
	exit?: string | { [key: string]: string };
	share?: string | { [key: string]: string };
	default?: string;
}

const TRANSITION_TYPE_KEY = 'x-view-transition-type';

function getBody(): Record<string, unknown> {
	if (typeof document !== 'undefined') {
		return document.body as unknown as Record<string, unknown>;
	}
	return {};
}

export function addTransitionType(type: string) {
	if (typeof window !== 'undefined') {
		getBody()[TRANSITION_TYPE_KEY] = type;
	}
}

function getTransitionType(): string | null {
	if (typeof window !== 'undefined') {
		return getBody()[TRANSITION_TYPE_KEY] as string | null;
	}
	return null;
}

function clearTransitionType() {
	if (typeof window !== 'undefined') {
		delete getBody()[TRANSITION_TYPE_KEY];
	}
}

function getTransitionClass(
	transitionConfig: string | { [key: string]: string } | undefined,
	defaultClass: string
): string {
	if (!transitionConfig) return defaultClass;

	if (typeof transitionConfig === 'string') {
		return transitionConfig;
	}

	const currentType = getTransitionType();
	if (currentType && transitionConfig[currentType]) {
		return transitionConfig[currentType];
	}

	return transitionConfig.default || defaultClass;
}

export function ViewTransition({
	children,
	name,
	enter,
	exit,
	share,
	default: defaultTransition = 'none',
}: ViewTransitionProps) {
	const enterClass = getTransitionClass(enter, defaultTransition);
	const exitClass = getTransitionClass(exit, defaultTransition);
	const shareClass = getTransitionClass(share, 'vt-morph');

	// Check if React ViewTransition is available (React canary with Next.js)
	const hasNativeVT = typeof ReactViewTransition !== 'undefined';

	if (hasNativeVT) {
		return (
			<ReactViewTransition
				name={name}
				enter={enterClass}
				exit={exitClass}
				share={shareClass}
				default={defaultTransition}
			>
				{children}
			</ReactViewTransition>
		);
	}

	// Fallback for browsers without ViewTransition support
	return <>{children}</>;
}

export function useViewTransition() {
	const router = useRouter();

	const transitionNavigate = (href: string, types?: string[]) => {
		if (types) {
			types.forEach(addTransitionType);
		}

		startTransition(() => {
			router.push(href);
		});

		setTimeout(clearTransitionType, 100);
	};

	return {
		isSupported: typeof document !== 'undefined' && !!document.startViewTransition,
		startViewTransition: (callback: () => void) => {
			if (document.startViewTransition) {
				document.startViewTransition(callback);
			} else {
				callback();
			}
		},
		transitionNavigate,
		addTransitionType,
	};
}

export function useNavigationTransition() {
	const router = useRouter();

	const push = (href: string) => {
		startTransition(() => {
			router.push(href);
		});
	};

	const forward = (href: string) => {
		addTransitionType('nav-forward');
		push(href);
	};

	const back = (href: string) => {
		addTransitionType('nav-back');
		push(href);
	};

	return { push, forward, back, router };
}

export type { TransitionType };
