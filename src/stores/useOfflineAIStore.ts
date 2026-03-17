'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { webllmEngine } from '@/lib/webllm/engine';

interface OfflineAIState {
	isModelReady: boolean;
	downloadProgress: number;
	isOffline: boolean;
	initialize: () => Promise<void>;
	setOnlineStatus: (isOnline: boolean) => void;
}

export const useOfflineAIStore = create<OfflineAIState>()(
	persist(
		(set) => ({
			isModelReady: false,
			downloadProgress: 0,
			isOffline: false,

			initialize: async () => {
				try {
					await webllmEngine.initialize((progress) => {
						set({ downloadProgress: progress });
					});
					set({ isModelReady: true, downloadProgress: 100 });
				} catch (error) {
					console.debug('WebLLM init failed:', error);
					set({ downloadProgress: 0 });
				}
			},

			setOnlineStatus: (isOnline: boolean) => {
				set({ isOffline: !isOnline });
			},
		}),
		{
			name: 'offline-ai-store',
			partialize: (state) => ({ isModelReady: state.isModelReady }),
		}
	)
);
