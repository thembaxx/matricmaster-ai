'use server';

import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { uploadPdfFromUrl } from '@/lib/pdf-upload';

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
}

export interface FlatQuestion {
	questionText: string;
	marks: number;
	topic: string;
	difficulty: 'easy' | 'medium' | 'hard';
	options: ExtractedOption[];
	questionNumber: string;
}

// Database types (for reference - we'll use raw SQL via fetch)
interface PastPaperRecord {
	id: string;
	paper_id: string;
	original_pdf_url: string;
	stored_pdf_url: string | null;
	subject: string;
	paper: string;
	year: number;
	month: string;
	is_extracted: boolean;
	extracted_questions: ExtractedPaper | null;
	instructions: string | null;
	total_marks: number | null;
}

const extractedOptionSchema = z.object({
	letter: z.string().length(1),
	text: z.string(),
	isCorrect: z.boolean(),
	explanation: z.string().optional(),
});

// Schema for validation
const extractedQuestionSchema = z.object({
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

const extractedPaperSchema = z.object({
	paperId: z.string(),
	subject: z.string(),
	paper: z.string(),
	year: z.number(),
	month: z.string(),
	instructions: z.string().optional(),
	questions: z.array(extractedQuestionSchema),
});

// In-memory cache (fallback if DB is unavailable)
const memoryCache: Map<string, ExtractedPaper> = new Map();

let ai: GoogleGenAI | null = null;

function getAI(): GoogleGenAI | null {
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

function cleanJson(text: string): string {
	let cleaned = text.replace(/```json\n?|```/g, '').trim();
	cleaned = cleaned.trim();
	return cleaned;
}

// Database operations
async function checkDbForPaper(paperId: string): Promise<PastPaperRecord | null> {
	try {
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/db/past-papers?paperId=${encodeURIComponent(paperId)}`
		);
		if (!response.ok) {
			console.log('[PDF Extractor] DB check failed, status:', response.status);
			return null;
		}
		const data = await response.json();
		return data.paper || null;
	} catch (error) {
		console.error('[PDF Extractor] DB check error:', error);
		return null;
	}
}

async function savePaperToDb(
	paperId: string,
	pdfUrl: string,
	subject: string,
	paper: string,
	year: number,
	month: string,
	extractedData: ExtractedPaper,
	storedPdfUrl?: string
): Promise<void> {
	try {
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/db/past-papers`,
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					paperId,
					originalPdfUrl: pdfUrl,
					storedPdfUrl: storedPdfUrl || null,
					subject,
					paper,
					year,
					month,
					isExtracted: true,
					extractedQuestions: extractedData,
					instructions: extractedData.instructions || null,
				}),
			}
		);
		if (!response.ok) {
			console.error('[PDF Extractor] Failed to save to DB:', response.status);
		}
	} catch (error) {
		console.error('[PDF Extractor] DB save error:', error);
	}
}

async function uploadPdfToUploadThing(pdfUrl: string): Promise<string | null> {
	try {
		// Upload PDF to UploadThing for backup/hosting
		const result = await uploadPdfFromUrl(pdfUrl);

		if (result.success && result.url) {
			console.log('[PDF Extractor] PDF uploaded to UploadThing:', result.url);
			return result.url;
		}

		// If upload fails, return original URL as fallback
		console.warn('[PDF Extractor] PDF upload failed, using original URL:', result.error);
		return pdfUrl;
	} catch (error) {
		console.error('[PDF Extractor] UploadThing error:', error);
		// Return original URL as fallback
		return pdfUrl;
	}
}

