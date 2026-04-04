import { create } from 'zustand';

export interface EnergyPattern {
	hour: number;
	averageEnergy: number;
	sampleSize: number;
}

export interface OptimalWindow {
	startHour: number;
	endHour: number;
	energyLevel: number;
}

export interface DayEnergy {
	date: string;
	avgEnergy: number;
}

export interface EnergyRecommendation {
	optimalTimes: string[];
	warnings: string[];
	insights: string[];
}

interface EnergyTrackingState {
	currentEnergy: number;
	energyHistory: DayEnergy[];
	patterns: EnergyPattern[];
	optimalWindows: OptimalWindow[];
	recommendations: EnergyRecommendation | null;
	isLoading: boolean;
	trend: 'improving' | 'declining' | 'stable';

	setCurrentEnergy: (energy: number) => void;
	setEnergyHistory: (history: DayEnergy[]) => void;
	setPatterns: (patterns: EnergyPattern[]) => void;
	setOptimalWindows: (windows: OptimalWindow[]) => void;
	setRecommendations: (recs: EnergyRecommendation) => void;
	setLoading: (loading: boolean) => void;
	setTrend: (trend: 'improving' | 'declining' | 'stable') => void;

	fetchEnergyData: () => Promise<void>;
	trackSession: (session: {
		date: Date;
		startTime: string;
		endTime: string;
		correctAnswers: number;
		totalQuestions: number;
		durationMinutes: number;
	}) => Promise<{ id: string; energyLevel: number }>;
}

export const useEnergyTrackingStore = create<EnergyTrackingState>((set, get) => ({
	currentEnergy: 70,
	energyHistory: [],
	patterns: [],
	optimalWindows: [],
	recommendations: null,
	isLoading: false,
	trend: 'stable',

	setCurrentEnergy: (energy) => set({ currentEnergy: energy }),
	setEnergyHistory: (history) => set({ energyHistory: history }),
	setPatterns: (patterns) => set({ patterns }),
	setOptimalWindows: (windows) => set({ optimalWindows: windows }),
	setRecommendations: (recs) => set({ recommendations: recs }),
	setLoading: (loading) => set({ isLoading: loading }),
	setTrend: (trend) => set({ trend }),

	fetchEnergyData: async () => {
		set({ isLoading: true });
		try {
			const [historyRes, patternsRes, recsRes] = await Promise.all([
				fetch('/api/energy/pattern?type=history'),
				fetch('/api/energy/pattern?type=weekly'),
				fetch('/api/energy/recommendations'),
			]);

			const [historyData, patternsData, recsData] = await Promise.all([
				historyRes.json(),
				patternsRes.json(),
				recsRes.json(),
			]);

			const windowsData = recsData;

			set({
				energyHistory: historyData.history || [],
				patterns: patternsData.patterns || [],
				optimalWindows: windowsData.windows || [],
				recommendations: recsData.recommendations || null,
			});

			const currentHour = new Date().getHours();
			const currentPattern = patternsData.patterns?.find(
				(p: EnergyPattern) => p.hour === currentHour
			);
			if (currentPattern) {
				set({ currentEnergy: Math.round(currentPattern.averageEnergy) });
			}

			if (historyData.history && historyData.history.length >= 3) {
				const recent = historyData.history.slice(-3);
				const trendDiff = recent[recent.length - 1].avgEnergy - recent[0].avgEnergy;
				if (trendDiff > 5) {
					set({ trend: 'improving' });
				} else if (trendDiff < -5) {
					set({ trend: 'declining' });
				} else {
					set({ trend: 'stable' });
				}
			}
		} catch (error) {
			console.error('Failed to fetch energy data:', error);
		} finally {
			set({ isLoading: false });
		}
	},

	trackSession: async (session) => {
		const response = await fetch('/api/energy/track', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(session),
		});

		if (!response.ok) {
			throw new Error('Failed to track session');
		}

		const data = await response.json();
		set({ currentEnergy: data.energyLevel });
		get().fetchEnergyData();
		return data;
	},
}));
