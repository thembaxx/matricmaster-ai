import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface GlobalTrend {
	id: string;
	type: 'mistake_spike' | 'performance_dip' | 'learning_burst';
	subject: string;
	topic: string;
	message: string;
	timestamp: number;
}

interface SynergyState {
	globalTrends: GlobalTrend[];
	multiplierActive: boolean;
	addTrend: (trend: Omit<GlobalTrend, 'id' | 'timestamp'>) => void;
	clearTrends: () => void;
	setMultiplierActive: (active: boolean) => void;
}

export const useSynergyStore = create<SynergyState>()(
	persist(
		(set) => ({
			globalTrends: [],
			multiplierActive: false,

			addTrend: (trend) => {
				const newTrend = {
					...trend,
					id: Math.random().toString(36).substring(7),
					timestamp: Date.now(),
				};
				set((state) => ({
					globalTrends: [newTrend, ...state.globalTrends].slice(0, 5),
				}));
			},

			clearTrends: () => set({ globalTrends: [] }),

			setMultiplierActive: (active) => set({ multiplierActive: active }),
		}),
		{
			name: 'matricmaster-synergy-store',
		}
	)
);
