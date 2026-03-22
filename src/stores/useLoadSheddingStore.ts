'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface LoadSheddingSchedule {
	date: string;
	stages: { stage: number; start: string; end: string }[];
}

export interface AreaInfo {
	name: string;
	region: string;
	schedule: LoadSheddingSchedule[];
}

interface LoadSheddingStore {
	currentStage: number;
	isAvailable: boolean;
	lastUpdated: number | null;
	selectedArea: string | null;
	userPreferences: {
		autoReschedule: boolean;
		notifyBefore: number;
		offlineTasks: string[];
		onlineTasks: string[];
	};
	schedule: LoadSheddingSchedule[];
	fetchSchedule: (areaId?: string) => Promise<void>;
	getAffectedBlocks: (
		blocks: { id?: string; date: string; startTime: string; endTime: string; type: string }[]
	) => string[];
	rescheduleForLoadShedding: (
		blocks: { id: string; date: string; startTime: string; endTime: string; type: string }[]
	) => { id: string; newDate: string; newStartTime: string; reason: string }[];
	setSelectedArea: (area: string) => void;
	setPreferences: (prefs: Partial<LoadSheddingStore['userPreferences']>) => void;
}

const STAGE_IMPACT: Record<number, { online: string[]; offline: string[] }> = {
	0: { online: [], offline: [] },
	1: { online: [], offline: [] },
	2: { online: [], offline: [] },
	3: {
		online: ['video-calls', 'ai-tutor', 'live-lessons'],
		offline: ['flashcards', 'quizzes', 'past-papers'],
	},
	4: {
		online: ['video-calls', 'ai-tutor', 'live-lessons', 'voice-tutor'],
		offline: ['flashcards', 'quizzes', 'past-papers', 'study-path'],
	},
	5: {
		online: ['video-calls', 'ai-tutor', 'live-lessons', 'voice-tutor', 'video-content'],
		offline: ['flashcards', 'quizzes', 'study-path', 'notes'],
	},
	6: {
		online: [
			'video-calls',
			'ai-tutor',
			'live-lessons',
			'voice-tutor',
			'video-content',
			'past-papers',
		],
		offline: ['flashcards', 'quizzes', 'study-path', 'notes', 'calendar'],
	},
};

export const useLoadSheddingStore = create<LoadSheddingStore>()(
	persist(
		(set, get) => ({
			currentStage: 0,
			isAvailable: true,
			lastUpdated: null,
			selectedArea: null,
			schedule: [],

			userPreferences: {
				autoReschedule: true,
				notifyBefore: 30,
				offlineTasks: ['flashcards', 'quizzes', 'past-papers', 'study-path', 'notes'],
				onlineTasks: ['video-calls', 'ai-tutor', 'live-lessons', 'voice-tutor'],
			},

			fetchSchedule: async (areaId?: string) => {
				const area = areaId || get().selectedArea;

				try {
					const response = await fetch(`/api/load-shedding?area=${area || 'default'}`);
					const data = await response.json();

					if (data.stage !== undefined) {
						set({
							currentStage: data.stage,
							schedule: data.schedule || [],
							lastUpdated: Date.now(),
							isAvailable: true,
						});
					}
				} catch (error) {
					console.debug('Load shedding fetch failed:', error);
					set({ isAvailable: false });
				}
			},

			getAffectedBlocks: (blocks) => {
				const { currentStage, schedule } = get();
				if (currentStage < 3) return [];

				const affected: string[] = [];
				const impact = STAGE_IMPACT[currentStage] || STAGE_IMPACT[3];

				for (const block of blocks) {
					const blockDate = new Date(block.date).toISOString().split('T')[0];
					const daySchedule = schedule.find((s) => s.date === blockDate);

					if (daySchedule) {
						const blockHour = Number.parseInt(block.startTime.split(':')[0], 10);
						for (const period of daySchedule.stages) {
							const startHour = Number.parseInt(period.start.split(':')[0], 10);
							const endHour = Number.parseInt(period.end.split(':')[0], 10);

							if (blockHour >= startHour && blockHour < endHour) {
								if (impact.online.includes(block.type) && block.id) {
									affected.push(block.id);
								}
							}
						}
					}
				}

				return affected;
			},

			rescheduleForLoadShedding: (blocks) => {
				const { currentStage, userPreferences } = get();
				if (currentStage < 3 || !userPreferences.autoReschedule) return [];

				const rescheduled: { id: string; newDate: string; newStartTime: string; reason: string }[] =
					[];
				const impact = STAGE_IMPACT[currentStage];

				for (const block of blocks) {
					if (impact.online.includes(block.type)) {
						const originalDate = new Date(block.date);
						const newDate = new Date(originalDate);
						newDate.setDate(newDate.getDate() - 1);

						const newStartHour = Number.parseInt(block.startTime.split(':')[0], 10);
						const newStartTime = `${String(Math.max(6, newStartHour - 2)).padStart(2, '0')}:00`;

						rescheduled.push({
							id: block.id,
							newDate: newDate.toISOString().split('T')[0],
							newStartTime,
							reason: `Load shedding stage ${currentStage} - moved to earlier slot`,
						});
					}
				}

				return rescheduled;
			},

			setSelectedArea: (area) => {
				set({ selectedArea: area });
				get().fetchSchedule(area);
			},

			setPreferences: (prefs) => {
				set((state) => ({
					userPreferences: { ...state.userPreferences, ...prefs },
				}));
			},
		}),
		{
			name: 'load-shedding-storage',
			partialize: (state) => ({
				selectedArea: state.selectedArea,
				userPreferences: state.userPreferences,
				currentStage: state.currentStage,
			}),
		}
	)
);
