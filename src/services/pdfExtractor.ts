import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { logError, logInfo, logWarn, performance } from '@/lib/monitoring';
import { convertPdfToMarkdown, uploadMarkdownToUploadThing } from './markdownConverter';
import { extractQuestionsFromMarkdown } from './markdownExtractor';

// Types for extracted questions
export interface ExtractedOption {
	letter: string;
	text: string;
	isCorrect: boolean;
	explanation?: string;
}

export interface ExtractedQuestion {
	id: string;
	questionNumber: string;
	questionText: string;
	options?: ExtractedOption[];
	subQuestions?: {
		id: string;
		text: string;
		marks?: number;
		options?: ExtractedOption[];
	}[];
	marks: number;
	topic?: string;
	difficulty?: 'easy' | 'medium' | 'hard';
}

export interface ExtractedPaper {
	paperId: string;
	subject: string;
	paper: string;
	year: number;
	month: string;
	instructions?: string;
	questions: ExtractedQuestion[];
	extractedFromDb?: boolean;
	storedPdfUrl?: string;
	markdownFileUrl?: string;
}

export interface FlatQuestion {
	questionText: string;
	marks: number;
	topic: string;
	difficulty: 'easy' | 'medium' | 'hard';
	options: ExtractedOption[];
	questionNumber: string;
}

// Database types
interface PastPaperRecord {
	id: string;
	paper_id: string;
	original_pdf_url: string;
	stored_pdf_url: string | null;
	markdown_file_url: string | null;
	subject: string;
	paper: string;
	year: number;
	month: string;
	is_extracted: boolean;
	extracted_questions: ExtractedPaper | null;
	instructions: string | null;
	total_marks: number | null;
}

// Schemas for validation
export const extractedOptionSchema = z.object({
	letter: z.string(),
	text: z.string(),
	isCorrect: z.boolean(),
	explanation: z.string().optional(),
});

export const extractedQuestionSchema = z.object({
	id: z.string(),
	questionNumber: z.string(),
	questionText: z.string(),
	options: z.array(extractedOptionSchema).optional(),
	subQuestions: z
		.array(
			z.object({
				id: z.string(),
				text: z.string(),
				marks: z.number().optional(),
				options: z.array(extractedOptionSchema).optional(),
			})
		)
		.optional(),
	marks: z.number(),
	topic: z.string().optional(),
	difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
});

export const extractedPaperSchema = z.object({
	paperId: z.string(),
	subject: z.string(),
	paper: z.string(),
	year: z.number(),
	month: z.string(),
	instructions: z.string().optional(),
	questions: z.array(extractedQuestionSchema),
	markdownFileUrl: z.string().optional(),
});

// In-memory cache
const memoryCache: Map<string, ExtractedPaper> = new Map();

let ai: GoogleGenAI | null = null;

// Model fallback chain - use latest stable models
const MODEL_FALLBACKS = [
	'gemini-2.5-flash',
	'gemini-2.5-pro',
	'gemini-2.0-flash',
	'gemini-1.5-flash',
	'gemini-1.5-pro',
];

export function getAI(): GoogleGenAI | null {
	if (typeof window !== 'undefined') {
		console.warn(
			'[PDF Extractor] getAI called on client side. GEMINI_API_KEY will not be available.'
		);
	}
	if (!ai) {
		const apiKey = process.env.GEMINI_API_KEY;
		if (!apiKey) {
			console.warn('GEMINI_API_KEY not configured. AI features disabled.');
			return null;
		}
		ai = new GoogleGenAI({ apiKey });
	}
	return ai;
}

async function getModelWithFallback(): Promise<string> {
	const client = getAI();
	if (!client) throw new Error('AI service not configured.');

	// Test each model in the fallback chain
	for (const model of MODEL_FALLBACKS) {
		try {
			// Simple test to check if model is available
			await client.models.generateContent({
				model,
				contents: [{ role: 'user', parts: [{ text: 'test' }] }],
				config: { responseMimeType: 'text/plain' },
			});
			console.log(`[PDF Extractor] Using model: ${model}`);
			return model;
		} catch (error) {
			console.warn(`[PDF Extractor] Model ${model} not available:`, error);
		}
	}

	throw new Error(
		'No available Gemini models found. Please check your API key and model permissions.'
	);
}

