'use client';

import { useCallback, useState } from 'react';

const HAPTIC_PATTERNS = {
	light: [10],
	medium: [15],
	success: [30, 50, 30],
	achievement: [50, 100, 50, 100, 100],
} as const;

export type HapticType = keyof typeof HAPTIC_PATTERNS;

// Re-evaluated on each call rather than at module load time,
// so test mocks that add navigator.vibrate after import are picked up.
function checkHapticsSupported(): boolean {
	return typeof window !== 'undefined' && 'vibrate' in navigator;
}

function getStoredHapticsState(): boolean {
	if (typeof window === 'undefined') return true;
	const stored = localStorage.getItem('haptics-enabled');
	if (stored !== null) {
		return stored === 'true';
	}
	return checkHapticsSupported();
}

export function useHaptics() {
	const [enabled, setEnabledState] = useState(getStoredHapticsState);

	const setEnabled = useCallback((value: boolean) => {
		setEnabledState(value);
		localStorage.setItem('haptics-enabled', String(value));
	}, []);

	const trigger = useCallback(
		(type: HapticType) => {
			if (!enabled || !checkHapticsSupported()) return;
			try {
				navigator.vibrate(HAPTIC_PATTERNS[type]);
			} catch (error) {
				console.warn('Haptic feedback not available:', error);
			}
		},
		[enabled]
	);

	return {
		trigger,
		enabled,
		setEnabled,
		isSupported: checkHapticsSupported(),
	};
}
