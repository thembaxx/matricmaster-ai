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

	// Announce state changes
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
			// In production, integrate with speech synthesis API
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

		// Remove all colorblind classes
		root.classList.remove(
			'colorblind-deuteranopia',
			'colorblind-protanopia',
			'colorblind-tritanopia'
		);

		// Add selected mode
		if (mode !== 'off') {
			root.classList.add(`colorblind-${mode}`);
		}
	}, [mode]);
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
