'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { appConfig } from '@/app.config';

interface ZModeState {
	isZMode: boolean;
	toggleZMode: () => void;
	setZMode: (value: boolean) => void;
}

export const useZModeStore = create<ZModeState>()(
	persist(
		(set) => ({
			isZMode: false,

			toggleZMode: () => set((state) => ({ isZMode: !state.isZMode })),

			setZMode: (value: boolean) => set({ isZMode: value }),
		}),
		{
			name: `${appConfig.name}-zmode`,
		}
	)
);
