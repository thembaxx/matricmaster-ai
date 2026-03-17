'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FocusModeState {
	isEnabled: boolean;
	toggle: () => void;
	enable: () => void;
	disable: () => void;
}

export const useFocusMode = create<FocusModeState>()(
	persist(
		(set) => ({
			isEnabled: false,
			toggle: () => set((state) => ({ isEnabled: !state.isEnabled })),
			enable: () => set({ isEnabled: true }),
			disable: () => set({ isEnabled: false }),
		}),
		{ name: 'focus-mode-storage' }
	)
);
