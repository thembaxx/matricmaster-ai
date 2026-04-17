'use server';

import { getAuth } from '@/lib/auth';
import {
	type QuizAnswerInput,
	type QuizResultInput,
	saveQuizResultWithMistakes,
} from '@/lib/db/quiz-results-actions';
import { getPendingQuizzes, markQuizSynced } from '@/lib/sync/offline-quiz-store';

interface SyncResult {
	id: string;
	status: 'synced' | 'failed';
	error?: string;
}

export async function syncOfflineQuizzes(): Promise<{
	synced: number;
	failed: number;
	results: SyncResult[];
}> {
	const auth = await getAuth();
	const session = await auth.api.getSession();

	if (!session?.user) {
		return { synced: 0, failed: 0, results: [] };
	}

	const userId = session.user.id;
	const pending = await getPendingQuizzes();
	const userPending = pending.filter((q) => q.userId === userId);

	const results: SyncResult[] = [];

	for (const quiz of userPending) {
		try {
			const answers: QuizAnswerInput[] = quiz.answers.map((a) => ({
				questionId: a.questionId,
				questionText: '',
				selectedOption: a.selectedOption,
				correctOption: null,
				isCorrect: a.isCorrect,
			}));

			const resultInput: QuizResultInput = {
				userId: quiz.userId,
				quizId: quiz.quizId,
				subjectId: quiz.subjectId,
				topic: quiz.topic,
				score: quiz.score,
				totalQuestions: quiz.totalQuestions,
				percentage: quiz.percentage,
				timeTaken: quiz.timeTaken,
				answers,
				completedAt: quiz.completedAt,
			};

			await saveQuizResultWithMistakes(resultInput);
			await markQuizSynced(quiz.id);
			results.push({ id: quiz.id, status: 'synced' });
		} catch (error) {
			results.push({ id: quiz.id, status: 'failed', error: String(error) });
		}
	}

	return {
		synced: results.filter((r) => r.status === 'synced').length,
		failed: results.filter((r) => r.status === 'failed').length,
		results,
	};
}
