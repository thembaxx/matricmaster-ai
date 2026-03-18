'use client';

import { useEffect, useMemo, useState } from 'react';
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

function ElementGrid({
	elements,
	trendsMode,
	compareMode,
	compareElements,
	selectedElement,
	highlightedElements,
	onElementClick,
}: {
	elements: ElementType[];
	trendsMode: TrendMode;
	compareMode: boolean;
	compareElements: ElementType[];
	selectedElement: ElementType | null;
	highlightedElements: Set<number> | null;
	onElementClick: (element: ElementType) => void;
}) {
	return (
		<div className="flex flex-wrap justify-center gap-1">
			{elements.map((el, i) => (
				<ElementCard
					key={el.num}
					element={el}
					index={i}
					trendsMode={trendsMode}
					compareMode={compareMode}
					compareElements={compareElements}
					selectedElement={selectedElement}
					highlightedElements={highlightedElements}
					onClick={onElementClick}
				/>
			))}
		</div>
	);
}

export default function PeriodicTable() {
	const [selectedElement, setSelectedElement] = useState<ElementType | null>(null);
	const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
	const [showAnswer, setShowAnswer] = useState(false);
	const [isDesktop, setIsDesktop] = useState(true);
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedGroup, setSelectedGroup] = useState<string>('all');
	const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
	const [currentQuestion, setCurrentQuestion] = useState(0);
	const [quizScore, setQuizScore] = useState({ correct: 0, total: 0 });
	const [quizStarted, setQuizStarted] = useState(false);
	const [showExplanation, setShowExplanation] = useState(false);
	const [trendsMode, setTrendsMode] = useState<TrendMode>(null);
	const [compareMode, setCompareMode] = useState(false);
	const [compareElements, setCompareElements] = useState<ElementType[]>([]);

	const handleCompareSelect = (element: ElementType) => {
		if (compareElements.find((e) => e.num === element.num)) {
			setCompareElements(compareElements.filter((e) => e.num !== element.num));
		} else if (compareElements.length < 2) {
			setCompareElements([...compareElements, element]);
		}
	};

	const filteredElements = useMemo(() => {
		return ELEMENTS.filter((el) => {
			const matchesSearch =
				searchQuery === '' ||
				el.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				el.sym.toLowerCase().includes(searchQuery.toLowerCase()) ||
				el.num.toString().includes(searchQuery);
			const matchesGroup = selectedGroup === 'all' || el.group === selectedGroup;
			return matchesSearch && matchesGroup;
		});
	}, [searchQuery, selectedGroup]);

	const highlightedElements = useMemo(() => {
		if (searchQuery === '' && selectedGroup === 'all') return null;
		return new Set(filteredElements.map((el) => el.num));
	}, [filteredElements, searchQuery, selectedGroup]);

	useEffect(() => {
		const checkDesktop = () => setIsDesktop(window.innerWidth >= 768);
		checkDesktop();
		window.addEventListener('resize', checkDesktop);
		return () => window.removeEventListener('resize', checkDesktop);
	}, []);

	const handleCheckAnswer = () => {
		const details = selectedElement ? ELEMENT_DETAILS[selectedElement.num] : null;
		const practiceQuestions = details?.practiceQuestions || [
			{
				question: `What is the atomic number of ${selectedElement?.name}?`,
				options: [
					((selectedElement?.num || 1) - 1).toString(),
					(selectedElement?.num || 1).toString(),
					((selectedElement?.num || 1) + 1).toString(),
					((selectedElement?.num || 1) + 2).toString(),
				],
				answer: 1,
			},
		];
		if (selectedAnswer === practiceQuestions[0].answer) {
			setShowAnswer(true);
		}
	};

	const handleClose = () => {
		setSelectedElement(null);
		setSelectedAnswer(null);
		setShowAnswer(false);
	};

	const handleElementClick = (element: ElementType) => {
		setSelectedElement(element);
		setSelectedAnswer(null);
		setShowAnswer(false);
	};

	const startQuiz = () => {
		const questions = generateQuizQuestions(10);
		setQuizQuestions(questions);
		setCurrentQuestion(0);
		setQuizScore({ correct: 0, total: 0 });
		setQuizStarted(true);
		setShowExplanation(false);
	};

	const handleQuizAnswer = (answerIndex: number) => {
		setSelectedAnswer(answerIndex);
		setShowExplanation(true);
		if (answerIndex === quizQuestions[currentQuestion].correctAnswer) {
			setQuizScore((prev) => ({ ...prev, correct: prev.correct + 1 }));
		}
		setQuizScore((prev) => ({ ...prev, total: prev.total + 1 }));
	};

	const nextQuestion = () => {
		if (currentQuestion < quizQuestions.length - 1) {
			setCurrentQuestion((prev) => prev + 1);
			setSelectedAnswer(null);
			setShowExplanation(false);
		} else {
			setQuizStarted(false);
		}
	};

	const restartQuiz = () => {
		startQuiz();
	};

	const DesktopSheet = selectedElement ? (
		<Sheet open={!!selectedElement} onOpenChange={(open) => !open && handleClose()}>
			<SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
				<SheetHeader className="mb-6">
					<SheetTitle className="text-xl font-black tracking-tight">
						{selectedElement.name}
					</SheetTitle>
					<SheetDescription className="text-sm">{selectedElement.category}</SheetDescription>
				</SheetHeader>
				<ElementDetailContent
					element={selectedElement}
					selectedAnswer={selectedAnswer}
					setSelectedAnswer={setSelectedAnswer}
					showAnswer={showAnswer}
					handleCheckAnswer={handleCheckAnswer}
				/>
			</SheetContent>
		</Sheet>
	) : null;

	const MobileDrawer = selectedElement ? (
		<Drawer open={!!selectedElement} onClose={handleClose}>
			<DrawerContent className="max-h-[85vh]">
				<DrawerHeader className="text-left">
					<DrawerTitle className="text-xl font-black tracking-tight">
						{selectedElement.name}
					</DrawerTitle>
					<DrawerDescription className="text-sm">{selectedElement.category}</DrawerDescription>
				</DrawerHeader>
				<div className="px-4 pb-6 overflow-y-auto max-h-[calc(85vh-120px)]">
					<ElementDetailContent
						element={selectedElement}
						selectedAnswer={selectedAnswer}
						setSelectedAnswer={setSelectedAnswer}
						showAnswer={showAnswer}
						handleCheckAnswer={handleCheckAnswer}
					/>
				</div>
			</DrawerContent>
		</Drawer>
	) : null;

	const showQuizResults =
		!quizStarted &&
		quizScore.total > 0 &&
		currentQuestion >= quizQuestions.length - 1 &&
		!showExplanation;

	return (
		<div className="flex flex-col h-full bg-background min-w-0">
			{quizStarted ? (
				showQuizResults ? (
					<QuizResults
						score={quizScore}
						onRestart={restartQuiz}
						onExit={() => {
							setQuizScore({ correct: 0, total: 0 });
							setQuizQuestions([]);
						}}
					/>
				) : (
					<ElementQuiz
						quizQuestions={quizQuestions}
						currentQuestion={currentQuestion}
						selectedAnswer={selectedAnswer}
						showExplanation={showExplanation}
						quizScore={quizScore}
						onSelectAnswer={handleQuizAnswer}
						onNextQuestion={nextQuestion}
						onExit={() => setQuizStarted(false)}
					/>
				)
			) : (
				<>
					<PeriodicTableHeader
						searchQuery={searchQuery}
						onSearchChange={setSearchQuery}
						selectedGroup={selectedGroup}
						onGroupChange={setSelectedGroup}
						trendsMode={trendsMode}
						onTrendsModeChange={setTrendsMode}
						compareMode={compareMode}
						onCompareModeChange={(enabled) => {
							setCompareMode(enabled);
							if (!enabled) setCompareElements([]);
						}}
						compareElementsCount={compareElements.length}
						onStartQuiz={startQuiz}
						filteredCount={filteredElements.length}
						totalCount={ELEMENTS.length}
					/>

					<ScrollArea className="flex-1">
						<main className="px-4 py-2 flex flex-col items-start pb-32 max-w-6xl mx-auto w-full gap-6">
							<div className="w-full max-w-5xl mx-auto">
								<ElementGrid
									elements={ELEMENTS}
									trendsMode={trendsMode}
									compareMode={compareMode}
									compareElements={compareElements}
									selectedElement={selectedElement}
									highlightedElements={highlightedElements}
									onElementClick={compareMode ? handleCompareSelect : handleElementClick}
								/>

								{trendsMode ? (
									<TrendLegend trendsMode={!!trendsMode} />
								) : (
									<CategoryLegend trendsMode={!!trendsMode} />
								)}

								{compareMode && compareElements.length === 2 && (
									<ElementComparison
										elements={compareElements}
										onClear={() => setCompareElements([])}
									/>
								)}
							</div>
						</main>
					</ScrollArea>

					{isDesktop ? DesktopSheet : MobileDrawer}
				</>
			)}
		</div>
	);
}
