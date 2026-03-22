'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LowDataModeStore {
	isEnabled: boolean;
	reduceAnimations: boolean;
	lowQualityImages: boolean;
	noVideoPreviews: boolean;
	noAutoPlay: boolean;
	textOnlyPDFs: boolean;
	connectionType: 'unknown' | 'slow-2g' | '2g' | '3g' | '4g' | 'wifi';
	effectiveMode: 'full' | 'medium' | 'minimal';
	toggle: () => void;
	setEnabled: (enabled: boolean) => void;
	setConnectionType: (type: LowDataModeStore['connectionType']) => void;
	applyOptimizations: () => void;
}

function calculateEffectiveMode(state: LowDataModeStore): 'full' | 'medium' | 'minimal' {
	if (!state.isEnabled) return 'full';
	if (state.connectionType === 'slow-2g' || state.connectionType === '2g') return 'minimal';
	if (state.connectionType === '3g') return 'medium';
	return 'medium';
}

export const useLowDataModeStore = create<LowDataModeStore>()(
	persist(
		(set, get) => ({
			isEnabled: false,
			reduceAnimations: false,
			lowQualityImages: false,
			noVideoPreviews: false,
			noAutoPlay: false,
			textOnlyPDFs: false,
			connectionType: 'unknown',
			effectiveMode: 'full',

			toggle: () => {
				set((state) => {
					const newEnabled = !state.isEnabled;
					return {
						isEnabled: newEnabled,
						reduceAnimations: newEnabled,
						lowQualityImages: newEnabled,
						noVideoPreviews: newEnabled,
						noAutoPlay: newEnabled,
						textOnlyPDFs: newEnabled,
						effectiveMode: calculateEffectiveMode({ ...state, isEnabled: newEnabled }),
					};
				});
			},

			setEnabled: (enabled) => {
				set((state) => ({
					isEnabled: enabled,
					reduceAnimations: enabled,
					lowQualityImages: enabled,
					noVideoPreviews: enabled,
					noAutoPlay: enabled,
					textOnlyPDFs: enabled,
					effectiveMode: calculateEffectiveMode({ ...state, isEnabled: enabled }),
				}));
			},

			setConnectionType: (type) => {
				set((state) => ({
					connectionType: type,
					effectiveMode: calculateEffectiveMode({ ...state, connectionType: type }),
				}));
			},

			applyOptimizations: () => {
				const state = get();
				const effective = state.effectiveMode;

				if (effective === 'minimal') {
					document.documentElement.classList.add(
						'low-data-mode',
						'reduced-motion',
						'no-animations'
					);
					document.documentElement.classList.remove('medium-data-mode');
				} else if (effective === 'medium') {
					document.documentElement.classList.add('medium-data-mode', 'reduced-motion');
					document.documentElement.classList.remove('low-data-mode', 'no-animations');
				} else {
					document.documentElement.classList.remove(
						'low-data-mode',
						'medium-data-mode',
						'reduced-motion',
						'no-animations'
					);
				}
			},
		}),
		{
			name: 'low-data-mode-storage',
			partialize: (state) => ({
				isEnabled: state.isEnabled,
				reduceAnimations: state.reduceAnimations,
				lowQualityImages: state.lowQualityImages,
				noVideoPreviews: state.noVideoPreviews,
				noAutoPlay: state.noAutoPlay,
				textOnlyPDFs: state.textOnlyPDFs,
			}),
		}
	)
);
