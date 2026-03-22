import { useReducer } from 'react';
import type { ElementType, TrendMode } from '@/constants/periodic-table';

export type ElementDetailState = {
	selectedElement: ElementType | null;
	selectedAnswer: number | null;
	showAnswer: boolean;
};

export type ElementDetailAction =
	| { type: 'SELECT_ELEMENT'; payload: ElementType }
	| { type: 'SET_ANSWER'; payload: number | null }
	| { type: 'SET_SHOW_ANSWER'; payload: boolean }
	| { type: 'CLOSE' };

function elementDetailReducer(
	state: ElementDetailState,
	action: ElementDetailAction
): ElementDetailState {
	switch (action.type) {
		case 'SELECT_ELEMENT':
			return { selectedElement: action.payload, selectedAnswer: null, showAnswer: false };
		case 'SET_ANSWER':
			return { ...state, selectedAnswer: action.payload };
		case 'SET_SHOW_ANSWER':
			return { ...state, showAnswer: action.payload };
		case 'CLOSE':
			return { selectedElement: null, selectedAnswer: null, showAnswer: false };
		default:
			return state;
	}
}

export function useElementDetailState() {
	return useReducer(elementDetailReducer, {
		selectedElement: null,
		selectedAnswer: null,
		showAnswer: false,
	});
}

export type ViewState = {
	searchQuery: string;
	selectedGroup: string;
	isDesktop: boolean;
	trendsMode: TrendMode;
	compareMode: boolean;
	compareElements: ElementType[];
};

export type ViewAction =
	| { type: 'SET_SEARCH_QUERY'; payload: string }
	| { type: 'SET_GROUP'; payload: string }
	| { type: 'SET_DESKTOP'; payload: boolean }
	| { type: 'SET_TRENDS_MODE'; payload: TrendMode }
	| { type: 'SET_COMPARE_MODE'; payload: boolean }
	| { type: 'ADD_COMPARE_ELEMENT'; payload: ElementType }
	| { type: 'REMOVE_COMPARE_ELEMENT'; payload: ElementType }
	| { type: 'CLEAR_COMPARE' };

function viewReducer(state: ViewState, action: ViewAction): ViewState {
	switch (action.type) {
		case 'SET_SEARCH_QUERY':
			return { ...state, searchQuery: action.payload };
		case 'SET_GROUP':
			return { ...state, selectedGroup: action.payload };
		case 'SET_DESKTOP':
			return { ...state, isDesktop: action.payload };
		case 'SET_TRENDS_MODE':
			return { ...state, trendsMode: action.payload };
		case 'SET_COMPARE_MODE':
			return {
				...state,
				compareMode: action.payload,
				compareElements: action.payload ? state.compareElements : [],
			};
		case 'ADD_COMPARE_ELEMENT':
			if (state.compareElements.length >= 2) return state;
			if (state.compareElements.find((e) => e.num === action.payload.num)) return state;
			return { ...state, compareElements: [...state.compareElements, action.payload] };
		case 'REMOVE_COMPARE_ELEMENT':
			return {
				...state,
				compareElements: state.compareElements.filter((e) => e.num !== action.payload.num),
			};
		case 'CLEAR_COMPARE':
			return { ...state, compareElements: [] };
		default:
			return state;
	}
}

export function useViewState() {
	return useReducer(viewReducer, {
		searchQuery: '',
		selectedGroup: 'all',
		isDesktop: true,
		trendsMode: null,
		compareMode: false,
		compareElements: [],
	});
}

export type QuizState = {
	questions: import('@/constants/periodic-table').QuizQuestion[];
	currentQuestion: number;
	score: { correct: number; total: number };
	started: boolean;
	selectedAnswer: number | null;
	showExplanation: boolean;
};

export type QuizAction =
	| { type: 'START_QUIZ'; payload: import('@/constants/periodic-table').QuizQuestion[] }
	| { type: 'SELECT_ANSWER'; payload: number }
	| { type: 'NEXT_QUESTION' }
	| { type: 'EXIT_QUIZ' }
	| { type: 'RESET' };

function quizReducer(state: QuizState, action: QuizAction): QuizState {
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

export function useQuizState() {
	return useReducer(quizReducer, {
		questions: [],
		currentQuestion: 0,
		score: { correct: 0, total: 0 },
		started: false,
		selectedAnswer: null,
		showExplanation: false,
	});
}
