'use client';

import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import {
	extractTextFromImage,
	type ParsedQuestion,
	parsePastPaperText,
	processScannedPDF,
} from '@/services/ocrService';

interface UseOCRResult {
	isProcessing: boolean;
	progress: number;
	extractedText: string | null;
	parsedQuestions: ParsedQuestion[];
	error: string | null;
	processImage: (file: File | Blob) => Promise<void>;
	processPDF: (file: File) => Promise<void>;
	reset: () => void;
}

export function useOCR(): UseOCRResult {
	const [isProcessing, setIsProcessing] = useState(false);
	const [progress, setProgress] = useState(0);
	const [extractedText, setExtractedText] = useState<string | null>(null);
	const [parsedQuestions, setParsedQuestions] = useState<ParsedQuestion[]>([]);
	const [error, setError] = useState<string | null>(null);

	const processImage = useCallback(async (file: File | Blob) => {
		setIsProcessing(true);
		setProgress(0);
		setError(null);

		try {
			const result = await extractTextFromImage(file, setProgress);
			setExtractedText(result.text);

			const questions = parsePastPaperText(result.text);
			setParsedQuestions(questions);

			if (questions.length === 0) {
				toast.warning('No questions detected. You may need to edit the extracted text manually.');
			} else {
				toast.success(`Extracted ${questions.length} questions from image.`);
			}
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Failed to process image';
			setError(message);
			toast.error(message);
		} finally {
			setIsProcessing(false);
		}
	}, []);

	const processPDF = useCallback(async (file: File) => {
		setIsProcessing(true);
		setProgress(0);
		setError(null);

		try {
			const text = await processScannedPDF(file, setProgress);
			setExtractedText(text);

			const questions = parsePastPaperText(text);
			setParsedQuestions(questions);

			if (questions.length === 0) {
				toast.warning('No questions detected. You may need to edit the extracted text manually.');
			} else {
				toast.success(`Extracted ${questions.length} questions from PDF.`);
			}
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Failed to process PDF';
			setError(message);
			toast.error(message);
		} finally {
			setIsProcessing(false);
		}
	}, []);

	const reset = useCallback(() => {
		setIsProcessing(false);
		setProgress(0);
		setExtractedText(null);
		setParsedQuestions([]);
		setError(null);
	}, []);

	return {
		isProcessing,
		progress,
		extractedText,
		parsedQuestions,
		error,
		processImage,
		processPDF,
		reset,
	};
}
