import { z } from 'zod';
import { generateTextFromPDF } from '@/lib/ai/provider';
import { logError, logInfo, logWarn, performance } from '@/lib/monitoring';
import { convertPdfToMarkdown, uploadMarkdownToUploadThing } from './markdownConverter';
import { extractQuestionsFromMarkdown, UnsupportedSubjectError } from './markdownExtractor';

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

const memoryCache: Map<string, ExtractedPaper> = new Map();

function cleanJson(text: string): string {
	let cleaned = text.replace(/```json\n?|```/g, '').trim();
	const startIdx = cleaned.indexOf('{');
	const endIdx = cleaned.lastIndexOf('}');
	if (startIdx !== -1 && endIdx !== -1) {
		cleaned = cleaned.substring(startIdx, endIdx + 1);
	}
	return cleaned;
}

async function checkDbForPaper(paperId: string): Promise<PastPaperRecord | null> {
	try {
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/db/past-papers?paperId=${encodeURIComponent(paperId)}`
		);
		if (!response.ok) return null;
		const data = await response.json();
		return data.paper || null;
	} catch (error) {
		console.debug('[PDF Extractor] DB check error:', error);
		return null;
	}
}

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
		const memCached = memoryCache.get(paperId);
		if (memCached) {
			logInfo('pdf-extraction', `Cache hit for ${paperId}`, { cached: true });
			return { ...memCached, extractedFromDb: false };
		}

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

		let base64: string;
		let extractedData: ExtractedPaper | null = null;

		if (typeof pdfSource === 'string') {
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

					const markdownUpload = await uploadMarkdownToUploadThing(
						markdownResult.markdown,
						paperId
					);
					if (markdownUpload.success && markdownUpload.url) {
						extractedData.markdownFileUrl = markdownUpload.url;
					}
				} catch (error) {
					if (error instanceof UnsupportedSubjectError) {
						logWarn('pdf-extraction', `Unsupported subject for ${paperId}`, {
							reason: error.reason,
							suggestion: error.suggestion,
						});
						throw error;
					}
					logWarn('pdf-extraction', `Markdown extraction failed for ${paperId}`, {
						error: error instanceof Error ? error.message : 'Unknown error',
					});
				}
			} else {
				logWarn('pdf-extraction', `Markdown conversion failed for ${paperId}`, {
					error: markdownResult.error,
				});
			}

			if (!extractedData) {
				logInfo('pdf-extraction', `Fetching PDF from URL for ${paperId} (fallback)`);
				const response = await fetch(pdfSource);
				if (!response.ok) throw new Error(`Failed to fetch PDF: ${response.statusText}`);
				const arrayBuffer = await response.arrayBuffer();
				base64 = Buffer.from(arrayBuffer).toString('base64');
			} else {
				base64 = '';
			}
		} else {
			base64 = pdfSource.base64;
			logInfo('pdf-extraction', `Using base64 source for ${paperId}`);
		}

		if (!extractedData) {
			logInfo('pdf-extraction', `Starting AI extraction from PDF for ${paperId}`);
			try {
				extractedData = await performFullExtraction(base64, paperId, subject, paper, year, month);
				logInfo('pdf-extraction', `Full extraction successful for ${paperId}`, {
					questionsCount: extractedData.questions.length,
					method: 'full',
				});
			} catch (error) {
				logWarn('pdf-extraction', `Full extraction failed for ${paperId}, trying fallback`, {
					error: error instanceof Error ? error.message : 'Unknown error',
				});
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
          "options": []
        }
      ],
      "marks": 15,
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
		console.log(`[PDF Extractor] Starting full extraction for ${paperId}`);

		const result = await generateTextFromPDF(extractionPrompt, base64);

		const cleaned = cleanJson(result);
		return extractedPaperSchema.parse(JSON.parse(cleaned));
	} catch (error) {
		console.debug('[PDF Extractor] Full extraction failed:', error);
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
	const prompt = `Extract questions from this PDF paper page by page. Ensure NO question is missed.
Combine them into a single JSON structure for ${subject} ${paper} ${year} (${month}) with paperId ${paperId}.`;

	try {
		console.log(`[PDF Extractor] Starting section extraction for ${paperId}`);

		const result = await generateTextFromPDF(prompt, base64);

		const cleaned = cleanJson(result);
		return extractedPaperSchema.parse(JSON.parse(cleaned));
	} catch (error) {
		console.debug('[PDF Extractor] Section extraction failed:', error);
		throw error;
	}
}

export async function getCachedQuestions(paperId: string): Promise<ExtractedPaper | undefined> {
	return memoryCache.get(paperId);
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
