'use client';

import { useCallback, useEffect, useState } from 'react';

const HAPTIC_PATTERNS = {
	light: [10],
	medium: [15],
	success: [30, 50, 30],
	achievement: [50, 100, 50, 100, 100],
} as const;

export type HapticType = keyof typeof HAPTIC_PATTERNS;

export function useHaptics() {
	const [enabled, setEnabledState] = useState(true);
	const [isSupported, setIsSupported] = useState(false);

	useEffect(() => {
		if (typeof window === 'undefined') return;

		const supported = 'vibrate' in navigator;
		setIsSupported(supported);

		const stored = localStorage.getItem('haptics-enabled');
		if (stored !== null) {
			setEnabledState(stored === 'true');
		} else {
			setEnabledState(supported);
		}
	}, []);

	const setEnabled = useCallback((value: boolean) => {
		setEnabledState(value);
		localStorage.setItem('haptics-enabled', String(value));
	}, []);

	const trigger = useCallback(
		(type: HapticType) => {
			if (!enabled || !isSupported) return;
			try {
				navigator.vibrate(HAPTIC_PATTERNS[type]);
			} catch {
				// Silently fail if vibration not available
			}
		},
		[enabled, isSupported]
	);

	return {
		trigger,
		enabled,
		setEnabled,
		isSupported,
	};
}