function cleanJson(text: string): string {
	let cleaned = text.replace(/```json\n?|```/g, '').trim();
	// Handle cases where AI might add text before or after JSON
	const startIdx = cleaned.indexOf('{');
	const endIdx = cleaned.lastIndexOf('}');
	if (startIdx !== -1 && endIdx !== -1) {
		cleaned = cleaned.substring(startIdx, endIdx + 1);
	}
	return cleaned;
}

// Database operations
async function checkDbForPaper(paperId: string): Promise<PastPaperRecord | null> {
	try {
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/db/past-papers?paperId=${encodeURIComponent(paperId)}`
		);
		if (!response.ok) return null;
		const data = await response.json();
		return data.paper || null;
	} catch (error) {
		console.error('[PDF Extractor] DB check error:', error);
		return null;
	}
}

/**
 * Superpowered extraction using Gemini 3.0 Flash Preview (or 2.5 Flash as fallback)
 * Supports direct base64 input and page-by-page extraction if needed.
 */
export async function extractQuestionsFromPDF(
	paperId: string,
	pdfSource: string | { base64: string },
	subject: string,
	paper: string,
	year: number,
	month: string
): Promise<ExtractedPaper> {
	const startTime = Date.now();

	logInfo('pdf-extraction', `Starting extraction for ${paperId}`, {
		subject,
		paper,
		year,
		month,
		sourceType: typeof pdfSource === 'string' ? 'url' : 'base64',
	});

	try {
		// 1. Check Cache
		const memCached = memoryCache.get(paperId);
		if (memCached) {
			logInfo('pdf-extraction', `Cache hit for ${paperId}`, { cached: true });
			return { ...memCached, extractedFromDb: false };
		}

		// Only check DB if we have a paperId
		if (typeof pdfSource === 'string') {
			const dbRecord = await checkDbForPaper(paperId);
			if (dbRecord?.is_extracted && dbRecord.extracted_questions) {
				memoryCache.set(paperId, dbRecord.extracted_questions);
				logInfo('pdf-extraction', `DB cache hit for ${paperId}`, { cached: true });
				return {
					...dbRecord.extracted_questions,
					extractedFromDb: true,
					storedPdfUrl: dbRecord.stored_pdf_url || undefined,
					markdownFileUrl: dbRecord.markdown_file_url || undefined,
				};
			}
		}

		// 2. Get Base64 and attempt markdown conversion
		let base64: string;
		let extractedData: ExtractedPaper | null = null;

		if (typeof pdfSource === 'string') {
			// Try markdown conversion first
			logInfo('pdf-extraction', `Attempting markdown conversion for ${paperId}`);
			const markdownResult = await convertPdfToMarkdown(pdfSource);

			if (markdownResult.success && markdownResult.markdown) {
				logInfo(
					'pdf-extraction',
					`Markdown conversion successful for ${paperId}, extracting questions`
				);
				try {
					extractedData = await extractQuestionsFromMarkdown(
						markdownResult.markdown,
						paperId,
						subject,
						paper,
						year,
						month
					);

					// Upload markdown to UploadThing
					const markdownUpload = await uploadMarkdownToUploadThing(
						markdownResult.markdown,
						paperId
					);
					if (markdownUpload.success && markdownUpload.url) {
						extractedData.markdownFileUrl = markdownUpload.url;
					}
				} catch (error) {
					logWarn('pdf-extraction', `Markdown extraction failed for ${paperId}`, {
						error: error instanceof Error ? error.message : 'Unknown error',
					});
					// Fallback to PDF extraction
				}
			} else {
				logWarn('pdf-extraction', `Markdown conversion failed for ${paperId}`, {
					error: markdownResult.error,
				});
			}

			// If markdown failed, fetch PDF
			if (!extractedData) {
				logInfo('pdf-extraction', `Fetching PDF from URL for ${paperId} (fallback)`);
				const response = await fetch(pdfSource);
				if (!response.ok) throw new Error(`Failed to fetch PDF: ${response.statusText}`);
				const arrayBuffer = await response.arrayBuffer();
				base64 = Buffer.from(arrayBuffer).toString('base64');
			} else {
				// We have extractedData from markdown, just need to set base64 to something
				base64 = '';
			}
		} else {
			// Base64 already provided
			base64 = pdfSource.base64;
			logInfo('pdf-extraction', `Using base64 source for ${paperId}`);
		}

		// 3. Perform Extraction (if not already done via markdown)
		if (!extractedData) {
			logInfo('pdf-extraction', `Starting AI extraction from PDF for ${paperId}`);
			try {
				// Attempt full extraction first (efficient for most NSC papers)
				extractedData = await performFullExtraction(base64, paperId, subject, paper, year, month);
				logInfo('pdf-extraction', `Full extraction successful for ${paperId}`, {
					questionsCount: extractedData.questions.length,
					method: 'full',
				});
			} catch (error) {
				logWarn('pdf-extraction', `Full extraction failed for ${paperId}, trying fallback`, {
					error: error instanceof Error ? error.message : 'Unknown error',
				});
				// Fallback to page-by-page if full extraction fails
				extractedData = await performExtractionBySections(
					base64,
					paperId,
					subject,
					paper,
					year,
					month
				);
				logInfo('pdf-extraction', `Fallback extraction successful for ${paperId}`, {
					questionsCount: extractedData.questions.length,
					method: 'fallback',
				});
			}
		}

		// 4. Update memory cache
		memoryCache.set(paperId, extractedData);
		const duration = Date.now() - startTime;
		performance.recordExtractionTime(duration);

		logInfo('pdf-extraction', `Extraction completed for ${paperId}`, {
			duration: `${duration}ms`,
			questionsCount: extractedData.questions.length,
			success: true,
		});

		return extractedData;
	} catch (error) {
		const duration = Date.now() - startTime;
		logError('pdf-extraction', `Extraction failed for ${paperId}`, {
			error: error instanceof Error ? error.message : 'Unknown error',
			duration: `${duration}ms`,
		});
		throw error;
	}
}

async function performFullExtraction(
	base64: string,
	paperId: string,
	subject: string,
	paper: string,
	year: number,
	month: string
): Promise<ExtractedPaper> {
	const client = getAI();
	if (!client) throw new Error('AI service not configured.');

	// Get the best available model
	const model = await getModelWithFallback();

	const extractionPrompt = `You are a world-class educational AI specialized in South African NSC (National Senior Certificate) exam analysis.
Your task is to extract EVERY SINGLE question and sub-question from the provided PDF with 100% accuracy.

CONTEXT:
- Subject: ${subject}
- Paper: ${paper}
- Year: ${year}
- Month: ${month}

OUTPUT REQUIREMENTS:
Return a strictly valid JSON object following this schema:
{
  "paperId": "${paperId}",
  "subject": "${subject}",
  "paper": "${paper}",
  "year": ${year},
  "month": "${month}",
  "instructions": "Extract the 'INSTRUCTIONS AND INFORMATION' section exactly.",
  "questions": [
    {
      "id": "unique_id_1",
      "questionNumber": "1",
      "questionText": "The main stem of the question. If it's a multiple choice, include the stem here.",
      "options": [
        { "letter": "A", "text": "Option text", "isCorrect": false, "explanation": "Brief reasoning" }
      ],
      "subQuestions": [
        {
          "id": "1.1",
          "text": "Specific sub-question text",
          "marks": 5,
          "options": [] // Only if sub-question is MCQ
        }
      ],
      "marks": 15, // Total marks for Question 1
      "topic": "Identify the CAPS curriculum topic (e.g., 'Newton's Laws', 'Calculus', 'Organic Chemistry')",
      "difficulty": "easy" | "medium" | "hard"
    }
  ]
}

SPECIAL INSTRUCTIONS:
1. **Flattening Context**: If a question has a preamble (e.g., "Use the diagram below to answer..."), include that preamble in the 'questionText' of every sub-question if it's necessary for context.
2. **MCQs**: For Multiple Choice Questions, you MUST identify the correct answer based on your expert knowledge of the subject.
3. **Completeness**: Do not skip questions. If there are 10 questions in the paper, I expect 10 objects in the 'questions' array.
4. **Formatting**: Preserve mathematical notation using LaTeX where appropriate (e.g., $x^2$, $\frac{1}{2}$).
5. **No Hallucinations**: Only extract what is in the paper. If a topic is unclear, label it 'General'.
6. **Diagrams**: If a question refers to a diagram, include [Diagram: Description of what the diagram shows] in the question text.`;

	try {
		console.log(`[PDF Extractor] Using model ${model} for full extraction of ${paperId}`);

		const result = await (client as GoogleGenAI).models.generateContent({
			model,
			contents: [
				{
					role: 'user',
					parts: [
						{ text: extractionPrompt },
						{
							inlineData: {
								mimeType: 'application/pdf',
								data: base64,
							},
						},
					],
				},
			],
			config: {
				responseMimeType: 'application/json',
			},
		});

		if (!result.text) throw new Error('No response from AI');

		const cleaned = cleanJson(result.text);
		return extractedPaperSchema.parse(JSON.parse(cleaned));
	} catch (error) {
		console.error(`[PDF Extractor] Full extraction failed with model ${model}:`, error);
		throw error;
	}
}

async function performExtractionBySections(
	base64: string,
	paperId: string,
	subject: string,
	paper: string,
	year: number,
	month: string
): Promise<ExtractedPaper> {
	const client = getAI();
	if (!client) throw new Error('AI service not configured.');

	// Get the best available model for fallback
	const model = await getModelWithFallback();

	// In a real "page-by-page" we might split the PDF, but here we'll ask Gemini to do it in chunks
	// by focusing on sections. Since we don't have a PDF splitter here, we'll use a more descriptive prompt.
	const prompt = `Extract questions from this PDF paper page by page. Ensure NO question is missed.
Combine them into a single JSON structure for ${subject} ${paper} ${year} (${month}) with paperId ${paperId}.`;

	try {
		console.log(`[PDF Extractor] Using model ${model} for section extraction of ${paperId}`);

		const result = await (client as GoogleGenAI).models.generateContent({
			model,
			contents: [
				{
					role: 'user',
					parts: [
						{ text: prompt },
						{
							inlineData: {
								mimeType: 'application/pdf',
								data: base64,
							},
						},
					],
				},
			],
			config: {
				responseMimeType: 'application/json',
			},
		});

		if (!result.text) throw new Error('No response from AI');

		const cleaned = cleanJson(result.text);
		return extractedPaperSchema.parse(JSON.parse(cleaned));
	} catch (error) {
		console.error(`[PDF Extractor] Section extraction failed with model ${model}:`, error);
		throw error;
	}
}

export async function getCachedQuestions(paperId: string): Promise<ExtractedPaper | undefined> {
	// Check memory first
	const memCached = memoryCache.get(paperId);
	if (memCached) return memCached;

	return undefined;
}

export async function clearCache(): Promise<void> {
	memoryCache.clear();
}

export async function flattenExtractedPaper(paper: ExtractedPaper): Promise<FlatQuestion[]> {
	const flatQuestions: FlatQuestion[] = [];
	for (const q of paper.questions) {
		if (q.subQuestions && q.subQuestions.length > 0) {
			for (const sq of q.subQuestions) {
				flatQuestions.push({
					questionText: `${q.questionText}\n\n${sq.text}`,
					marks: sq.marks || 0,
					topic: q.topic || 'General',
					difficulty: (q.difficulty as 'easy' | 'medium' | 'hard') || 'medium',
					options: sq.options || q.options || [],
					questionNumber: sq.id,
				});
			}
		} else {
			flatQuestions.push({
				questionText: q.questionText,
				marks: q.marks,
				topic: q.topic || 'General',
				difficulty: (q.difficulty as 'easy' | 'medium' | 'hard') || 'medium',
				options: q.options || [],
				questionNumber: q.questionNumber,
			});
		}
	}
	return flatQuestions;
}
