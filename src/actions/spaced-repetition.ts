'use server';

import {
	getAdaptiveDifficulty,
	recordQuestionAttempt as recordAttempt,
} from '@/services/spacedRepetition';

export async function recordQuestionAttempt(
	questionId: string,
	topic: string,
	isCorrect: boolean,
	responseTimeMs?: number
) {
	'use server';
	await recordAttempt(questionId, topic, isCorrect, responseTimeMs);
}

export async function getAdaptiveDifficultyServer() {
	'use server';
	return getAdaptiveDifficulty();
}
