'use client';

import {
	CategoryLegend,
	ElementComparison,
	ElementDetailDrawer,
	ElementDetailSheet,
	ElementGrid,
	ElementQuiz,
	PeriodicTableHeader,
	QuizResults,
	TrendLegend,
	usePeriodicTable,
} from '@/components/PeriodicTable';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ELEMENTS } from '@/content/elements';

export default function PeriodicTable() {
	const {
		elementDetailState,
		viewState,
		quizState,
		filteredElements,
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
	} = usePeriodicTable();

	return (
		<div className="flex flex-col h-full bg-background min-w-0">
			{quizState.started ? (
				showQuizResults ? (
					<QuizResults score={quizState.score} onRestart={startQuiz} onExit={resetQuiz} />
				) : (
					<ElementQuiz
						quizQuestions={quizState.questions}
						currentQuestion={quizState.currentQuestion}
						selectedAnswer={quizState.selectedAnswer}
						showExplanation={quizState.showExplanation}
						quizScore={quizState.score}
						onSelectAnswer={handleQuizAnswer}
						onNextQuestion={nextQuestion}
						onExit={exitQuiz}
					/>
				)
			) : (
				<>
					<PeriodicTableHeader
						searchQuery={viewState.searchQuery}
						onSearchChange={setSearchQuery}
						selectedGroup={viewState.selectedGroup}
						onGroupChange={setSelectedGroup}
						trendsMode={viewState.trendsMode}
						onTrendsModeChange={setTrendsMode}
						compareMode={viewState.compareMode}
						onCompareModeChange={setCompareMode}
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
									onElementClick={selectElement}
									onCompareSelect={handleCompareSelect}
								/>

								{viewState.trendsMode ? (
									<TrendLegend trendsMode={!!viewState.trendsMode} />
								) : (
									<CategoryLegend trendsMode={!!viewState.trendsMode} />
								)}

								{viewState.compareMode && viewState.compareElements.length === 2 && (
									<ElementComparison elements={viewState.compareElements} onClear={clearCompare} />
								)}
							</div>
						</main>
					</ScrollArea>

					{viewState.isDesktop ? (
						<ElementDetailSheet
							elementDetailState={elementDetailState}
							onClose={closeElementDetail}
							handleCheckAnswer={handleCheckAnswer}
						/>
					) : (
						<ElementDetailDrawer
							elementDetailState={elementDetailState}
							onClose={closeElementDetail}
							handleCheckAnswer={handleCheckAnswer}
						/>
					)}
				</>
			)}
		</div>
	);
}
