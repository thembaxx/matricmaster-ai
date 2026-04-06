'use client';

import { differenceInDays, format } from 'date-fns';
import { create } from 'zustand';
import type { AISuggestion, ExamCountdown, StudyBlock } from '@/types/smart-scheduler';
import { useAdaptiveDifficultyStore } from './useAdaptiveDifficultyStore';
import { useEnergyTrackingStore } from './useEnergyTrackingStore';
import { useLoadSheddingStore } from './useLoadSheddingStore';
import { usePastPaperRecommendationsStore } from './usePastPaperRecommendations';
import { useQuizResultStore } from './useQuizResultStore';
import { useSmartSchedulerStore } from './useSmartSchedulerStore';

export interface UnifiedBlock extends StudyBlock {
	source: 'smart' | 'regular';
	loadSheddingWarning?: boolean;
	energyRecommendation?: 'optimal' | 'moderate' | 'avoid';
	examCountdown?: number;
}

export interface IntegrationState {
	unifiedBlocks: UnifiedBlock[];
	unifiedView: 'combined' | 'smart' | 'regular';
	showLoadSheddingWarnings: boolean;
	showEnergyRecommendations: boolean;
	showExamCountdowns: boolean;
	autoRescheduleEnabled: boolean;
	lastSyncTime: number | null;
	isSyncingToCalendar: boolean;
	calendarSyncResult: { success: boolean; pushedCount: number; errors?: string[] } | null;

	syncUnifiedSchedule: () => Promise<void>;
	syncToCalendar: () => Promise<void>;
	setUnifiedView: (view: 'combined' | 'smart' | 'regular') => void;
	toggleLoadSheddingWarnings: () => void;
	toggleEnergyRecommendations: () => void;
	toggleExamCountdowns: () => void;
	rescheduleForLoadShedding: () => Promise<void>;
	rescheduleForEnergy: () => Promise<void>;
	suggestStudyBlocksFromQuiz: () => Promise<void>;
	getBlocksForDate: (date: Date) => UnifiedBlock[];
	getUpcomingExams: () => ExamCountdown[];
	getNextExamCountdown: () => ExamCountdown | null;
	generateAutoScheduleSuggestions: () => Promise<void>;
}

const calculateExamCountdown = (examDate: Date): number => {
	return differenceInDays(new Date(examDate), new Date());
};

const getEnergyRecommendation = (
	optimalWindows: { startHour: number; endHour: number; energyLevel: number }[],
	blockStartHour: number
): 'optimal' | 'moderate' | 'avoid' => {
	const window = optimalWindows.find(
		(w: { startHour: number; endHour: number; energyLevel: number }) =>
			blockStartHour >= w.startHour && blockStartHour < w.endHour
	);

	if (!window) return 'moderate';

	if (window.energyLevel >= 75) return 'optimal';
	if (window.energyLevel >= 50) return 'moderate';
	return 'avoid';
};

