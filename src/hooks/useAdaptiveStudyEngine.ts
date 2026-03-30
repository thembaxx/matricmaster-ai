'use client';

import { useCallback, useMemo } from 'react';
import { generateEnergyAwareBlocks } from '@/actions/energy-scheduler-bridge';
import { calculateTopicUrgency } from '@/actions/urgency-scorer';
import { applyWellnessProtections } from '@/actions/wellness-protector';
import { useAiContextStore } from '@/stores/useAiContextStore';
import { useEnergyTrackingStore } from '@/stores/useEnergyTrackingStore';
import { useLoadSheddingStore } from '@/stores/useLoadSheddingStore';
import { useSmartSchedulerStore } from '@/stores/useSmartSchedulerStore';
import type { EnergyAwareBlock } from '@/types/energy-schedule';

export function useAdaptiveStudyEngine() {
	const { getWeakTopics, setContext } = useAiContextStore();
	const { currentEnergy, optimalWindows } = useEnergyTrackingStore();
	const { currentStage, schedule: loadSheddingSchedule } = useLoadSheddingStore();
	const { addBlock } = useSmartSchedulerStore();

	const weakTopics = useMemo(() => {
		const topics = getWeakTopics();
		return topics.slice(0, 10);
	}, [getWeakTopics]);

	const generateOptimizedSchedule = useCallback(async () => {
		try {
			// 1. Calculate urgency for weak topics
			const urgencyScores = await Promise.all(
				weakTopics.map(async (w) => {
					return calculateTopicUrgency(w.topic, w.subject);
				})
			);

			// 2. Sort by combined score
			const sorted = [...urgencyScores].sort((a, b) => b.combinedScore - a.combinedScore);

			// 3. Generate energy-aware blocks
			const topicsWithUrgency = sorted.map((u) => ({
				topic: u.topic,
				subject: u.subject,
				urgencyScore: u.combinedScore,
			}));

			const energyBlocks = await generateEnergyAwareBlocks(topicsWithUrgency);

			// 4. Apply wellness protections
			const { burnoutAdjustments, loadSheddingAdjustments, recommendations } =
				await applyWellnessProtections();

			// 5. Combine and return
			return {
				urgencyScores: sorted,
				energyBlocks,
				adjustments: [...burnoutAdjustments, ...loadSheddingAdjustments],
				recommendations,
			};
		} catch (error) {
			console.error('Failed to generate optimized schedule:', error);
			return null;
		}
	}, [weakTopics]);

	const addEnergyAwareBlock = useCallback(
		async (topic: string, subject: string) => {
			const urgency = await calculateTopicUrgency(topic, subject);

			const { optimalWindows: windows } = useEnergyTrackingStore.getState();
			const window = windows[0] ?? { startHour: 9, endHour: 11, energyLevel: 70 };

			const block: EnergyAwareBlock = {
				id: crypto.randomUUID(),
				subject,
				topic,
				date: new Date(),
				startTime: `${String(window.startHour).padStart(2, '0')}:00`,
				endTime: `${String(window.endHour).padStart(2, '0')}:00`,
				duration: 60,
				type: urgency.combinedScore >= 60 ? 'study' : 'review',
				isCompleted: false,
				isAISuggested: true,
				optimalStartHour: window.startHour,
				optimalEndHour: window.endHour,
				energyScore: window.energyLevel,
				urgencyScore: urgency.combinedScore,
				urgencyPriority: urgency.priority,
				loadSheddingRisk: currentStage >= 4,
			};

			addBlock(block);

			setContext({
				type: 'lesson',
				subject,
				topic,
			});

			return block;
		},
		[addBlock, setContext, currentStage]
	);

	const getScheduleWellnessStatus = useCallback(() => {
		const hasLowEnergy = currentEnergy < 40;
		const hasLoadSheddingRisk = currentStage >= 3;

		return {
			currentEnergy,
			currentStage,
			optimalWindowsCount: optimalWindows?.length ?? 0,
			loadSheddingScheduleCount: loadSheddingSchedule?.length ?? 0,
			hasLowEnergy,
			hasLoadSheddingRisk,
			shouldReschedule: hasLowEnergy || hasLoadSheddingRisk,
		};
	}, [currentEnergy, currentStage, optimalWindows, loadSheddingSchedule]);

	const rescheduleForOptimalEnergy = useCallback(async () => {
		await useSmartSchedulerStore.getState().rescheduleForEnergy();
	}, []);

	const rescheduleForLoadShedding = useCallback(async () => {
		await useSmartSchedulerStore.getState().rescheduleForLoadShedding();
	}, []);

	const applyBurnoutProtection = useCallback(async () => {
		await useSmartSchedulerStore.getState().applyBurnoutProtection();
	}, []);

	return {
		weakTopics,
		generateOptimizedSchedule,
		addEnergyAwareBlock,
		getScheduleWellnessStatus,
		rescheduleForOptimalEnergy,
		rescheduleForLoadShedding,
		applyBurnoutProtection,
		currentEnergy,
		currentStage,
		hasLoadSheddingRisk: currentStage >= 3,
		hasLowEnergy: currentEnergy < 40,
	};
}
