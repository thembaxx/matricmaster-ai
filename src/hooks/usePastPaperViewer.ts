'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { PAST_PAPERS } from '@/constants/mock-data';
import { useGeminiQuotaModal } from '@/contexts/GeminiQuotaModalContext';
import { useQuestionExtractor } from '@/hooks/useQuestionExtractor';
import { isQuotaError } from '@/lib/ai/quota-error';
import { QUERY_KEYS } from '@/lib/api/endpoints';
import { getPastPaperByIdAction } from '@/lib/db/actions';
import { saveToFlashcardsAction } from '@/lib/db/flashcard-actions';
import { getExplanation } from '@/services/geminiService';

export function usePastPaperViewer(initialId?: string, initialMode?: string) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { triggerQuotaError } = useGeminiQuotaModal();
	const paperId = initialId || searchParams.get('id');
	const mode = initialMode || searchParams.get('mode');

	const [zoom, setZoom] = useState(100);
	const [activeTab, setActiveTab] = useState('questions');
	const [showAiExplanation, setShowAiExplanation] = useState(false);
	const [aiExplanation, setAiExplanation] = useState<string | null>(null);
	const [isExplaining, setIsExplaining] = useState(false);
	const [showPdfFallback, setShowPdfFallback] = useState(mode === 'read');
	const [viewMode, setViewMode] = useState<'smart' | 'original'>('smart');
	const [showAudioPlayer, setShowAudioPlayer] = useState(false);
	const [audioText, setAudioText] = useState('');
	const [audioTitle, setAudioTitle] = useState('');
	const [isSavingToFlashcards, setIsSavingToFlashcards] = useState(false);

	const questionExtractor = useQuestionExtractor();
	const { extractQuestions, currentQuestion, totalQuestions, currentQuestionIndex } =
		questionExtractor;

	const fetchPaper = useCallback(async () => {
		if (!paperId) return null;

		try {
			const dbPaper = await getPastPaperByIdAction(paperId);
			if (dbPaper) {
				return {
					id: dbPaper.id,
					paperId: dbPaper.paperId,
					subject: dbPaper.subject,
					paper: dbPaper.paper,
					year: dbPaper.year,
					month: dbPaper.month,
					marks: dbPaper.totalMarks || 0,
					downloadUrl: dbPaper.storedPdfUrl || dbPaper.originalPdfUrl,
					markdownUrl: dbPaper.markdownFileUrl,
				};
			}
		} catch (err) {
			console.debug('Failed to load paper from DB:', err);
		}

		const found = PAST_PAPERS.find((p) => p.id === paperId);
		return found || null;
	}, [paperId]);

	const { data: paper, isLoading: isPaperLoading } = useQuery({
		queryKey: [QUERY_KEYS.pastPaper, paperId],
		queryFn: fetchPaper,
		enabled: !!paperId,
		staleTime: 10 * 60 * 1000,
	});

	const paperData = paper || PAST_PAPERS[0];

	const shouldExtractQuestions = useMemo(
		() => mode !== 'read' && paper && !isPaperLoading,
		[mode, paper, isPaperLoading]
	);

	useMemo(() => {
		if (shouldExtractQuestions && paperData) {
			const paperIdToUse = 'paperId' in paperData ? paperData.paperId : paperData.id;
			extractQuestions(
				paperIdToUse,
				paperData.downloadUrl,
				paperData.subject,
				paperData.paper,
				paperData.year,
				paperData.month
			);
		}
	}, [shouldExtractQuestions, paperData, extractQuestions]);

	const handleExplainQuestion = useCallback(async () => {
		if (!currentQuestion) return;
		setIsExplaining(true);
		setShowAiExplanation(true);
		try {
			const explanation = await getExplanation(paperData.subject, currentQuestion.questionText);
			setAiExplanation(
				explanation ?? "I'm sorry, I couldn't generate an explanation for this question."
			);
		} catch (err) {
			if (isQuotaError(err)) {
				triggerQuotaError();
			}
			console.debug('Failed to get AI explanation:', err);
			setAiExplanation('Sorry, I could not generate an explanation right now.');
		} finally {
			setIsExplaining(false);
		}
	}, [currentQuestion, paperData.subject, triggerQuotaError]);

	const handleSaveToFlashcards = useCallback(async () => {
		if (!currentQuestion) return;

		setIsSavingToFlashcards(true);
		try {
			const front = currentQuestion.questionText || `Question from ${paperData.subject} Paper`;
			const back = aiExplanation || 'Review this question to understand the concept better.';

			const result = await saveToFlashcardsAction({
				front,
				back,
				subjectName: paperData.subject,
			});

			if (result.success) {
				toast.success('Question saved to flashcards!');
			} else {
				toast.error(result.error || 'Failed to save flashcard');
			}
		} catch (err) {
			console.debug('Failed to save flashcard:', err);
			toast.error('Failed to save flashcard');
		} finally {
			setIsSavingToFlashcards(false);
		}
	}, [currentQuestion, paperData.subject, aiExplanation]);

	const handleConvertToInteractive = () => {
		router.push(`/quiz?id=${paperData.id}`);
	};

	const progress = totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0;

	return {
		router,
		zoom,
		setZoom,
		activeTab,
		setActiveTab,
		paper: paperData,
		showAiExplanation,
		setShowAiExplanation,
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
	};
}
