'use client';

import { useEffect, useMemo } from 'react';
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
import type { ElementType } from '@/constants/periodic-table';
import { ELEMENT_DETAILS, ELEMENTS } from '@/data/elements';
import {
	type ElementDetailState,
	useElementDetailState,
	useQuizState,
	useViewState,
	type ViewState,
} from '@/hooks/usePeriodicTableState';
import { generateQuizQuestions } from '@/utils/periodic-table';

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

function ElementDetailSheet({
	elementDetailState,
	onClose,
	handleCheckAnswer,
}: {
	elementDetailState: ElementDetailState;
	onClose: () => void;
	handleCheckAnswer: () => void;
}) {
	if (!elementDetailState.selectedElement) return null;

	return (
		<Sheet open={!!elementDetailState.selectedElement} onOpenChange={(open) => !open && onClose()}>
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
					setSelectedAnswer={(_a) => {}}
					showAnswer={elementDetailState.showAnswer}
					handleCheckAnswer={handleCheckAnswer}
				/>
			</SheetContent>
		</Sheet>
	);
}

function ElementDetailDrawer({
	elementDetailState,
	onClose,
	handleCheckAnswer,
}: {
	elementDetailState: ElementDetailState;
	onClose: () => void;
	handleCheckAnswer: () => void;
}) {
	if (!elementDetailState.selectedElement) return null;

	return (
		<Drawer open={!!elementDetailState.selectedElement} onClose={onClose}>
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
						setSelectedAnswer={(_a) => {}}
						showAnswer={elementDetailState.showAnswer}
						handleCheckAnswer={handleCheckAnswer}
					/>
				</div>
			</DrawerContent>
		</Drawer>
	);
}

export default function PeriodicTable() {
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

	const showQuizResults =
		!quizState.started &&
		quizState.score.total > 0 &&
		quizState.currentQuestion >= quizState.questions.length - 1 &&
		!quizState.showExplanation;

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

					{viewState.isDesktop ? (
						<ElementDetailSheet
							elementDetailState={elementDetailState}
							onClose={() => elementDetailDispatch({ type: 'CLOSE' })}
							handleCheckAnswer={handleCheckAnswer}
						/>
					) : (
						<ElementDetailDrawer
							elementDetailState={elementDetailState}
							onClose={() => elementDetailDispatch({ type: 'CLOSE' })}
							handleCheckAnswer={handleCheckAnswer}
						/>
					)}
				</>
			)}
		</div>
	);
}
