import { useReducer } from 'react';
import { elementDetailReducer } from './useElementDetailReducer';
import { quizReducer } from './useQuizReducer';
import { viewReducer } from './useViewReducer';

export type { ElementDetailAction, ElementDetailState } from './useElementDetailReducer';
export type { QuizAction, QuizState } from './useQuizReducer';
export type { ViewAction, ViewState } from './useViewReducer';

export function usePeriodicTableState() {
	const [elementDetailState, elementDetailDispatch] = useReducer(elementDetailReducer, {
		selectedElement: null,
		selectedAnswer: null,
		showAnswer: false,
	});

	const [viewState, viewDispatch] = useReducer(viewReducer, {
		searchQuery: '',
		selectedGroup: 'all',
		isDesktop: true,
		trendsMode: null,
		compareMode: false,
		compareElements: [],
	});

	const [quizState, quizDispatch] = useReducer(quizReducer, {
		questions: [],
		currentQuestion: 0,
		score: { correct: 0, total: 0 },
		started: false,
		selectedAnswer: null,
		showExplanation: false,
	});

	return {
		elementDetailState,
		elementDetailDispatch,
		viewState,
		viewDispatch,
		quizState,
		quizDispatch,
	};
}
