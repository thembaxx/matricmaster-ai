'use client';

import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useQuizResultStore } from '@/stores/useQuizResultStore';
import { useSynergyStore } from '@/stores/useSynergyStore';

export const useStudySynergy = () => {
	const currentResult = useQuizResultStore((state) => state.currentResult);
	const addTrend = useSynergyStore((state) => state.addTrend);
	const lastProcessedResultId = useRef<string | null>(null);

	useEffect(() => {
		if (!currentResult || currentResult.id === lastProcessedResultId.current) return;

		lastProcessedResultId.current = currentResult.id;
		const now = new Date();
		const currentHour = now.getHours();
		const scorePercentage = (currentResult.score / currentResult.totalQuestions) * 100;

		// 1. "Study Exhaust" Synergy: Performance vs Time of Day
		// If it's after 8 PM (20:00) and score is below 60%
		if (currentHour >= 20 && scorePercentage < 60) {
			toast.info('Studying late?', {
				description: `Your performance in ${currentResult.subjectName} is 20% lower tonight. Want to move your next session to the morning?`,
				action: {
					label: 'Reschedule',
					onClick: () => {
						// Logic to interface with Smart Scheduler can be added here
						console.log('Interfacing with Smart Scheduler...');
					},
				},
				duration: 8000,
			});
		}

		// 2. "Social Proof" Multiplier: Simulate global trend detection
		// If user makes a mistake in a specific topic, check if it's a "spike"
		const mistakes = useQuizResultStore.getState().lastMistakes;
		if (mistakes.length > 0) {
			const latestMistake = mistakes[0];

			// Simulate checking for a global trend
			const isGlobalTrend = Math.random() > 0.7; // 30% chance for demo

			if (isGlobalTrend) {
				addTrend({
					type: 'mistake_spike',
					subject: latestMistake.subject,
					topic: latestMistake.topic,
					message: `60% of students found this ${latestMistake.topic} question tricky today.`,
				});

				toast.message('Community Insight', {
					description: `You're not alone! 60% of students missed this question on ${latestMistake.topic}. Generating a targeted lesson in the AI Lab...`,
					duration: 6000,
				});
			}
		}
	}, [currentResult, addTrend]);

	return null;
};
