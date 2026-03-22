'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ColorBlindMode = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
export type TextSize = 'normal' | 'large' | 'x-large' | 'xx-large';

export interface AccessibilitySettings {
	highContrast: boolean;
	textSize: TextSize;
	reducedMotion: boolean;
	colorBlindMode: ColorBlindMode;
	simplifiedLanguage: boolean;
	ttsEnabled: boolean;
	largerTargets: boolean;
	keyboardNavigation: boolean;
	chunkedContent: boolean;
	progressBreadcrumbs: boolean;
	oneThingAtATime: boolean;
	skipLinks: boolean;
	holdToClick: boolean;
	focusIndicators: boolean;
	visualSoundIndicators: boolean;
}

export interface AccessibilityState extends AccessibilitySettings {
	setSetting: <K extends keyof AccessibilitySettings>(
		key: K,
		value: AccessibilitySettings[K]
	) => void;
	toggleSetting: <K extends keyof AccessibilitySettings>(key: K) => void;
	setAll: (settings: Partial<AccessibilitySettings>) => void;
	reset: () => void;
}

const defaultSettings: AccessibilitySettings = {
	highContrast: false,
	textSize: 'normal',
	reducedMotion: false,
	colorBlindMode: 'none',
	simplifiedLanguage: false,
	ttsEnabled: false,
	largerTargets: false,
	keyboardNavigation: false,
	chunkedContent: false,
	progressBreadcrumbs: true,
	oneThingAtATime: false,
	skipLinks: true,
	holdToClick: false,
	focusIndicators: true,
	visualSoundIndicators: true,
};

function getSystemPreferences(): Partial<AccessibilitySettings> {
	if (typeof window === 'undefined') return {};

	const prefs: Partial<AccessibilitySettings> = {};

	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
		prefs.reducedMotion = true;
	}

	if (window.matchMedia('(prefers-contrast: more)').matches) {
		prefs.highContrast = true;
	}

	return prefs;
}

export const useAccessibilityStore = create<AccessibilityState>()(
	persist(
		(set) => ({
			...defaultSettings,
			...getSystemPreferences(),

			setSetting: (key, value) => set((state) => ({ ...state, [key]: value })),

			toggleSetting: (key) =>
				set((state) => ({
					...state,
					[key]: !state[key as keyof AccessibilitySettings],
				})),

			setAll: (settings) => set((state) => ({ ...state, ...settings })),

			reset: () => set({ ...defaultSettings, ...getSystemPreferences() }),
		}),
		{
			name: 'lumni-accessibility',
		}
	)
);

export function getTextSizeMultiplier(textSize: TextSize): number {
	switch (textSize) {
		case 'normal':
			return 1;
		case 'large':
			return 1.25;
		case 'x-large':
			return 1.5;
		case 'xx-large':
			return 2;
		default:
			return 1;
	}
}

export function getColorBlindFilter(colorBlindMode: ColorBlindMode): string {
	switch (colorBlindMode) {
		case 'protanopia':
			return 'url(#protanopia-filter)';
		case 'deuteranopia':
			return 'url(#deuteranopia-filter)';
		case 'tritanopia':
			return 'url(#tritanopia-filter)';
		default:
			return 'none';
	}
}

export const TEXT_SIZE_OPTIONS: { value: TextSize; label: string; multiplier: number }[] = [
	{ value: 'normal', label: 'Normal', multiplier: 1 },
	{ value: 'large', label: 'Large (25%)', multiplier: 1.25 },
	{ value: 'x-large', label: 'Extra Large (50%)', multiplier: 1.5 },
	{ value: 'xx-large', label: 'Double Extra Large (100%)', multiplier: 2 },
];

export const COLOR_BLIND_OPTIONS: { value: ColorBlindMode; label: string }[] = [
	{ value: 'none', label: 'None' },
	{ value: 'protanopia', label: 'Protanopia (Red-Blind)' },
	{ value: 'deuteranopia', label: 'Deuteranopia (Green-Blind)' },
	{ value: 'tritanopia', label: 'Tritanopia (Blue-Blind)' },
];
