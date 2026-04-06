import { checkTokenBudget, getAvailableModel, recordTokenUsage } from '@/lib/ai-config';
import {
	generateAnswerExplanationAction,
	generateEssayFeedbackAction,
	generateMathSolutionAction,
	generateQuestionsAction,
	generateStudyPlanAction,
	getExplanationAction,
	smartSearchAction,
} from './aiActions';

// Request queue for rate limiting
class RequestQueue {
	private queue: Array<() => Promise<any>> = [];
	private processing = false;

	async add<T>(fn: () => Promise<T>): Promise<T> {
		return new Promise((resolve, reject) => {
			this.queue.push(async () => {
				try {
					const result = await fn();
					resolve(result);
				} catch (error) {
					reject(error);
				}
			});
			this.process();
		});
	}

	private async process() {
		if (this.processing || this.queue.length === 0) return;
		this.processing = true;

		while (this.queue.length > 0) {
			const task = this.queue.shift();
			if (task) {
				await task();
			}
		}

		this.processing = false;
	}
}

const requestQueue = new RequestQueue();

// Exponential backoff retry utility
async function retryWithBackoff<T>(
	fn: () => Promise<T>,
	maxRetries = 3,
	baseDelay = 1000
): Promise<T> {
	let lastError: Error;

	for (let attempt = 0; attempt < maxRetries; attempt++) {
		try {
			return await fn();
		} catch (error) {
			lastError = error instanceof Error ? error : new Error(String(error));

			// Only retry on rate limit or network errors
			const isRateLimit =
				lastError.message.toLowerCase().includes('rate limit') ||
				lastError.message.toLowerCase().includes('too many requests') ||
				lastError.message.includes('429') ||
				lastError.message.includes('RESOURCE_EXHAUSTED');

			const isNetworkError =
				lastError.message.toLowerCase().includes('network') ||
				lastError.message.toLowerCase().includes('timeout') ||
				lastError.message.toLowerCase().includes('fetch') ||
				lastError.message.includes('500') ||
				lastError.message.includes('503');

			if (!isRateLimit && !isNetworkError) {
				throw lastError;
			}

			if (attempt === maxRetries - 1) {
				throw lastError;
			}

			const delay = baseDelay * 2 ** attempt;
			await new Promise((resolve) => setTimeout(resolve, delay));
		}
	}

	throw lastError!;
}

export const getExplanation = async (
	subject: string,
	topic: string,
	userProfile?: import('@/types/learning-profile').UserLearningProfile
) => {
	return requestQueue.add(() =>
		retryWithBackoff(async () => {
			await getAvailableModel('moderate');
			if (!checkTokenBudget(10000)) throw new Error('Token budget exceeded');
			const result = await getExplanationAction(subject, topic, userProfile);
			recordTokenUsage(10000);
			return result;
		})
	);
};

export const generateStudyPlan = async (subjects: string[], hours: number) => {
	return requestQueue.add(() =>
		retryWithBackoff(async () => {
			await getAvailableModel('complex');
			if (!checkTokenBudget(30000)) throw new Error('Token budget exceeded');
			const result = await generateStudyPlanAction(subjects, hours);
			recordTokenUsage(30000);
			return result;
		})
	);
};

export const smartSearch = async (query: string) => {
	return requestQueue.add(() =>
		retryWithBackoff(async () => {
			await getAvailableModel('simple');
			if (!checkTokenBudget(5000)) throw new Error('Token budget exceeded');
			const result = await smartSearchAction(query);
			recordTokenUsage(5000);
			return result;
		})
	);
};

export const generateQuestions = async (
	subject: string,
	topic: string,
	difficulty?: 'easy' | 'medium' | 'hard',
	questionType?: 'multiple_choice' | 'true_false' | 'short_answer',
	count?: number,
	userProfile?: import('@/types/learning-profile').UserLearningProfile
) => {
	return requestQueue.add(() =>
		retryWithBackoff(async () => {
			await getAvailableModel('moderate');
			if (!checkTokenBudget(15000)) throw new Error('Token budget exceeded');
			const result = await generateQuestionsAction(
				subject,
				topic,
				difficulty,
				questionType,
				count,
				userProfile
			);
			recordTokenUsage(15000);
			return result;
		})
	);
};

export const generateMathSolution = async (subject: string, topic: string, problem: string) => {
	return requestQueue.add(() =>
		retryWithBackoff(async () => {
			await getAvailableModel('complex');
			if (!checkTokenBudget(25000)) throw new Error('Token budget exceeded');
			const result = await generateMathSolutionAction(subject, topic, problem);
			recordTokenUsage(25000);
			return result;
		})
	);
};

export const generateEssayFeedback = async (
	essayTopic: string,
	essayContent: string,
	wordCount?: number
) => {
	return requestQueue.add(() =>
		retryWithBackoff(async () => {
			await getAvailableModel('creative');
			if (!checkTokenBudget(40000)) throw new Error('Token budget exceeded');
			const result = await generateEssayFeedbackAction(essayTopic, essayContent, wordCount);
			recordTokenUsage(40000);
			return result;
		})
	);
};

export const quickAnswer = async (question: string) => {
	return requestQueue.add(() =>
		retryWithBackoff(async () => {
			await getAvailableModel('simple');
			if (!checkTokenBudget(3000)) throw new Error('Token budget exceeded');
			const result = await smartSearchAction(question);
			recordTokenUsage(3000);
			return result;
		})
	);
};

export const generateAnswerExplanation = async (
	question: string,
	correctAnswer: string,
	userAnswer: string,
	subject: string,
	topic: string
) => {
	return requestQueue.add(() =>
		retryWithBackoff(async () => {
			await getAvailableModel('moderate');
			if (!checkTokenBudget(8000)) throw new Error('Token budget exceeded');
			const result = await generateAnswerExplanationAction(
				question,
				correctAnswer,
				userAnswer,
				subject,
				topic
			);
			recordTokenUsage(8000);
			return result;
		})
	);
};

export type { EssayFeedback, GeneratedQuestion, MathStep } from './aiActions';
