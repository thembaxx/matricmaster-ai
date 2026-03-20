'use client';

import { useEffect, useMemo, useReducer } from 'react';
import {
	CategoryLegend,
	ElementCard,
	ElementComparison,
	ElementDetailContent,
	ElementQuiz,
	PeriodicTableHeader,
	QuizResults,
	TrendLegend,
} from '@/components/PeriodicTable';
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
} from '@/components/ui/drawer';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from '@/components/ui/sheet';
import type { ElementType, QuizQuestion, TrendMode } from '@/constants/periodic-table';
import { ELEMENT_DETAILS, ELEMENTS } from '@/data/elements';
import { generateQuizQuestions } from '@/utils/periodic-table';

type ElementDetailState = {
	selectedElement: ElementType | null;
	selectedAnswer: number | null;
	showAnswer: boolean;
};

type ElementDetailAction =
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

type ViewState = {
	searchQuery: string;
	selectedGroup: string;
	isDesktop: boolean;
	trendsMode: TrendMode;
	compareMode: boolean;
	compareElements: ElementType[];
};

type ViewAction =
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

type QuizState = {
	questions: QuizQuestion[];
	currentQuestion: number;
	score: { correct: number; total: number };
	started: boolean;
	selectedAnswer: number | null;
	showExplanation: boolean;
};

type QuizAction =
	| { type: 'START_QUIZ'; payload: QuizQuestion[] }
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

function ElementGrid({
	elements,
	viewState,
	elementDetailState,
	onElementClick,
	onCompareSelect,
}: {
	elements: ElementType[];
	viewState: ViewState;
	elementDetailState: ElementDetailState;
	onElementClick: (element: ElementType) => void;
	onCompareSelect: (element: ElementType) => void;
}) {
	const highlightedElements = useMemo(() => {
		if (viewState.searchQuery === '' && viewState.selectedGroup === 'all') return null;
		return new Set(elements.map((el) => el.num));
	}, [elements, viewState.searchQuery, viewState.selectedGroup]);

	return (
		<div className="flex flex-wrap justify-center gap-1">
			{elements.map((el, i) => (
				<ElementCard
					key={el.num}
					element={el}
					index={i}
					trendsMode={viewState.trendsMode}
					compareMode={viewState.compareMode}
					compareElements={viewState.compareElements}
					selectedElement={elementDetailState.selectedElement}
					highlightedElements={highlightedElements}
					onClick={viewState.compareMode ? onCompareSelect : onElementClick}
				/>
			))}
		</div>
	);
}

export default function PeriodicTable() {
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
	}, []);

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

	const showQuizResults =
		!quizState.started &&
		quizState.score.total > 0 &&
		quizState.currentQuestion >= quizState.questions.length - 1 &&
		!quizState.showExplanation;

	const DesktopSheet = elementDetailState.selectedElement ? (
		<Sheet
			open={!!elementDetailState.selectedElement}
			onOpenChange={(open) => !open && elementDetailDispatch({ type: 'CLOSE' })}
		>
			<SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
				<SheetHeader className="mb-6">
					<SheetTitle className="text-xl font-black tracking-tight">
						{elementDetailState.selectedElement.name}
					</SheetTitle>
					<SheetDescription className="text-sm">
						{elementDetailState.selectedElement.category}
					</SheetDescription>
				</SheetHeader>
				<ElementDetailContent
					element={elementDetailState.selectedElement}
					selectedAnswer={elementDetailState.selectedAnswer}
					setSelectedAnswer={(a) => elementDetailDispatch({ type: 'SET_ANSWER', payload: a })}
					showAnswer={elementDetailState.showAnswer}
					handleCheckAnswer={handleCheckAnswer}
				/>
			</SheetContent>
		</Sheet>
	) : null;

	const MobileDrawer = elementDetailState.selectedElement ? (
		<Drawer
			open={!!elementDetailState.selectedElement}
			onClose={() => elementDetailDispatch({ type: 'CLOSE' })}
		>
			<DrawerContent className="max-h-[85vh]">
				<DrawerHeader className="text-left">
					<DrawerTitle className="text-xl font-black tracking-tight">
						{elementDetailState.selectedElement.name}
					</DrawerTitle>
					<DrawerDescription className="text-sm">
						{elementDetailState.selectedElement.category}
					</DrawerDescription>
				</DrawerHeader>
				<div className="px-4 pb-6 overflow-y-auto max-h-[calc(85vh-120px)]">
					<ElementDetailContent
						element={elementDetailState.selectedElement}
						selectedAnswer={elementDetailState.selectedAnswer}
						setSelectedAnswer={(a) => elementDetailDispatch({ type: 'SET_ANSWER', payload: a })}
						showAnswer={elementDetailState.showAnswer}
						handleCheckAnswer={handleCheckAnswer}
					/>
				</div>
			</DrawerContent>
		</Drawer>
	) : null;

	return (
		<div className="flex flex-col h-full bg-background min-w-0">
			{quizState.started ? (
				showQuizResults ? (
					<QuizResults
						score={quizState.score}
						onRestart={startQuiz}
						onExit={() => quizDispatch({ type: 'RESET' })}
					/>
				) : (
					<ElementQuiz
						quizQuestions={quizState.questions}
						currentQuestion={quizState.currentQuestion}
						selectedAnswer={quizState.selectedAnswer}
						showExplanation={quizState.showExplanation}
						quizScore={quizState.score}
						onSelectAnswer={handleQuizAnswer}
						onNextQuestion={nextQuestion}
						onExit={() => quizDispatch({ type: 'EXIT_QUIZ' })}
					/>
				)
			) : (
				<>
					<PeriodicTableHeader
						searchQuery={viewState.searchQuery}
						onSearchChange={(q) => viewDispatch({ type: 'SET_SEARCH_QUERY', payload: q })}
						selectedGroup={viewState.selectedGroup}
						onGroupChange={(g) => viewDispatch({ type: 'SET_GROUP', payload: g })}
						trendsMode={viewState.trendsMode}
						onTrendsModeChange={(m) => viewDispatch({ type: 'SET_TRENDS_MODE', payload: m })}
						compareMode={viewState.compareMode}
						onCompareModeChange={(enabled) =>
							viewDispatch({ type: 'SET_COMPARE_MODE', payload: enabled })
						}
						compareElementsCount={viewState.compareElements.length}
						onStartQuiz={startQuiz}
						filteredCount={filteredElements.length}
						totalCount={ELEMENTS.length}
					/>

					<ScrollArea className="flex-1">
						<main className="px-4 py-2 flex flex-col items-start pb-32 max-w-6xl mx-auto w-full gap-6">
							<div className="w-full max-w-5xl mx-auto">
								<ElementGrid
									elements={ELEMENTS}
									viewState={viewState}
									elementDetailState={elementDetailState}
									onElementClick={(el) =>
										elementDetailDispatch({ type: 'SELECT_ELEMENT', payload: el })
									}
									onCompareSelect={handleCompareSelect}
								/>

								{viewState.trendsMode ? (
									<TrendLegend trendsMode={!!viewState.trendsMode} />
								) : (
									<CategoryLegend trendsMode={!!viewState.trendsMode} />
								)}

								{viewState.compareMode && viewState.compareElements.length === 2 && (
									<ElementComparison
										elements={viewState.compareElements}
										onClear={() => viewDispatch({ type: 'CLEAR_COMPARE' })}
									/>
								)}
							</div>
						</main>
					</ScrollArea>

					{viewState.isDesktop ? DesktopSheet : MobileDrawer}
				</>
			)}
		</div>
	);
}
