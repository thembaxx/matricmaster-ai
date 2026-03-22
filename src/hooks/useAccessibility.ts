'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
	getOrCreateAccessibilityPreferences,
	updateAccessibilityPreferences,
} from '@/lib/db/accessibility-actions';
import {
	type AccessibilitySettings,
	COLOR_BLIND_OPTIONS,
	type ColorBlindMode,
	TEXT_SIZE_OPTIONS,
	type TextSize,
	useAccessibilityStore,
} from '@/services/accessibility-service';

export interface UseAccessibilityReturn {
	settings: AccessibilitySettings;
	setHighContrast: (value: boolean) => void;
	toggleHighContrast: () => void;
	setTextSize: (value: TextSize) => void;
	setReducedMotion: (value: boolean) => void;
	toggleReducedMotion: () => void;
	setColorBlindMode: (value: ColorBlindMode) => void;
	setSimplifiedLanguage: (value: boolean) => void;
	toggleSimplifiedLanguage: () => void;
	setTtsEnabled: (value: boolean) => void;
	toggleTtsEnabled: () => void;
	setLargerTargets: (value: boolean) => void;
	toggleLargerTargets: () => void;
	setKeyboardNavigation: (value: boolean) => void;
	toggleKeyboardNavigation: () => void;
	setChunkedContent: (value: boolean) => void;
	toggleChunkedContent: () => void;
	setProgressBreadcrumbs: (value: boolean) => void;
	toggleProgressBreadcrumbs: () => void;
	setOneThingAtATime: (value: boolean) => void;
	toggleOneThingAtATime: () => void;
	setSkipLinks: (value: boolean) => void;
	toggleSkipLinks: () => void;
	setHoldToClick: (value: boolean) => void;
	toggleHoldToClick: () => void;
	setFocusIndicators: (value: boolean) => void;
	toggleFocusIndicators: () => void;
	setVisualSoundIndicators: (value: boolean) => void;
	toggleVisualSoundIndicators: () => void;
	setAll: (settings: Partial<AccessibilitySettings>) => void;
	reset: () => void;
	textSizeMultiplier: number;
	colorBlindFilter: string;
	textSizeOptions: typeof TEXT_SIZE_OPTIONS;
	colorBlindOptions: typeof COLOR_BLIND_OPTIONS;
	speak: (text: string) => void;
	stopSpeaking: () => void;
	isSpeaking: boolean;
}

