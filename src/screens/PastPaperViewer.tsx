'use client';

import { File01Icon, Loading03Icon, SparklesIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState } from 'react';
import { ContextualAIBubble } from '@/components/AI/ContextualAIBubble';
import { ResponsiveAudioPlayer } from '@/components/AudioPlayer';
import { PastPaperHeader } from '@/components/PastPaper/PastPaperHeader';
import { PastPaperNavigation } from '@/components/PastPaper/PastPaperNavigation';
import { PastPaperPagination } from '@/components/PastPaper/PastPaperPagination';
import { PastPaperQuestion } from '@/components/PastPaper/PastPaperQuestion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAiContext } from '@/hooks/useAiContext';
import { usePastPaperViewer } from '@/hooks/usePastPaperViewer';
import {
	downloadPastPaper,
	getCachedPastPaper,
	isStorageAvailable,
} from '@/lib/offline/offline-cache';
import { useOfflineStore } from '@/stores/useOfflineStore';

// Lazy load PdfViewer to avoid SSR issues
const PdfViewer = dynamic(() => import('@/components/PdfViewer'), {
	ssr: false,
	loading: () => (
		<div className="flex items-center justify-center h-full">
			<HugeiconsIcon icon={Loading03Icon} className="w-8 h-8 animate-spin text-brand-blue" />
		</div>
	),
});

