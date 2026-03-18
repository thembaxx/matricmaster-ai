import type { QuizAnswer, QuizResult } from '@/types/quiz';
import type { QuizQuestion, SelectedAnswer } from './use-quiz-state';

export interface QuizResultData {
	correctAnswers: number;
	totalQuestions: number;
	durationSeconds: number;
	accuracy: number;
	isPassed: boolean;
	scorePercentage: number;
}

export interface QuizMistake {
	topic: string;
	questionId: string;
	question: string;
	selectedAnswer: string;
	correctAnswer: string;
}

export interface QuizResultsReturn {
	result: QuizResultData;
	mistakes: QuizMistake[];
	formattedDuration: string;
	grade: string;
	performanceMessage: string;
	toQuizResult: (metadata: Partial<QuizResultMetadata>) => QuizResult;
}

export interface QuizResultMetadata {
	subjectId: number;
	subjectName: string;
	topic: string;
	difficulty: 'easy' | 'medium' | 'hard';
}

export interface UseQuizResultsOptions {
	answers: Map<string, SelectedAnswer>;
	questions: QuizQuestion[];
	durationSeconds: number;
	passingThreshold?: number;
}

export function useQuizResults({
	answers,
	questions,
	durationSeconds,
	passingThreshold = 60,
}: UseQuizResultsOptions): QuizResultsReturn {
	const correctAnswers = Array.from(answers.values()).filter((a) => a.isCorrect === true).length;
	const totalQuestions = questions.length;
	const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
	const isPassed = accuracy >= passingThreshold;

	const mistakes: QuizMistake[] = questions
		.filter((q) => {
			const answer = answers.get(q.id);
			return answer?.isCorrect === false;
		})
		.map((q) => {
			const answer = answers.get(q.id);
			const selectedOption = q.options.find((o) => o.id === answer?.selectedOption);
			const correctOption = q.options.find((o) => o.id === q.correctAnswer);

			return {
				topic: q.topic,
				questionId: q.id,
				question: q.question,
				selectedAnswer: selectedOption?.text ?? 'No answer',
				correctAnswer: correctOption?.text ?? q.correctAnswer,
			};
		});

	const formatDuration = (seconds: number): string => {
		if (seconds < 60) return `${seconds}s`;
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
	};

	const getGrade = (percentage: number): string => {
		if (percentage >= 90) return 'A';
		if (percentage >= 80) return 'B';
		if (percentage >= 70) return 'C';
		if (percentage >= 60) return 'D';
		if (percentage >= 50) return 'E';
		return 'F';
	};

	const getPerformanceMessage = (percentage: number): string => {
		if (percentage >= 90) return 'Outstanding! You have mastered this material!';
		if (percentage >= 80) return 'Excellent work! Keep up the great performance!';
		if (percentage >= 70) return 'Good job! You have a solid understanding.';
		if (percentage >= 60) return 'Nice work! You passed the quiz.';
		if (percentage >= 50) return 'You are close! A bit more practice will help.';
		if (percentage >= 40) return 'Keep practicing! You are making progress.';
		return 'Do not give up! Review the material and try again.';
	};

	const toQuizResult = (metadata: Partial<QuizResultMetadata>): QuizResult => ({
		correctAnswers,
		totalQuestions,
		durationSeconds,
		accuracy,
		subjectId: metadata.subjectId,
		subjectName: metadata.subjectName ?? '',
		difficulty: metadata.difficulty ?? 'medium',
		topic: metadata.topic,
		completedAt: new Date(),
	});

	return {
		result: {
			correctAnswers,
			totalQuestions,
			durationSeconds,
			accuracy,
			isPassed,
			scorePercentage: accuracy,
		},
		mistakes,
		formattedDuration: formatDuration(durationSeconds),
		grade: getGrade(accuracy),
		performanceMessage: getPerformanceMessage(accuracy),
		toQuizResult,
	};
}

export function calculateAccuracy(correct: number, total: number): number {
	if (total === 0) return 0;
	return Math.round((correct / total) * 100);
}

export function calculateTimeStats(
	elapsedSeconds: number,
	averageTimePerQuestion: number
): { estimatedTotal: number; timePerQuestion: number; isWithinTime: boolean } {
	const timePerQuestion = elapsedSeconds / Math.max(1, averageTimePerQuestion);
	const typicalQuizTime = averageTimePerQuestion * 10;
	const isWithinTime = elapsedSeconds <= typicalQuizTime;

	return {
		estimatedTotal: typicalQuizTime,
		timePerQuestion,
		isWithinTime,
	};
}

export function getQuizAnswers(answers: Map<string, SelectedAnswer>): QuizAnswer[] {
	return Array.from(answers.entries())
		.filter(([, answer]) => answer.selectedOption !== null)
		.map(([questionId, answer]) => ({
			questionId,
			selectedOption: answer.selectedOption!,
			isCorrect: answer.isCorrect ?? false,
			timeSpentSeconds: 0,
		}));
}
