'use client';

import { Loading03Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState } from 'react';
import { ContextualAIBubble } from '@/components/AI/ContextualAIBubble';
import { ResponsiveAudioPlayer } from '@/components/AudioPlayer';
import { PastPaperHeader } from '@/components/PastPaper/PastPaperHeader';
import { PastPaperNavigation } from '@/components/PastPaper/PastPaperNavigation';
import { PastPaperPagination } from '@/components/PastPaper/PastPaperPagination';
import { PastPaperQuestion } from '@/components/PastPaper/PastPaperQuestion';
import { ScannedUpload } from '@/components/PastPapers/ScannedUpload';
import { ConversionBanner } from '@/components/PastPaperViewer/ConversionBanner';
import { ErrorState } from '@/components/PastPaperViewer/ErrorState';
import { InstructionsCard } from '@/components/PastPaperViewer/InstructionsCard';
import { LoadingState } from '@/components/PastPaperViewer/LoadingState';
import { QuestionJumpNav } from '@/components/PastPaperViewer/QuestionJumpNav';
import { Button } from '@/components/ui/button';
import { useAiContext } from '@/hooks/useAiContext';
import { usePastPaperViewer } from '@/hooks/usePastPaperViewer';
import {
	downloadPastPaper,
	getCachedPastPaper,
	isStorageAvailable,
} from '@/lib/offline/offline-cache';
import type { ParsedQuestion } from '@/services/ocrService';
import { useOfflineStore } from '@/stores/useOfflineStore';

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
	const [showScannedUpload, setShowScannedUpload] = useState(false);
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

	const handleScannedQuestionsExtracted = useCallback((questions: ParsedQuestion[]) => {
		console.log('Extracted questions from scanned paper:', questions.length);
		setShowScannedUpload(false);
	}, []);

	useEffect(() => {
		checkOfflineAvailability();
	}, [checkOfflineAvailability]);

	if (isLoading && !extractedPaper) {
		return <LoadingState />;
	}

	if (!paper && !extractedPaper) {
		return <LoadingState />;
	}

	if (showScannedUpload) {
		return (
			<div className="flex flex-col h-full bg-background">
				<div className="px-6 py-4 border-b">
					<Button variant="ghost" size="sm" onClick={() => setShowScannedUpload(false)}>
						← back to viewer
					</Button>
				</div>
				<div className="flex-1 overflow-y-auto p-6">
					<ScannedUpload
						onQuestionsExtracted={handleScannedQuestionsExtracted}
						onCancel={() => setShowScannedUpload(false)}
					/>
				</div>
			</div>
		);
	}

	if (!paper) {
		return null;
	}

	if (showPdfFallback && paper) {
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

	if (error && !extractedPaper && paper) {
		return (
			<ErrorState
				paper={{
					id: paper.id,
					subject: paper.subject,
					paper: paper.paper,
					year: paper.year,
					month: paper.month,
					downloadUrl: paper.downloadUrl,
				}}
				error={error}
				onRetry={() =>
					extractQuestions(
						paper.id,
						paper.downloadUrl,
						paper.subject,
						paper.paper,
						paper.year,
						paper.month
					)
				}
				onViewPdf={() => setShowPdfFallback(true)}
			/>
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
				onUploadScanned={() => setShowScannedUpload(true)}
			/>

			<div className="grow overflow-hidden pb-16">
				<main
					className="px-6 py-6 mobile-safe-bottom transition-transform duration-300"
					style={{
						transform: `scale(${zoom / 100})`,
						transformOrigin: 'top center',
					}}
				>
					{extractedPaper?.instructions && (
						<InstructionsCard instructions={extractedPaper.instructions} />
					)}

					{totalQuestions > 0 && extractedPaper?.questions && (
						<QuestionJumpNav
							questions={extractedPaper.questions}
							currentQuestionIndex={currentQuestionIndex}
							onGoToQuestion={goToQuestion}
						/>
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

					<ConversionBanner onConvert={handleConvertToInteractive} />
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
