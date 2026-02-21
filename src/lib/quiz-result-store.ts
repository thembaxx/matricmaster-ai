import type { QuizResult } from '@/types/quiz';

let currentResult: QuizResult | null = null;

export function saveQuizResult(result: QuizResult): void {
	currentResult = result;
}

export function getQuizResult(): QuizResult | null {
	return currentResult;
}

export function clearQuizResult(): void {
	currentResult = null;
}

export function hasQuizResult(): boolean {
	return currentResult !== null;
}
