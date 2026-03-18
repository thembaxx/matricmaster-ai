'use client';

import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useGeminiQuotaModal } from '@/contexts/GeminiQuotaModalContext';
import { useQuestionExtractor } from '@/hooks/useQuestionExtractor';
import { isQuotaError } from '@/lib/ai/quota-error';
import { getExplanation } from '@/services/geminiService';

export interface PastPaperData {
	id: string;
	paperId: string;
	subject: string;
	paper: string;
	year: number;
	month: string;
	marks: number;
	downloadUrl: string;
	markdownUrl?: string;
}

export interface ExtractedQuestion {
	id: string;
	questionNumber: string;
	questionText: string;
	marks: number;
	topic?: string;
	subQuestions?: {
		id: string;
		text: string;
		marks?: number;
	}[];
}

export interface QuestionViewerState {
	extractedPaper: ReturnType<typeof useQuestionExtractor>['extractedPaper'];
	currentQuestion: ExtractedQuestion | null;
	currentQuestionIndex: number;
	totalQuestions: number;
	progress: number;
	hasMoreQuestions: boolean;
	hasPreviousQuestions: boolean;
	showAiExplanation: boolean;
	aiExplanation: string | null;
	isExplaining: boolean;
	isSavingToFlashcards: boolean;
	handleExplainQuestion: () => Promise<void>;
	handleSaveToFlashcards: () => Promise<void>;
	handleConvertToInteractive: () => void;
	nextQuestion: () => void;
	previousQuestion: () => void;
	goToQuestion: (index: number) => void;
}

export function useQuestionViewer(paper: PastPaperData): QuestionViewerState {
	const { triggerQuotaError } = useGeminiQuotaModal();
	const [showAiExplanation, setShowAiExplanation] = useState(false);
	const [aiExplanation, setAiExplanation] = useState<string | null>(null);
	const [isExplaining, setIsExplaining] = useState(false);
	const [isSavingToFlashcards, setIsSavingToFlashcards] = useState(false);

	const {
		extractedPaper,
		currentQuestion,
		currentQuestionIndex,
		totalQuestions,
		nextQuestion,
		previousQuestion,
		goToQuestion,
		hasMoreQuestions,
		hasPreviousQuestions,
	} = useQuestionExtractor();

	const progress = useMemo(
		() => (totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0),
		[totalQuestions, currentQuestionIndex]
	);

	const handleExplainQuestion = useCallback(async () => {
		if (!currentQuestion) return;
		setIsExplaining(true);
		setShowAiExplanation(true);
		try {
			const explanation = await getExplanation(paper.subject, currentQuestion.questionText);
			setAiExplanation(
				explanation ?? "I'm sorry, I couldn't generate an explanation for this question."
			);
		} catch (err) {
			if (isQuotaError(err)) {
				triggerQuotaError();
			}
			setAiExplanation('Sorry, I could not generate an explanation right now.');
		} finally {
			setIsExplaining(false);
		}
	}, [currentQuestion, paper.subject, triggerQuotaError]);

	const handleSaveToFlashcards = useCallback(async () => {
		if (!currentQuestion) return;
		setIsSavingToFlashcards(true);
		try {
			const { saveToFlashcardsAction } = await import('@/lib/db/flashcard-actions');
			const front = currentQuestion.questionText || `Question from ${paper.subject} Paper`;
			const back = aiExplanation || 'Review this question to understand the concept better.';
			const result = await saveToFlashcardsAction({ front, back, subjectName: paper.subject });
			if (result.success) {
				toast.success('Question saved to flashcards!');
			} else {
				toast.error(result.error || 'Failed to save flashcard');
			}
		} catch {
			toast.error('Failed to save flashcard');
		} finally {
			setIsSavingToFlashcards(false);
		}
	}, [currentQuestion, paper.subject, aiExplanation]);

	const handleConvertToInteractive = useCallback(() => {
		window.location.href = `/quiz?id=${paper.id}`;
	}, [paper.id]);

	return {
		extractedPaper,
		currentQuestion,
		currentQuestionIndex,
		totalQuestions,
		progress,
		hasMoreQuestions,
		hasPreviousQuestions,
		showAiExplanation,
		aiExplanation,
		isExplaining,
		isSavingToFlashcards,
		handleExplainQuestion,
		handleSaveToFlashcards,
		handleConvertToInteractive,
		nextQuestion,
		previousQuestion,
		goToQuestion,
	};
}