export const useScheduleIntegrationStore = create<IntegrationState>((set, get) => ({
	unifiedBlocks: [],
	unifiedView: 'combined',
	showLoadSheddingWarnings: true,
	showEnergyRecommendations: true,
	showExamCountdowns: true,
	autoRescheduleEnabled: true,
	lastSyncTime: null,
	isSyncingToCalendar: false,
	calendarSyncResult: null,

	syncToCalendar: async () => {
		set({ isSyncingToCalendar: true, calendarSyncResult: null });
		try {
			const response = await fetch('/api/calendar/sync/push', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
			});
			const data = await response.json();
			set({
				calendarSyncResult: {
					success: data.success,
					pushedCount: data.data?.pushedCount ?? 0,
					errors: data.data?.errors,
				},
			});
		} catch (error) {
			set({
				calendarSyncResult: {
					success: false,
					pushedCount: 0,
					errors: [error instanceof Error ? error.message : 'Unknown error'],
				},
			});
		} finally {
			set({ isSyncingToCalendar: false });
		}
	},

	syncUnifiedSchedule: async () => {
		const smartStore = useSmartSchedulerStore.getState();
		const loadSheddingStore = useLoadSheddingStore.getState();
		const energyStore = useEnergyTrackingStore.getState();

		const { blocks: smartBlocks, exams } = smartStore;
		const { currentStage, schedule } = loadSheddingStore;
		const { optimalWindows } = energyStore;

		const unified: UnifiedBlock[] = [];

		for (const block of smartBlocks) {
			const blockDate = new Date(block.date);
			const blockHour = Number.parseInt(block.startTime.split(':')[0], 10);
			const dateStr = format(blockDate, 'yyyy-MM-dd');
			const daySchedule = schedule.find((s) => s.date === dateStr);

			let loadSheddingWarning = false;
			if (currentStage >= 3 && daySchedule) {
				for (const period of daySchedule.stages) {
					const startHour = Number.parseInt(period.start.split(':')[0], 10);
					const endHour = Number.parseInt(period.end.split(':')[0], 10);
					if (blockHour >= startHour && blockHour < endHour) {
						loadSheddingWarning = true;
						break;
					}
				}
			}

			const energyRecommendation = getEnergyRecommendation(optimalWindows, blockHour);

			const matchingExam = exams.find((e) => {
				const examDate = new Date(e.date);
				return (
					format(examDate, 'yyyy-MM-dd') === dateStr || differenceInDays(examDate, blockDate) <= 7
				);
			});

			const examCountdown = matchingExam
				? calculateExamCountdown(new Date(matchingExam.date))
				: undefined;

			unified.push({
				...block,
				source: 'smart',
				loadSheddingWarning,
				energyRecommendation,
				examCountdown,
			});
		}

		unified.sort((a, b) => {
			const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime();
			if (dateCompare !== 0) return dateCompare;
			return a.startTime.localeCompare(b.startTime);
		});

		set({ unifiedBlocks: unified, lastSyncTime: Date.now() });
	},

	setUnifiedView: (view) => set({ unifiedView: view }),

	toggleLoadSheddingWarnings: () =>
		set((state) => ({ showLoadSheddingWarnings: !state.showLoadSheddingWarnings })),

	toggleEnergyRecommendations: () =>
		set((state) => ({ showEnergyRecommendations: !state.showEnergyRecommendations })),

	toggleExamCountdowns: () => set((state) => ({ showExamCountdowns: !state.showExamCountdowns })),

	rescheduleForLoadShedding: async () => {
		const smartStore = useSmartSchedulerStore.getState();
		await smartStore.rescheduleForLoadShedding();
		await get().syncUnifiedSchedule();
	},

	rescheduleForEnergy: async () => {
		const smartStore = useSmartSchedulerStore.getState();
		await smartStore.rescheduleForEnergy();
		await get().syncUnifiedSchedule();
	},

	suggestStudyBlocksFromQuiz: async () => {
		const quizStore = useQuizResultStore.getState();
		const difficultyStore = useAdaptiveDifficultyStore.getState();
		const pastPaperStore = usePastPaperRecommendationsStore.getState();
		const smartStore = useSmartSchedulerStore.getState();

		const mistakes = quizStore.getLastMistakes();
		const currentDifficulty = difficultyStore.currentDifficulty;

		if (mistakes.length === 0) return;

		const weakAreas = pastPaperStore.weakAreas;
		const suggestions: AISuggestion[] = [];

		mistakes.forEach((mistake, index) => {
			const priorityArea = weakAreas.find(
				(w) => w.topic === mistake.topic && w.subject === mistake.subject
			);

			const daysUntilDue = priorityArea
				? Math.max(
						1,
						14 -
							Math.floor(
								(Date.now() - new Date(priorityArea.lastMistakeDate).getTime()) /
									(1000 * 60 * 60 * 24)
							)
					)
				: 7;

			const suggestedDate = new Date();
			suggestedDate.setDate(suggestedDate.getDate() + index + 1);

			const suggestedStartHour =
				currentDifficulty === 'beginner'
					? 9
					: currentDifficulty === 'easy'
						? 10
						: currentDifficulty === 'medium'
							? 14
							: 16;

			suggestions.push({
				id: `quiz-suggestion-${mistake.questionId}-${Date.now()}`,
				type: 'add',
				block: {
					subject: mistake.subject,
					topic: mistake.topic,
					date: suggestedDate,
					startTime: `${suggestedStartHour.toString().padStart(2, '0')}:00`,
					endTime: `${(suggestedStartHour + 1).toString().padStart(2, '0')}:00`,
					duration: 60,
					type: 'study',
					isCompleted: false,
					isAISuggested: true,
				},
				reason: `Weak area identified from quiz mistakes - ${mistake.topic}. Recommended within ${daysUntilDue} days.`,
				confidence: priorityArea ? Math.min(0.9, priorityArea.priorityScore / 100) : 0.6,
			});
		});

		smartStore.setSuggestions([...smartStore.suggestions, ...suggestions]);
	},

	getBlocksForDate: (date: Date) => {
		const { unifiedBlocks, unifiedView } = get();
		const dateStr = format(date, 'yyyy-MM-dd');

		if (unifiedView === 'combined') {
			return unifiedBlocks.filter((b) => format(new Date(b.date), 'yyyy-MM-dd') === dateStr);
		}

		return unifiedBlocks.filter(
			(b) => b.source === unifiedView && format(new Date(b.date), 'yyyy-MM-dd') === dateStr
		);
	},

	getUpcomingExams: () => {
		const smartStore = useSmartSchedulerStore.getState();
		return smartStore.exams;
	},

	getNextExamCountdown: () => {
		const exams = get().getUpcomingExams();
		if (exams.length === 0) return null;

		const sorted = [...exams].sort(
			(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
		);

		return sorted[0];
	},

	generateAutoScheduleSuggestions: async () => {
		const pastPaperStore = usePastPaperRecommendationsStore.getState();
		const smartStore = useSmartSchedulerStore.getState();

		const weakAreas = pastPaperStore.weakAreas.filter((w) => w.priorityScore > 20);
		const suggestions: AISuggestion[] = [];

		weakAreas.slice(0, 5).forEach((area, index) => {
			const suggestedDate = new Date();
			suggestedDate.setDate(suggestedDate.getDate() + (index + 1) * 2);

			const suggestedStartHour = 9 + index * 2;

			suggestions.push({
				id: `auto-suggestion-${area.topic.replace(/\s+/g, '-')}-${Date.now()}`,
				type: 'add',
				block: {
					subject: area.subject,
					topic: area.topic,
					date: suggestedDate,
					startTime: `${Math.min(suggestedStartHour, 19).toString().padStart(2, '0')}:00`,
					endTime: `${Math.min(suggestedStartHour + 1, 20)
						.toString()
						.padStart(2, '0')}:00`,
					duration: 60,
					type: 'study',
					isCompleted: false,
					isAISuggested: true,
				},
				reason: `High priority weak area: ${area.topic} (${area.mistakeCount} mistakes)`,
				confidence: Math.min(0.9, area.priorityScore / 100),
			});
		});

		smartStore.setSuggestions([...smartStore.suggestions, ...suggestions]);
	},
}));
