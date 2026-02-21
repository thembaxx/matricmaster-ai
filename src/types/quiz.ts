export interface QuizResult {
	correctAnswers: number;
	totalQuestions: number;
	durationSeconds: number;
	accuracy: number;
	subjectId?: number;
	subjectName: string;
	difficulty: 'easy' | 'medium' | 'hard';
	topic?: string;
	completedAt: Date;
}

export interface QuizAnswer {
	questionId: string;
	selectedOption: string;
	isCorrect: boolean;
	timeSpentSeconds: number;
}

export interface QuizSession {
	quizId: string;
	subjectName: string;
	topic?: string;
	startedAt: Date;
	answers: QuizAnswer[];
	currentQuestionIndex: number;
}
