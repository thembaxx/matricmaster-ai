import type { QuizQuestion } from '@/constants/periodic-table';

export type QuizState = {
	questions: QuizQuestion[];
	currentQuestion: number;
	score: { correct: number; total: number };
	started: boolean;
	selectedAnswer: number | null;
	showExplanation: boolean;
};

export type QuizAction =
	| { type: 'START_QUIZ'; payload: QuizQuestion[] }
	| { type: 'SELECT_ANSWER'; payload: number }
	| { type: 'NEXT_QUESTION' }
	| { type: 'EXIT_QUIZ' }
	| { type: 'RESET' };

export function quizReducer(state: QuizState, action: QuizAction): QuizState {
	switch (action.type) {
		case 'START_QUIZ':
			return {
				questions: action.payload,
				currentQuestion: 0,
				score: { correct: 0, total: 0 },
				started: true,
				selectedAnswer: null,
				showExplanation: false,
			};
		case 'SELECT_ANSWER': {
			const isCorrect = action.payload === state.questions[state.currentQuestion]?.correctAnswer;
			return {
				...state,
				selectedAnswer: action.payload,
				showExplanation: true,
				score: {
					correct: state.score.correct + (isCorrect ? 1 : 0),
					total: state.score.total + 1,
				},
			};
		}
		case 'NEXT_QUESTION':
			if (state.currentQuestion < state.questions.length - 1) {
				return {
					...state,
					currentQuestion: state.currentQuestion + 1,
					selectedAnswer: null,
					showExplanation: false,
				};
			}
			return { ...state, started: false };
		case 'EXIT_QUIZ':
			return { ...state, started: false };
		case 'RESET':
			return {
				questions: [],
				currentQuestion: 0,
				score: { correct: 0, total: 0 },
				started: false,
				selectedAnswer: null,
				showExplanation: false,
			};
		default:
			return state;
	}
}
