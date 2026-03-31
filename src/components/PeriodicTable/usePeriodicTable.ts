'use client';

import { useEffect, useMemo } from 'react';
import type { ElementType } from '@/constants/periodic-table';
import { ELEMENT_DETAILS, ELEMENTS } from '@/content/elements';
import { useElementDetailState, useQuizState, useViewState } from '@/hooks/usePeriodicTableState';
import { generateQuizQuestions } from '@/utils/periodic-table';

export function usePeriodicTable() {
	const [elementDetailState, elementDetailDispatch] = useElementDetailState();
	const [viewState, viewDispatch] = useViewState();
	const [quizState, quizDispatch] = useQuizState();

	const filteredElements = useMemo(() => {
		return ELEMENTS.filter((el) => {
			const matchesSearch =
				viewState.searchQuery === '' ||
				el.name.toLowerCase().includes(viewState.searchQuery.toLowerCase()) ||
				el.sym.toLowerCase().includes(viewState.searchQuery.toLowerCase()) ||
				el.num.toString().includes(viewState.searchQuery);
			const matchesGroup =
				viewState.selectedGroup === 'all' || el.group === viewState.selectedGroup;
			return matchesSearch && matchesGroup;
		});
	}, [viewState.searchQuery, viewState.selectedGroup]);

	useEffect(() => {
		const checkDesktop = () =>
			viewDispatch({ type: 'SET_DESKTOP', payload: window.innerWidth >= 768 });
		checkDesktop();
		window.addEventListener('resize', checkDesktop);
		return () => window.removeEventListener('resize', checkDesktop);
	}, [viewDispatch]);

	const handleCheckAnswer = () => {
		const details = elementDetailState.selectedElement
			? ELEMENT_DETAILS[elementDetailState.selectedElement.num]
			: null;
		const practiceQuestions = details?.practiceQuestions || [
			{
				question: `What is the atomic number of ${elementDetailState.selectedElement?.name}?`,
				options: [
					((elementDetailState.selectedElement?.num || 1) - 1).toString(),
					(elementDetailState.selectedElement?.num || 1).toString(),
					((elementDetailState.selectedElement?.num || 1) + 1).toString(),
					((elementDetailState.selectedElement?.num || 1) + 2).toString(),
				],
				answer: 1,
			},
		];
		if (elementDetailState.selectedAnswer === practiceQuestions[0].answer) {
			elementDetailDispatch({ type: 'SET_SHOW_ANSWER', payload: true });
		}
	};

	const handleCompareSelect = (element: ElementType) => {
		if (viewState.compareElements.find((e) => e.num === element.num)) {
			viewDispatch({ type: 'REMOVE_COMPARE_ELEMENT', payload: element });
		} else if (viewState.compareElements.length < 2) {
			viewDispatch({ type: 'ADD_COMPARE_ELEMENT', payload: element });
		}
	};

	const startQuiz = () => {
		const questions = generateQuizQuestions(10);
		quizDispatch({ type: 'START_QUIZ', payload: questions });
	};

	const handleQuizAnswer = (answerIndex: number) => {
		quizDispatch({ type: 'SELECT_ANSWER', payload: answerIndex });
	};

	const nextQuestion = () => {
		quizDispatch({ type: 'NEXT_QUESTION' });
	};

	const exitQuiz = () => {
		quizDispatch({ type: 'EXIT_QUIZ' });
	};

	const resetQuiz = () => {
		quizDispatch({ type: 'RESET' });
	};

	const closeElementDetail = () => {
		elementDetailDispatch({ type: 'CLOSE' });
	};

	const selectElement = (element: ElementType) => {
		elementDetailDispatch({ type: 'SELECT_ELEMENT', payload: element });
	};

	const setSearchQuery = (query: string) => {
		viewDispatch({ type: 'SET_SEARCH_QUERY', payload: query });
	};

	const setSelectedGroup = (group: string) => {
		viewDispatch({ type: 'SET_GROUP', payload: group });
	};

	const setTrendsMode = (mode: import('@/constants/periodic-table').TrendMode) => {
		viewDispatch({ type: 'SET_TRENDS_MODE', payload: mode });
	};

	const setCompareMode = (enabled: boolean) => {
		viewDispatch({ type: 'SET_COMPARE_MODE', payload: enabled });
	};

	const clearCompare = () => {
		viewDispatch({ type: 'CLEAR_COMPARE' });
	};

	const showQuizResults =
		!quizState.started &&
		quizState.score.total > 0 &&
		quizState.currentQuestion >= quizState.questions.length - 1 &&
		!quizState.showExplanation;

	return {
		elementDetailState,
		viewState,
		quizState,
		filteredElements,
		elements: ELEMENTS,
		handleCheckAnswer,
		handleCompareSelect,
		startQuiz,
		handleQuizAnswer,
		nextQuestion,
		exitQuiz,
		resetQuiz,
		closeElementDetail,
		selectElement,
		setSearchQuery,
		setSelectedGroup,
		setTrendsMode,
		setCompareMode,
		clearCompare,
		showQuizResults,
	};
}
