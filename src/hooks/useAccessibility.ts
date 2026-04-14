/**
 * useAccessibility Hook
 *
 * Purpose: Provide accessible interaction patterns for simulations,
 * math content, and interactive elements.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
	announce,
	createFocusTrap,
	createLiveRegion,
	focusElement,
} from '@/lib/accessibility-service';

// ========================
// USE ANNOUNCE (Screen Reader)
// ========================

export function useAnnounce() {
	useEffect(() => {
		createLiveRegion();
	}, []);

	const announceMessage = useCallback((message: string, priority?: 'polite' | 'assertive') => {
		announce(message, priority);
	}, []);

	return { announce: announceMessage };
}

// ========================
// USE FOCUS TRAP
// ========================

export function useFocusTrap(enabled = true) {
	const containerRef = useRef<HTMLDivElement>(null);
	const focusTrapRef = useRef<ReturnType<typeof createFocusTrap> | null>(null);

	useEffect(() => {
		if (!enabled || !containerRef.current) return;

		focusTrapRef.current = createFocusTrap(containerRef.current);
		focusTrapRef.current.activate();

		return () => {
			focusTrapRef.current?.deactivate();
		};
	}, [enabled]);

	return { containerRef };
}

// ========================
// USE ACCESSIBLE KEYBOARD CONTROLS
// ========================

export interface KeyboardControlConfig {
	onIncrease?: () => void;
	onDecrease?: () => void;
	onSelect?: () => void;
	onCancel?: () => void;
	onNext?: () => void;
	onPrevious?: () => void;
}

export function useAccessibleKeyboardControls(config: KeyboardControlConfig) {
	const handleKeyDown = useCallback(
		(event: KeyboardEvent) => {
			switch (event.key) {
				case 'ArrowUp':
					event.preventDefault();
					config.onIncrease?.();
					break;
				case 'ArrowDown':
					event.preventDefault();
					config.onDecrease?.();
					break;
				case ' ':
				case 'Enter':
					event.preventDefault();
					config.onSelect?.();
					break;
				case 'Escape':
					event.preventDefault();
					config.onCancel?.();
					break;
				case 'ArrowRight':
					event.preventDefault();
					config.onNext?.();
					break;
				case 'ArrowLeft':
					event.preventDefault();
					config.onPrevious?.();
					break;
			}
		},
		[config]
	);

	useEffect(() => {
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [handleKeyDown]);

	return { handleKeyDown };
}

// ========================
// USE ACCESSIBLE SIMULATION
// ========================

export interface SimulationState {
	isPlaying: boolean;
	currentStep: number;
	totalSteps: number;
	speed: number;
}

export function useAccessibleSimulation(totalSteps: number) {
	const [state, setState] = useState<SimulationState>({
		isPlaying: false,
		currentStep: 0,
		totalSteps,
		speed: 1,
	});

	const { announce } = useAnnounce();

	const controls = useAccessibleKeyboardControls({
		onSelect: () => setState((s) => ({ ...s, isPlaying: !s.isPlaying })),
		onCancel: () => setState((s) => ({ ...s, isPlaying: false, currentStep: 0 })),
		onNext: () =>
			setState((s) => {
				const nextStep = Math.min(s.currentStep + 1, s.totalSteps);
				return { ...s, currentStep: nextStep };
			}),
		onPrevious: () =>
			setState((s) => {
				const prevStep = Math.max(s.currentStep - 1, 0);
				return { ...s, currentStep: prevStep };
			}),
		onIncrease: () => setState((s) => ({ ...s, speed: Math.min(s.speed + 0.5, 3) })),
		onDecrease: () => setState((s) => ({ ...s, speed: Math.max(s.speed - 0.5, 0.5) })),
	});

	useEffect(() => {
		announce(`Simulation step ${state.currentStep + 1} of ${state.totalSteps}`);
	}, [state.currentStep, state.totalSteps, announce]);

	return {
		state,
		setState,
		controls,
	};
}

// ========================
// USE ACCESSIBLE MATH
// ========================

export function useAccessibleMath(latex: string) {
	const { announce } = useAnnounce();
	const elementRef = useRef<HTMLDivElement>(null);

	const speakMath = useCallback(() => {
		if (elementRef.current) {
			announce(`Math content: ${latex}`);
		}
	}, [latex, announce]);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				speakMath();
			}
		},
		[speakMath]
	);

	return { elementRef, handleKeyDown, speakMath };
}

// ========================
// USE COLORBLIND MODE
// ========================

export type ColorblindMode = 'off' | 'deuteranopia' | 'protanopia' | 'tritanopia';

export function useColorblindMode(mode: ColorblindMode) {
	useEffect(() => {
		const root = document.documentElement;

		root.classList.remove(
			'colorblind-deuteranopia',
			'colorblind-protanopia',
			'colorblind-tritanopia'
		);

		if (mode !== 'off') {
			root.classList.add(`colorblind-${mode}`);
		}
	}, [mode]);
}

// ========================
// USE ACCESSIBILITY (COMPOSITE HOOK)
// ========================

export type TextSizeString = 'normal' | 'large' | 'x-large' | 'xx-large';
export type TextSizeValue = number | TextSizeString;

export interface AccessibilitySettings {
	highContrast: boolean;
	reducedMotion: boolean;
	largerTargets: boolean;
	focusIndicators: boolean;
	keyboardNavigation: boolean;
	simplifiedLanguage: boolean;
	ttsEnabled: boolean;
	chunkedContent: boolean;
	progressBreadcrumbs: boolean;
	oneThingAtATime: boolean;
	skipLinks: boolean;
	holdToClick: boolean;
	visualSoundIndicators: boolean;
	textSize: TextSizeString;
	colorBlindMode: ColorBlindFilter;
}

export type ColorBlindFilter = 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia';

export interface TextSizeOption {
	value: TextSizeString;
	label: string;
}

export interface ColorBlindOption {
	value: ColorBlindFilter;
	label: string;
}

export interface AccessibilityState {
	settings: AccessibilitySettings;
	textSizeMultiplier: number;
	colorBlindFilter: ColorBlindFilter;
	isSpeaking: boolean;
	updateSetting: (key: keyof AccessibilitySettings, value: boolean) => void;
	setTextSize: (value: TextSizeValue) => void;
	setColorBlindFilter: (filter: ColorBlindFilter) => void;
	setColorBlindMode: (mode: ColorBlindFilter) => void;
	toggleHighContrast: () => void;
	toggleReducedMotion: () => void;
	toggleFocusIndicators: () => void;
	toggleLargerTargets: () => void;
	toggleKeyboardNavigation: () => void;
	toggleSimplifiedLanguage: () => void;
	toggleTtsEnabled: () => void;
	toggleChunkedContent: () => void;
	toggleProgressBreadcrumbs: () => void;
	toggleOneThingAtATime: () => void;
	toggleSkipLinks: () => void;
	toggleHoldToClick: () => void;
	toggleVisualSoundIndicators: () => void;
	speak: (text: string) => void;
	stopSpeaking: () => void;
	reset: () => void;
	textSizeOptions: TextSizeOption[];
	colorBlindOptions: ColorBlindOption[];
}

const TEXT_SIZE_OPTIONS: TextSizeOption[] = [
	{ value: 'normal', label: 'Normal' },
	{ value: 'large', label: 'Large' },
	{ value: 'x-large', label: 'Extra Large' },
	{ value: 'xx-large', label: 'XX Large' },
];

const COLOR_BLIND_OPTIONS: ColorBlindOption[] = [
	{ value: 'none', label: 'Off' },
	{ value: 'deuteranopia', label: 'Deuteranopia' },
	{ value: 'protanopia', label: 'Protanopia' },
	{ value: 'tritanopia', label: 'Tritanopia' },
];

const DEFAULT_SETTINGS: AccessibilitySettings = {
	highContrast: false,
	reducedMotion: false,
	largerTargets: false,
	focusIndicators: true,
	keyboardNavigation: false,
	simplifiedLanguage: false,
	ttsEnabled: false,
	chunkedContent: false,
	progressBreadcrumbs: false,
	oneThingAtATime: false,
	skipLinks: true,
	holdToClick: false,
	visualSoundIndicators: true,
	textSize: 'normal',
	colorBlindMode: 'none',
};

const STORAGE_KEY = 'lumni:accessibility';

function loadSettings(): AccessibilitySettings {
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
		}
	} catch {
		// ignore parse errors
	}
	return { ...DEFAULT_SETTINGS };
}

function saveSettings(settings: AccessibilitySettings) {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
	} catch {
		// ignore storage errors
	}
}

function makeToggle(
	setter: (fn: (s: AccessibilitySettings) => AccessibilitySettings) => void,
	key: keyof AccessibilitySettings
) {
	return () => setter((prev) => ({ ...prev, [key]: !prev[key] }));
}

export function useAccessibility(_userId?: string): AccessibilityState {
	const [settings, setSettings] = useState<AccessibilitySettings>(loadSettings);
	const [textSizeMultiplier, setTextSizeMultiplier] = useState(1);
	const [colorBlindFilter, setColorBlindFilterState] = useState<ColorBlindFilter>('none');
	const [isSpeaking, setIsSpeaking] = useState(false);

	const updateSetting = useCallback((key: keyof AccessibilitySettings, value: boolean) => {
		setSettings((prev) => {
			const next = { ...prev, [key]: value };
			saveSettings(next);
			return next;
		});
	}, []);

	const setTextSize = useCallback(
		(multiplier: number | 'normal' | 'large' | 'x-large' | 'xx-large') => {
			const numValue =
				typeof multiplier === 'number'
					? multiplier
					: ({ normal: 1, large: 1.2, 'x-large': 1.35, 'xx-large': 1.5 }[multiplier] ?? 1);
			const strValue: TextSizeString =
				typeof multiplier === 'string'
					? multiplier
					: ((
							{
								0.8: 'normal',
								1: 'normal',
								1.2: 'large',
								1.35: 'x-large',
								1.5: 'xx-large',
							} as const
						)[numValue] ?? 'normal');
			const clamped = Math.max(0.8, Math.min(1.5, numValue));
			setTextSizeMultiplier(clamped);
			setSettings((prev) => {
				const next = { ...prev, textSize: strValue };
				saveSettings(next);
				return next;
			});
		},
		[]
	);

	const setColorBlindFilter = useCallback((filter: ColorBlindFilter) => {
		setColorBlindFilterState(filter);
		setSettings((prev) => {
			const next = { ...prev, colorBlindMode: filter };
			saveSettings(next);
			return next;
		});
	}, []);

	const setColorBlindMode = setColorBlindFilter;

	const speak = useCallback((text: string) => {
		if (!('speechSynthesis' in window)) return;
		window.speechSynthesis.cancel();
		const utterance = new SpeechSynthesisUtterance(text);
		utterance.onstart = () => setIsSpeaking(true);
		utterance.onend = () => setIsSpeaking(false);
		utterance.onerror = () => setIsSpeaking(false);
		window.speechSynthesis.speak(utterance);
	}, []);

	const stopSpeaking = useCallback(() => {
		if ('speechSynthesis' in window) {
			window.speechSynthesis.cancel();
			setIsSpeaking(false);
		}
	}, []);

	const reset = useCallback(() => {
		setSettings({ ...DEFAULT_SETTINGS });
		setTextSizeMultiplier(1);
		setColorBlindFilterState('none');
		setIsSpeaking(false);
		localStorage.removeItem(STORAGE_KEY);
	}, []);

	return {
		settings,
		textSizeMultiplier,
		colorBlindFilter,
		isSpeaking,
		updateSetting,
		setTextSize,
		setColorBlindFilter,
		setColorBlindMode,
		toggleHighContrast: makeToggle(setSettings, 'highContrast'),
		toggleReducedMotion: makeToggle(setSettings, 'reducedMotion'),
		toggleFocusIndicators: makeToggle(setSettings, 'focusIndicators'),
		toggleLargerTargets: makeToggle(setSettings, 'largerTargets'),
		toggleKeyboardNavigation: makeToggle(setSettings, 'keyboardNavigation'),
		toggleSimplifiedLanguage: makeToggle(setSettings, 'simplifiedLanguage'),
		toggleTtsEnabled: makeToggle(setSettings, 'ttsEnabled'),
		toggleChunkedContent: makeToggle(setSettings, 'chunkedContent'),
		toggleProgressBreadcrumbs: makeToggle(setSettings, 'progressBreadcrumbs'),
		toggleOneThingAtATime: makeToggle(setSettings, 'oneThingAtATime'),
		toggleSkipLinks: makeToggle(setSettings, 'skipLinks'),
		toggleHoldToClick: makeToggle(setSettings, 'holdToClick'),
		toggleVisualSoundIndicators: makeToggle(setSettings, 'visualSoundIndicators'),
		speak,
		stopSpeaking,
		reset,
		textSizeOptions: TEXT_SIZE_OPTIONS,
		colorBlindOptions: COLOR_BLIND_OPTIONS,
	};
}

// ========================
// USE HIGH CONTRAST
// ========================

export function useHighContrast(enabled: boolean) {
	useEffect(() => {
		const root = document.documentElement;

		if (enabled) {
			root.classList.add('high-contrast');
		} else {
			root.classList.remove('high-contrast');
		}
	}, [enabled]);
}

// ========================
// USE FOCUS MANAGEMENT
// ========================

export function useFocusOnMount(elementId: string) {
	const hasFocused = useRef(false);

	useEffect(() => {
		if (!hasFocused.current) {
			hasFocused.current = true;
			focusElement(elementId);
		}
	}, [elementId]);
}