export function useAccessibility(userId?: string): UseAccessibilityReturn {
	const store = useAccessibilityStore();

	useEffect(() => {
		if (userId) {
			getOrCreateAccessibilityPreferences(userId)
				.then((dbPrefs) => {
					store.setAll({
						highContrast: dbPrefs.highContrast,
						textSize: dbPrefs.textSize as TextSize,
						reducedMotion: dbPrefs.reducedMotion,
						colorBlindMode: dbPrefs.colorBlindMode as ColorBlindMode,
						simplifiedLanguage: dbPrefs.simplifiedLanguage,
						ttsEnabled: dbPrefs.ttsEnabled,
						largerTargets: dbPrefs.largerTargets,
						keyboardNavigation: dbPrefs.keyboardNavigation,
						chunkedContent: dbPrefs.chunkedContent,
						progressBreadcrumbs: dbPrefs.progressBreadcrumbs,
						oneThingAtATime: dbPrefs.oneThingAtATime,
						skipLinks: dbPrefs.skipLinks,
						holdToClick: dbPrefs.holdToClick,
						focusIndicators: dbPrefs.focusIndicators,
						visualSoundIndicators: dbPrefs.visualSoundIndicators,
					});
				})
				.catch(console.error);
		}
	}, [userId, store.setAll]);

	const syncToDb = useCallback(
		(updates: Partial<AccessibilitySettings>) => {
			if (userId) {
				updateAccessibilityPreferences(userId, updates as any).catch(console.error);
			}
		},
		[userId]
	);

	const setHighContrast = useCallback(
		(value: boolean) => {
			store.setSetting('highContrast', value);
			syncToDb({ highContrast: value });
		},
		[store, syncToDb]
	);

	const toggleHighContrast = useCallback(() => {
		const newValue = !store.highContrast;
		store.setSetting('highContrast', newValue);
		syncToDb({ highContrast: newValue });
	}, [store, syncToDb]);

	const setTextSize = useCallback(
		(value: TextSize) => {
			store.setSetting('textSize', value);
			syncToDb({ textSize: value });
		},
		[store, syncToDb]
	);

	const setReducedMotion = useCallback(
		(value: boolean) => {
			store.setSetting('reducedMotion', value);
			syncToDb({ reducedMotion: value });
		},
		[store, syncToDb]
	);

	const toggleReducedMotion = useCallback(() => {
		const newValue = !store.reducedMotion;
		store.setSetting('reducedMotion', newValue);
		syncToDb({ reducedMotion: newValue });
	}, [store, syncToDb]);

	const setColorBlindMode = useCallback(
		(value: ColorBlindMode) => {
			store.setSetting('colorBlindMode', value);
			syncToDb({ colorBlindMode: value });
		},
		[store, syncToDb]
	);

	const setSimplifiedLanguage = useCallback(
		(value: boolean) => {
			store.setSetting('simplifiedLanguage', value);
			syncToDb({ simplifiedLanguage: value });
		},
		[store, syncToDb]
	);

	const toggleSimplifiedLanguage = useCallback(() => {
		const newValue = !store.simplifiedLanguage;
		store.setSetting('simplifiedLanguage', newValue);
		syncToDb({ simplifiedLanguage: newValue });
	}, [store, syncToDb]);

	const setTtsEnabled = useCallback(
		(value: boolean) => {
			store.setSetting('ttsEnabled', value);
			syncToDb({ ttsEnabled: value });
		},
		[store, syncToDb]
	);

	const toggleTtsEnabled = useCallback(() => {
		const newValue = !store.ttsEnabled;
		store.setSetting('ttsEnabled', newValue);
		syncToDb({ ttsEnabled: newValue });
	}, [store, syncToDb]);

	const setLargerTargets = useCallback(
		(value: boolean) => {
			store.setSetting('largerTargets', value);
			syncToDb({ largerTargets: value });
		},
		[store, syncToDb]
	);

	const toggleLargerTargets = useCallback(() => {
		const newValue = !store.largerTargets;
		store.setSetting('largerTargets', newValue);
		syncToDb({ largerTargets: newValue });
	}, [store, syncToDb]);

	const setKeyboardNavigation = useCallback(
		(value: boolean) => {
			store.setSetting('keyboardNavigation', value);
			syncToDb({ keyboardNavigation: value });
		},
		[store, syncToDb]
	);

	const toggleKeyboardNavigation = useCallback(() => {
		const newValue = !store.keyboardNavigation;
		store.setSetting('keyboardNavigation', newValue);
		syncToDb({ keyboardNavigation: newValue });
	}, [store, syncToDb]);

	const setChunkedContent = useCallback(
		(value: boolean) => {
			store.setSetting('chunkedContent', value);
			syncToDb({ chunkedContent: value });
		},
		[store, syncToDb]
	);

	const toggleChunkedContent = useCallback(() => {
		const newValue = !store.chunkedContent;
		store.setSetting('chunkedContent', newValue);
		syncToDb({ chunkedContent: newValue });
	}, [store, syncToDb]);

	const setProgressBreadcrumbs = useCallback(
		(value: boolean) => {
			store.setSetting('progressBreadcrumbs', value);
			syncToDb({ progressBreadcrumbs: value });
		},
		[store, syncToDb]
	);

	const toggleProgressBreadcrumbs = useCallback(() => {
		const newValue = !store.progressBreadcrumbs;
		store.setSetting('progressBreadcrumbs', newValue);
		syncToDb({ progressBreadcrumbs: newValue });
	}, [store, syncToDb]);

	const setOneThingAtATime = useCallback(
		(value: boolean) => {
			store.setSetting('oneThingAtATime', value);
			syncToDb({ oneThingAtATime: value });
		},
		[store, syncToDb]
	);

	const toggleOneThingAtATime = useCallback(() => {
		const newValue = !store.oneThingAtATime;
		store.setSetting('oneThingAtATime', newValue);
		syncToDb({ oneThingAtATime: newValue });
	}, [store, syncToDb]);

	const setSkipLinks = useCallback(
		(value: boolean) => {
			store.setSetting('skipLinks', value);
			syncToDb({ skipLinks: value });
		},
		[store, syncToDb]
	);

	const toggleSkipLinks = useCallback(() => {
		const newValue = !store.skipLinks;
		store.setSetting('skipLinks', newValue);
		syncToDb({ skipLinks: newValue });
	}, [store, syncToDb]);

	const setHoldToClick = useCallback(
		(value: boolean) => {
			store.setSetting('holdToClick', value);
			syncToDb({ holdToClick: value });
		},
		[store, syncToDb]
	);

	const toggleHoldToClick = useCallback(() => {
		const newValue = !store.holdToClick;
		store.setSetting('holdToClick', newValue);
		syncToDb({ holdToClick: newValue });
	}, [store, syncToDb]);

	const setFocusIndicators = useCallback(
		(value: boolean) => {
			store.setSetting('focusIndicators', value);
			syncToDb({ focusIndicators: value });
		},
		[store, syncToDb]
	);

	const toggleFocusIndicators = useCallback(() => {
		const newValue = !store.focusIndicators;
		store.setSetting('focusIndicators', newValue);
		syncToDb({ focusIndicators: newValue });
	}, [store, syncToDb]);

	const setVisualSoundIndicators = useCallback(
		(value: boolean) => {
			store.setSetting('visualSoundIndicators', value);
			syncToDb({ visualSoundIndicators: value });
		},
		[store, syncToDb]
	);

	const toggleVisualSoundIndicators = useCallback(() => {
		const newValue = !store.visualSoundIndicators;
		store.setSetting('visualSoundIndicators', newValue);
		syncToDb({ visualSoundIndicators: newValue });
	}, [store, syncToDb]);

	const setAll = useCallback(
		(settings: Partial<AccessibilitySettings>) => {
			store.setAll(settings);
			syncToDb(settings);
		},
		[store, syncToDb]
	);

	const reset = useCallback(() => {
		store.reset();
		if (userId) {
			updateAccessibilityPreferences(userId, {
				highContrast: false,
				textSize: '1',
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
			}).catch(console.error);
		}
	}, [store, userId]);

	const textSizeMultiplier = useMemo(() => {
		const multipliers: Record<TextSize, number> = {
			normal: 1,
			large: 1.25,
			'x-large': 1.5,
			'xx-large': 2,
		};
		return multipliers[store.textSize] || 1;
	}, [store.textSize]);

	const colorBlindFilter = useMemo(() => {
		const filters: Record<ColorBlindMode, string> = {
			none: 'none',
			protanopia: 'url(#protanopia-filter)',
			deuteranopia: 'url(#deuteranopia-filter)',
			tritanopia: 'url(#tritanopia-filter)',
		};
		return filters[store.colorBlindMode] || 'none';
	}, [store.colorBlindMode]);

	const synth = useMemo(() => {
		if (typeof window === 'undefined') return null;
		return window.speechSynthesis;
	}, []);

	const [isSpeaking, setIsSpeaking] = useState(false);

	const speak = useCallback(
		(text: string) => {
			if (!synth || !store.ttsEnabled) return;

			synth.cancel();
			const utterance = new SpeechSynthesisUtterance(text);
			utterance.rate = 0.9;
			utterance.pitch = 1;
			utterance.onstart = () => setIsSpeaking(true);
			utterance.onend = () => setIsSpeaking(false);
			utterance.onerror = () => setIsSpeaking(false);
			synth.speak(utterance);
		},
		[synth, store.ttsEnabled]
	);

	const stopSpeaking = useCallback(() => {
		if (synth) {
			synth.cancel();
			setIsSpeaking(false);
		}
	}, [synth]);

	return {
		settings: store,
		setHighContrast,
		toggleHighContrast,
		setTextSize,
		setReducedMotion,
		toggleReducedMotion,
		setColorBlindMode,
		setSimplifiedLanguage,
		toggleSimplifiedLanguage,
		setTtsEnabled,
		toggleTtsEnabled,
		setLargerTargets,
		toggleLargerTargets,
		setKeyboardNavigation,
		toggleKeyboardNavigation,
		setChunkedContent,
		toggleChunkedContent,
		setProgressBreadcrumbs,
		toggleProgressBreadcrumbs,
		setOneThingAtATime,
		toggleOneThingAtATime,
		setSkipLinks,
		toggleSkipLinks,
		setHoldToClick,
		toggleHoldToClick,
		setFocusIndicators,
		toggleFocusIndicators,
		setVisualSoundIndicators,
		toggleVisualSoundIndicators,
		setAll,
		reset,
		textSizeMultiplier,
		colorBlindFilter,
		textSizeOptions: TEXT_SIZE_OPTIONS,
		colorBlindOptions: COLOR_BLIND_OPTIONS,
		speak,
		stopSpeaking,
		isSpeaking,
	};
}
