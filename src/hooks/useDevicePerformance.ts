'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type PerformanceTier = 'high' | 'medium' | 'low';

interface DevicePerformanceState {
	tier: PerformanceTier;
	supportsWebGL: boolean;
	supportsWebGPU: boolean;
	hasReducedMotionPreference: boolean;
	hardwareConcurrency: number;
	deviceMemory: number | undefined;
	analyzedAt: number | null;
	analyze: () => void;
}

export const useDevicePerformance = create<DevicePerformanceState>()(
	persist(
		(set) => ({
			tier: 'medium',
			supportsWebGL: true,
			supportsWebGPU: false,
			hasReducedMotionPreference: false,
			hardwareConcurrency: 4,
			deviceMemory: undefined,
			analyzedAt: null,

			analyze: () => {
				if (typeof window === 'undefined') return;

				const canvas = document.createElement('canvas');
				const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
				const supportsWebGL = !!gl;
				const supportsWebGPU = navigator.gpu !== undefined;

				const hardwareConcurrency = navigator.hardwareConcurrency || 4;
				const deviceMemory = (navigator as { deviceMemory?: number }).deviceMemory;

				const hasReducedMotionPreference = window.matchMedia(
					'(prefers-reduced-motion: reduce)'
				).matches;

				const tier = (() => {
					let score = 0;
					if (hardwareConcurrency >= 8) score += 2;
					else if (hardwareConcurrency >= 4) score += 1;
					if (deviceMemory && deviceMemory >= 8) score += 2;
					else if (deviceMemory && deviceMemory >= 4) score += 1;
					if (supportsWebGL && supportsWebGPU) score += 1;
					if (hasReducedMotionPreference) score -= 1;
					if (score >= 4) return 'high';
					if (score >= 2) return 'medium';
					return 'low';
				})();

				set({
					tier,
					supportsWebGL,
					supportsWebGPU,
					hasReducedMotionPreference,
					hardwareConcurrency,
					deviceMemory,
					analyzedAt: Date.now(),
				});

				if (tier === 'low') {
					document.documentElement.classList.add('low-performance-mode');
					document.documentElement.style.setProperty('--animation-duration', '0ms');
					document.documentElement.style.setProperty('--transition-duration', '0ms');
				} else if (tier === 'medium') {
					document.documentElement.classList.add('medium-performance-mode');
					document.documentElement.style.setProperty('--animation-duration', '150ms');
					document.documentElement.style.setProperty('--transition-duration', '100ms');
				} else {
					document.documentElement.style.setProperty('--animation-duration', '300ms');
					document.documentElement.style.setProperty('--transition-duration', '200ms');
				}
			},
		}),
		{
			name: 'device-performance-storage',
			partialize: (state) => ({
				tier: state.tier,
				analyzedAt: state.analyzedAt,
			}),
		}
	)
);

export function usePerformanceOptimizations() {
	const tier = useDevicePerformance((state) => state.tier);
	const analyze = useDevicePerformance((state) => state.analyze);

	if (typeof window !== 'undefined' && !useDevicePerformance.getState().analyzedAt) {
		analyze();
	}

	return {
		tier,
		shouldReduceAnimations: tier === 'low',
		shouldUseSimpleTransitions: tier !== 'high',
		shouldDisableBlur: tier !== 'high',
		shouldUseStaticImages: tier === 'low',
		shouldDisableParticles: tier !== 'high',
		shouldUseLighterFonts: tier === 'low',
		effectiveAnimationDuration: tier === 'low' ? '0ms' : tier === 'medium' ? '150ms' : '300ms',
	};
}
