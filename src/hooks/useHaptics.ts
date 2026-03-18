'use client';

import { useCallback, useState } from 'react';

const HAPTIC_PATTERNS = {
	light: [10],
	medium: [15],
	success: [30, 50, 30],
	achievement: [50, 100, 50, 100, 100],
} as const;

export type HapticType = keyof typeof HAPTIC_PATTERNS;

const isHapticsSupported = typeof window !== 'undefined' && 'vibrate' in navigator;

function getStoredHapticsState(): boolean {
	if (typeof window === 'undefined') return true;
	const stored = localStorage.getItem('haptics-enabled');
	if (stored !== null) {
		return stored === 'true';
	}
	return isHapticsSupported;
}

export function useHaptics() {
	const [enabled, setEnabledState] = useState(getStoredHapticsState);

	const setEnabled = useCallback((value: boolean) => {
		setEnabledState(value);
		localStorage.setItem('haptics-enabled', String(value));
	}, []);

	const trigger = useCallback(
		(type: HapticType) => {
			if (!enabled || !isHapticsSupported) return;
			try {
				navigator.vibrate(HAPTIC_PATTERNS[type]);
			} catch {
				// Silently fail if vibration not available
			}
		},
		[enabled]
	);

	return {
		trigger,
		enabled,
		setEnabled,
		isSupported: isHapticsSupported,
	};
}