export async function extractQuestionsFromPDF(
	paperId: string,
	pdfUrl: string,
	subject: string,
	paper: string,
	year: number,
	month: string
): Promise<ExtractedPaper> {
	// Step 1: Check memory cache first (fastest)
	const memCached = memoryCache.get(paperId);
	if (memCached) {
		console.log(`[PDF Extractor] Using memory cache for ${paperId}`);
		return { ...memCached, extractedFromDb: false };
	}

	// Step 2: Check database
	const dbRecord = await checkDbForPaper(paperId);
	if (dbRecord?.is_extracted && dbRecord.extracted_questions) {
		console.log(`[PDF Extractor] Using database cache for ${paperId}`);
		memoryCache.set(paperId, dbRecord.extracted_questions);
		return {
			...dbRecord.extracted_questions,
			extractedFromDb: true,
			storedPdfUrl: dbRecord.stored_pdf_url || undefined,
		};
	}

	// Step 3: Extract using Gemini API
	console.log(`[PDF Extractor] Extracting questions from PDF: ${paperId}`);
	const extractedData = await performPdfExtraction(paperId, pdfUrl, subject, paper, year, month);

	// Step 4: Validate extracted data - don't save empty/invalid data
	if (!extractedData.questions || extractedData.questions.length === 0) {
		console.log('[PDF Extractor] No questions extracted, will use PDF viewer fallback');
		throw new Error('Failed to extract questions from PDF. Please use the PDF viewer.');
	}

	// Step 5: Upload PDF to UploadThing (optional - saves on API calls)
	const storedPdfUrl = await uploadPdfToUploadThing(pdfUrl);

	// Step 6: Save to database only if extraction was successful
	await savePaperToDb(
		paperId,
		pdfUrl,
		subject,
		paper,
		year,
		month,
		extractedData,
		storedPdfUrl || undefined
	);

	// Step 7: Update memory cache
	memoryCache.set(paperId, extractedData);

	console.log(`[PDF Extractor] Successfully extracted ${extractedData.questions.length} questions`);

	return { ...extractedData, extractedFromDb: false, storedPdfUrl: storedPdfUrl || undefined };
}

async function performPdfExtraction(
	paperId: string,
	pdfUrl: string,
	subject: string,
	paper: string,
	year: number,
	month: string
): Promise<ExtractedPaper> {
	const client = getAI();
	if (!client) {
		throw new Error('AI service not configured. Please set GEMINI_API_KEY.');
	}

	console.log(`[PDF Extractor] Fetching PDF from ${pdfUrl}`);

	try {
		// Fetch the PDF
		const response = await fetch(pdfUrl);
		if (!response.ok) {
			throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
		}

		const arrayBuffer = await response.arrayBuffer();
		const base64 = Buffer.from(arrayBuffer).toString('base64');

		// Use Gemini to extract questions
		const extractionPrompt = `You are an expert at extracting exam questions from NSC (National Senior Certificate) South African past papers. 

Extract ALL questions from this exam paper and return a JSON object with this exact structure:

{
  "paperId": "${paperId}",
  "subject": "${subject}",
  "paper": "${paper}",
  "year": ${year},
  "month": "${month}",
  "instructions": "Extract the exam instructions text",
  "questions": [
    {
      "id": "1",
      "questionNumber": "1",
      "questionText": "Full question text including any diagrams or tables described",
      "options": [
        { "letter": "A", "text": "Option A text", "isCorrect": false, "explanation": "Why this is correct or incorrect" }
      ],
      "subQuestions": [
        {
          "id": "1.1",
          "text": "Sub-question text",
          "marks": 5,
          "options": [
             { "letter": "A", "text": "Option A text", "isCorrect": true, "explanation": "..." }
          ]
        }
      ],
      "marks": 25,
      "topic": "Detected topic name",
      "difficulty": "easy" | "medium" | "hard"
    }
  ]
}

IMPORTANT:
1. Extract EVERY question from the paper (questions 1-10 or more)
2. Include ALL sub-questions (1.1, 1.2, 2.1, etc.)
3. Include the marks for each question/sub-question if available
4. Detect the topic/topic area for each question
5. For Multiple Choice Questions, extract the options and identify the correct answer if possible.
6. Return ONLY valid JSON, no additional text
7. If you cannot see the full question clearly, still include what you can see

Format the response as a JSON object.`;

		const result = await client.models.generateContent({
			model: 'gemini-2.5-flash',
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

		const responseText = result.text;
		if (!responseText) {
			throw new Error('No response from AI');
		}

		const cleaned = cleanJson(responseText);
		const parsed = JSON.parse(cleaned);

		// Validate the response
		const validated = extractedPaperSchema.parse(parsed);

		return validated;
	} catch (error) {
		console.error('[PDF Extractor] Error extracting questions:', error);
		throw error;
	}
}

export async function getCachedQuestions(paperId: string): Promise<ExtractedPaper | undefined> {
	// Check memory first
	const memCached = memoryCache.get(paperId);
	if (memCached) return memCached;

	// Note: For production, you'd also check DB here
	return undefined;
}

export async function clearCache(): Promise<void> {
	memoryCache.clear();
}

/**
 * Flattens a complex exam paper structure into a flat list of questions
 * suitable for the database's question bank.
 */
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
