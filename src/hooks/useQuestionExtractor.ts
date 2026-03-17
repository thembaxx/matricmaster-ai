import { useCallback, useState } from 'react';
import type { ExtractedPaper, ExtractedQuestion } from '@/services/pdfExtractor';

interface UseQuestionExtractorReturn {
	extractedPaper: ExtractedPaper | null;
	currentQuestion: ExtractedQuestion | null;
	currentQuestionIndex: number;
	isLoading: boolean;
	error: string | null;
	hasMoreQuestions: boolean;
	hasPreviousQuestions: boolean;
	totalQuestions: number;
	extractQuestions: (
		paperId: string,
		pdfUrl: string,
		subject: string,
		paper: string,
		year: number,
		month: string
	) => Promise<void>;
	nextQuestion: () => void;
	previousQuestion: () => void;
	goToQuestion: (index: number) => void;
	clearError: () => void;
}

export function useQuestionExtractor(): UseQuestionExtractorReturn {
	const [extractedPaper, setExtractedPaper] = useState<ExtractedPaper | null>(null);
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const extractQuestions = useCallback(
		async (
			paperId: string,
			pdfUrl: string,
			subject: string,
			paper: string,
			year: number,
			month: string
		) => {
			setIsLoading(true);
			setError(null);

			try {
				const response = await fetch('/api/extract-questions', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						paperId,
						pdfUrl,
						subject,
						paper,
						year,
						month,
					}),
				});

				const result = await response.json();

				if (!response.ok) {
					throw new Error(result.error || result.details || 'Failed to extract questions');
				}

				setExtractedPaper(result.data);
				setCurrentQuestionIndex(0);
			} catch (err) {
				const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
				setError(errorMessage);
				console.debug('Error extracting questions:', err);
			} finally {
				setIsLoading(false);
			}
		},
		[]
	);

	const currentQuestion = extractedPaper?.questions?.[currentQuestionIndex] ?? null;
	const totalQuestions = extractedPaper?.questions?.length ?? 0;
	const hasMoreQuestions = currentQuestionIndex < totalQuestions - 1;
	const hasPreviousQuestions = currentQuestionIndex > 0;

	const nextQuestion = useCallback(() => {
		if (hasMoreQuestions) {
			setCurrentQuestionIndex((prev) => prev + 1);
		}
	}, [hasMoreQuestions]);

	const previousQuestion = useCallback(() => {
		if (hasPreviousQuestions) {
			setCurrentQuestionIndex((prev) => prev - 1);
		}
	}, [hasPreviousQuestions]);

	const goToQuestion = useCallback(
		(index: number) => {
			if (index >= 0 && extractedPaper && index < (extractedPaper.questions?.length ?? 0)) {
				setCurrentQuestionIndex(index);
			}
		},
		[extractedPaper]
	);

	const clearError = useCallback(() => {
		setError(null);
	}, []);

	return {
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
		clearError,
	};
}
