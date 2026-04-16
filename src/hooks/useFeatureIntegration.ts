import { useEffect } from 'react';
import { eventBus } from '@/lib/event-bus';
import { useQuizCompletion } from '@/hooks/use-quiz-completion';
import { useQuizResultStore } from '@/stores/useQuizResultStore';

export function useFeatureIntegration() {
	const { completeQuiz } = useQuizCompletion();
	const addMistake = useQuizResultStore((s) => s.addMistake);

	useEffect(() => {
		// Handle quiz completion integration
		const unsubscribe = eventBus.subscribe('QUIZ_COMPLETED', async (payload) => {
			const { subject, score, totalQuestions, weakAreas } = payload;

			// 1. Progress Tracking
			try {
				await completeQuiz({
					subjectId: 1, // Mock subject ID
					topic: 'Quiz Session',
					totalQuestions,
					correctAnswers: score,
					marksEarned: score * 10,
					durationMinutes: 1, // Mock duration
					difficulty: 'medium',
					sessionType: 'practice',
				});
			} catch (error) {
				console.error('Failed to complete quiz integration:', error);
			}

			// 2. Mistake Store
			for (const area of weakAreas) {
				addMistake({
					questionId: 'mistake-' + Date.now(),
					topic: area,
					subject,
				});
			}

			// 3. Gamification (XP)
			eventBus.publish('XP_EARNED', {
				amount: score * 10,
				source: 'quiz_completed',
			});
		});

		return unsubscribe;
	}, [completeQuiz, addMistake]);
}