export default function PastPaperViewer({
	initialId,
	initialMode,
}: {
	initialId?: string;
	initialMode?: string;
}) {
	const {
		router,
		zoom,
		setZoom,
		activeTab,
		setActiveTab,
		paper,
		showAiExplanation,
		aiExplanation,
		isExplaining,
		showPdfFallback,
		setShowPdfFallback,
		viewMode,
		setViewMode,
		showAudioPlayer,
		setShowAudioPlayer,
		audioText,
		setAudioText,
		audioTitle,
		setAudioTitle,
		isSavingToFlashcards,
		questionExtractor,
		handleExplainQuestion,
		handleSaveToFlashcards,
		handleConvertToInteractive,
		progress,
	} = usePastPaperViewer(initialId, initialMode);

	const {
		extractedPaper,
		currentQuestion,
		currentQuestionIndex,
		isLoading,
		error,
		hasMoreQuestions,
		hasPreviousQuestions,
		totalQuestions,
		extractQuestions,
		nextQuestion,
		previousQuestion,
		goToQuestion,
	} = questionExtractor;

	const { isOnline, downloadPaper } = useOfflineStore();
	const { setContext, clearContext } = useAiContext();
	const [isDownloading, setIsDownloading] = useState(false);
	const [isOfflineAvailable, setIsOfflineAvailable] = useState(false);

	useEffect(() => {
		if (paper) {
			setContext({
				type: 'pastPaper',
				subject: paper.subject,
				paperId: `${paper.year} ${paper.month} ${paper.paper}`,
				lastUpdated: Date.now(),
			});
		}
		return () => clearContext();
	}, [paper, setContext, clearContext]);

	const checkOfflineAvailability = useCallback(async () => {
		if (!paper?.id) return;
		const cached = await getCachedPastPaper(paper.id);
		setIsOfflineAvailable(!!cached);
	}, [paper?.id]);

	const handleDownloadForOffline = useCallback(async () => {
		if (!paper?.id || !isOnline) return;

		const available = await isStorageAvailable();
		if (!available) {
			console.warn('Not enough storage available');
			return;
		}

		setIsDownloading(true);
		try {
			await downloadPastPaper(paper.id);
			downloadPaper(paper.id);
			setIsOfflineAvailable(true);
		} catch (err) {
			console.error('Failed to download paper for offline:', err);
		}
		setIsDownloading(false);
	}, [paper?.id, isOnline, downloadPaper]);

	useEffect(() => {
		checkOfflineAvailability();
	}, [checkOfflineAvailability]);

	// Render loading state
	if (isLoading && !extractedPaper) {
		return (
			<div className="flex flex-col h-full bg-background relative grow overflow-hidden">
				<div className="flex-1 flex flex-col items-center justify-center p-6">
					<div className="text-center space-y-4">
						<HugeiconsIcon
							icon={Loading03Icon}
							className="w-12 h-12 animate-spin text-brand-blue mx-auto"
						/>
						<div className="space-y-2">
							<h3 className="font-bold text-foreground">Extracting Questions...</h3>
							<p className="text-sm text-muted-foreground">Using AI to parse the exam paper</p>
						</div>
					</div>
				</div>
			</div>
		);
	}

	// Render PDF fallback viewer - full screen mode
	if (showPdfFallback) {
		return (
			<div className="fixed inset-0 z-[200] bg-background overflow-hidden animate-in fade-in duration-300">
				<PdfViewer
					url={paper.downloadUrl}
					title={`${paper.subject} ${paper.paper} (${paper.year})`}
					onClose={() => setShowPdfFallback(false)}
				/>
			</div>
		);
	}

	// Render error state
	if (error && !extractedPaper) {
		return (
			<div className="flex flex-col h-full bg-background relative">
				<header className="px-6 pt-12 pb-4 bg-card sticky top-0 z-20 border-b border-border shrink-0">
					<div className="flex items-center justify-between mb-4">
						<div className="flex items-center gap-4">
							<Button variant="ghost" size="icon" onClick={() => router.back()}>
								<HugeiconsIcon icon={File01Icon} className="w-5 h-5" />
							</Button>
							<h1 className="text-lg font-bold text-foreground">
								{paper.subject} {paper.paper}
							</h1>
						</div>
					</div>
				</header>
				<div className="flex-1 flex flex-col items-center justify-center p-6">
					<div className="text-center space-y-4 max-w-sm">
						<div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto">
							<HugeiconsIcon icon={SparklesIcon} className="w-8 h-8 text-red-500" />
						</div>
						<div className="space-y-2">
							<h3 className="font-bold text-foreground">Extraction Failed</h3>
							<p className="text-sm text-muted-foreground">{error}</p>
						</div>
						<div className="flex flex-col gap-2">
							<Button
								className="bg-brand-blue text-white"
								onClick={() =>
									extractQuestions(
										paper.id,
										paper.downloadUrl,
										paper.subject,
										paper.paper,
										paper.year,
										paper.month
									)
								}
							>
								Try Again
							</Button>
							<Button variant="outline" onClick={() => setShowPdfFallback(true)} className="gap-2">
								<HugeiconsIcon icon={File01Icon} className="w-4 h-4" />
								View Original PDF
							</Button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-full bg-background relative">
			<PastPaperHeader
				paper={paper}
				viewMode={viewMode}
				setViewMode={setViewMode}
				zoom={zoom}
				setZoom={setZoom}
				onBack={() => router.back()}
				progress={progress}
				currentQuestionIndex={currentQuestionIndex}
				totalQuestions={totalQuestions}
				isOfflineAvailable={isOfflineAvailable}
				isDownloading={isDownloading}
				onDownloadOffline={handleDownloadForOffline}
			/>

			<div className="grow overflow-hidden pb-16">
				<main
					className="px-6 py-6 mobile-safe-bottom transition-transform duration-300"
					style={{
						transform: `scale(${zoom / 100})`,
						transformOrigin: 'top center',
					}}
				>
					{/* Instructions */}
					{extractedPaper?.instructions && (
						<Card className="p-6 mb-6 bg-card dark:bg-card/80 rounded-[2rem]">
							<h3 className="font-bold text-foreground mb-3 text-sm">
								INSTRUCTIONS AND INFORMATION
							</h3>
							<p className="text-xs text-muted-foreground whitespace-pre-wrap">
								{extractedPaper.instructions}
							</p>
						</Card>
					)}

					{/* Question Navigation - Jump to Question */}
					{totalQuestions > 0 && (
						<div className="mb-6">
							<h3 className="font-black text-[10px] text-muted-foreground uppercase tracking-widest mb-3 px-1">
								Jump to Question
							</h3>
							<div className="flex flex-wrap gap-2">
								{extractedPaper?.questions.map((q, idx) => (
									<button
										type="button"
										key={q.id}
										onClick={() => goToQuestion(idx)}
										className={`w-10 h-10 p-0 rounded-xl font-bold border-2 transition-all ${
											currentQuestionIndex === idx
												? 'border-brand-blue bg-brand-blue text-white'
												: 'border-zinc-200 dark:border-zinc-700 text-muted-foreground hover:border-brand-blue'
										}`}
									>
										{q.questionNumber}
									</button>
								))}
							</div>
						</div>
					)}

					<PastPaperQuestion
						currentQuestion={currentQuestion}
						handleExplainQuestion={handleExplainQuestion}
						isExplaining={isExplaining}
						handleSaveToFlashcards={handleSaveToFlashcards}
						isSavingToFlashcards={isSavingToFlashcards}
						showAiExplanation={showAiExplanation}
						aiExplanation={aiExplanation}
						onListen={(text, title) => {
							setAudioText(text);
							setAudioTitle(title);
							setShowAudioPlayer(true);
						}}
					/>

					{/* Conversion Banner */}
					<Card
						className="p-6 mt-6 bg-brand-blue/5 w-full border-brand-blue/20 rounded-[2rem] flex flex-col gap-3 group cursor-pointer hover:bg-brand-blue/10 transition-colors"
						onClick={handleConvertToInteractive}
					>
						<div className="flex flex-col gap-4">
							<div>
								<h4 className="font-bold text-zinc-900 dark:text-zinc-300">
									Convert to Interactive
								</h4>
								<p className="text-xs font-semibold text-muted-foreground">
									Practice this paper with step-by-step feedback
								</p>
							</div>
						</div>
						<Button
							size="sm"
							className="bg-brand-blue text-white rounded-xl font-black text-[11px] uppercase tracking-wider"
						>
							<HugeiconsIcon icon={SparklesIcon} className="w-6 h-6" />
							Start Quiz
						</Button>
					</Card>
				</main>
			</div>

			<PastPaperPagination
				totalQuestions={totalQuestions}
				currentQuestionIndex={currentQuestionIndex}
				hasPreviousQuestions={hasPreviousQuestions}
				hasMoreQuestions={hasMoreQuestions}
				previousQuestion={previousQuestion}
				nextQuestion={nextQuestion}
				goToQuestion={goToQuestion}
			/>

			<PastPaperNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

			{showAudioPlayer && (
				<ResponsiveAudioPlayer
					text={audioText}
					title={audioTitle}
					open={showAudioPlayer}
					onOpenChange={setShowAudioPlayer}
				/>
			)}
			<ContextualAIBubble />
		</div>
	);
}
