'use client';

import { useCallback, useState } from 'react';
import { useGamification } from '@/components/Gamification';
import { updateUserScore } from '@/lib/db/leaderboard-actions';
import { recordStudySession } from '@/lib/db/progress-actions';

export interface QuizCompletionData {
	correctAnswers: number;
	totalQuestions: number;
	durationMinutes: number;
	difficulty: 'easy' | 'medium' | 'hard';
	subjectId?: number;
	topic?: string;
	sessionType?: 'practice' | 'test' | 'past_paper';
}

export interface QuizCompletionResult {
	success: boolean;
	pointsEarned: number;
	newTotal: number;
	newAchievements: string[];
}

export function useQuizCompletion() {
	const [isCompleting, setIsCompleting] = useState(false);
	const { checkAchievements } = useGamification();

	const completeQuiz = useCallback(
		async (data: QuizCompletionData): Promise<QuizCompletionResult> => {
			setIsCompleting(true);

			try {
				const [progressResult, scoreResult] = await Promise.all([
					recordStudySession({
						subjectId: data.subjectId,
						topic: data.topic,
						questionsAttempted: data.totalQuestions,
						correctAnswers: data.correctAnswers,
						marksEarned: data.correctAnswers * 2,
						durationMinutes: data.durationMinutes,
						sessionType: data.sessionType || 'practice',
					}),
					updateUserScore({
						correctAnswers: data.correctAnswers,
						totalQuestions: data.totalQuestions,
						durationMinutes: data.durationMinutes,
						difficulty: data.difficulty,
						subjectId: data.subjectId,
					}),
				]);

				const newAchievements = await checkAchievements();

				return {
					success: progressResult.success,
					pointsEarned: scoreResult.pointsEarned,
					newTotal: scoreResult.newTotal,
					newAchievements: newAchievements.map((a) => a.id),
				};
			} catch (error) {
				console.error('[useQuizCompletion] Error completing quiz:', error);
				return {
					success: false,
					pointsEarned: 0,
					newTotal: 0,
					newAchievements: [],
				};
			} finally {
				setIsCompleting(false);
			}
		},
		[checkAchievements]
	);

	return {
		completeQuiz,
		isCompleting,
	};
}
