'use client';

import { createWorker } from 'tesseract.js';

export interface OCRResult {
	text: string;
	confidence: number;
	words: Array<{
		text: string;
		confidence: number;
		bbox: { x0: number; y0: number; x1: number; y1: number };
	}>;
}

export interface ParsedQuestion {
	questionText: string;
	answerText?: string;
	questionNumber: number;
	marks?: number;
	topic?: string;
}

const SOUTH_AFRICAN_NUMBERING = /^(1\.|2\.|3\.|4\.|5\.|6\.|7\.|8\.|9\.|10\.|11\.|12\.)\s*/;
const QUESTION_MARKERS = /^(question|q\.?|no\.?|nr\.?)\s*\d+/i;
const MARKS_PATTERN = /\((\d+)\s*(marks?|pts?|points?)\)/i;
const ANSWER_PATTERNS = [
	/(?:answer|solution|r\.?|response)\s*[:.]\s*(.+)/i,
	/(?:\n|^)([A-Z][A-Z0-9.\s]{1,100})(?:\n|$)/,
];

export async function extractTextFromImage(
	imageData: string | Blob | File,
	onProgress?: (progress: number) => void
): Promise<OCRResult> {
	const worker = await createWorker('eng', 1, {
		logger: (m) => {
			if (m.status === 'recognizing text' && onProgress) {
				onProgress(m.progress * 100);
			}
		},
	});

	try {
		const result = await worker.recognize(imageData);
		const { text, confidence } = result.data;

		return {
			text: text.trim(),
			confidence,
			words: [],
		};
	} finally {
		await worker.terminate();
	}
}

export async function processScannedPDF(
	file: File,
	onProgress?: (progress: number) => void
): Promise<string> {
	const pdfjs = await import('pdfjs-dist');

	pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

	const arrayBuffer = await file.arrayBuffer();
	const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;

	const pages: string[] = [];
	const totalPages = pdf.numPages;

	for (let i = 1; i <= totalPages; i++) {
		const page = await pdf.getPage(i);
		const viewport = page.getViewport({ scale: 2 });

		const canvas = document.createElement('canvas');
		canvas.width = Math.floor(viewport.width);
		canvas.height = Math.floor(viewport.height);
		const ctx = canvas.getContext('2d');

		if (!ctx) throw new Error('Could not create canvas context');

		await page.render({
			canvasContext: ctx,
			canvas,
			viewport,
		}).promise;

		const blob = await new Promise<Blob>((resolve, reject) => {
			canvas.toBlob((b) => {
				if (b) resolve(b);
				else reject(new Error('Failed to convert canvas to blob'));
			}, 'image/png');
		});
		const result = await extractTextFromImage(blob, (p) => {
			onProgress?.(((i - 1) / totalPages + p / 100 / totalPages) * 100);
		});

		pages.push(result.text);
	}

	return pages.join('\n\n--- Page Break ---\n\n');
}

export function parsePastPaperText(text: string): ParsedQuestion[] {
	const questions: ParsedQuestion[] = [];
	const lines = text.split('\n');
	let currentQuestion: Partial<ParsedQuestion> | null = null;
	let currentText = '';

	for (const line of lines) {
		const trimmedLine = line.trim();
		if (!trimmedLine) continue;

		const isQuestionStart =
			SOUTH_AFRICAN_NUMBERING.test(trimmedLine) || QUESTION_MARKERS.test(trimmedLine);

		if (isQuestionStart) {
			if (currentQuestion && currentText) {
				currentQuestion.questionText = currentText.trim();
				const parsed = parseQuestionContent(currentQuestion);
				if (parsed) questions.push(parsed);
			}

			const numberMatch = trimmedLine.match(/^(\d+)/);
			const marksMatch = trimmedLine.match(MARKS_PATTERN);

			currentQuestion = {
				questionNumber: numberMatch ? Number.parseInt(numberMatch[1], 10) : questions.length + 1,
				marks: marksMatch ? Number.parseInt(marksMatch[1], 10) : undefined,
			};
			currentText = trimmedLine.replace(SOUTH_AFRICAN_NUMBERING, '').replace(QUESTION_MARKERS, '');
		} else if (currentQuestion) {
			if (currentText) {
				currentText += ` ${trimmedLine}`;
			} else {
				currentText = trimmedLine;
			}
		}
	}

	if (currentQuestion && currentText) {
		currentQuestion.questionText = currentText.trim();
		const parsed = parseQuestionContent(currentQuestion);
		if (parsed) questions.push(parsed);
	}

	return questions;
}

function parseQuestionContent(question: Partial<ParsedQuestion>): ParsedQuestion | null {
	if (!question.questionText) return null;

	let answerText: string | undefined;
	let cleanQuestionText = question.questionText;

	for (const pattern of ANSWER_PATTERNS) {
		const match = cleanQuestionText.match(pattern);
		if (match) {
			answerText = match[1].trim();
			cleanQuestionText = cleanQuestionText.replace(pattern, '').trim();
			break;
		}
	}

	let topic: string | undefined;
	const topicPatterns = [
		/(?:topic|chapter|section)\s*[:-]\s*([A-Za-z\s]+?)(?:\.|$)/i,
		/(?:from|in)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/,
	];

	for (const pattern of topicPatterns) {
		const match = cleanQuestionText.match(pattern);
		if (match) {
			topic = match[1].trim();
			break;
		}
	}

	return {
		questionText: cleanQuestionText,
		answerText,
		questionNumber: question.questionNumber || 0,
		marks: question.marks,
		topic,
	};
}

export function extractMathExpressions(text: string): string[] {
	const mathPatterns = [/\$[^$]+\$/g, /\\\[[^\\\]]+\\\]/g, /\\\([^)]+\\\)/g, /\$\$[^$]+\$\$/g];

	const expressions: string[] = [];

	for (const pattern of mathPatterns) {
		const matches = text.match(pattern);
		if (matches) {
			expressions.push(...matches);
		}
	}

	return [...new Set(expressions)];
}

export function cleanOCRText(text: string): string {
	return text
		.replace(/\s+/g, ' ')
		.replace(/[|]/g, 'l')
		.replace(/0(?=[A-Z])/g, 'O')
		.replace(/1(?=[A-Z])/g, 'I')
		.replace(/(\d+)\s*[xX]\s*(\d+)/g, '$1×$2')
		.replace(/(\d+)\s*[.]\s*(\d+)/g, '$1.$2')
		.trim();
}
