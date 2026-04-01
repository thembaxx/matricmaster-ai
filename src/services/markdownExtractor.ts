import { isNSCSupportedSubject } from '@/content';
import { generateTextWithAI } from '@/lib/ai/provider';
import { logInfo, logWarn } from '@/lib/monitoring';
import { type ExtractedPaper, extractedPaperSchema } from './pdfExtractor';

const extractionPrompt = `You are a world-class educational AI specialized in South African NSC (National Senior Certificate) exam analysis.
Your task is to extract EVERY SINGLE question and sub-question from the provided markdown-formatted exam paper with 100% accuracy.

CONTEXT:
- Subject: {subject}
- Paper: {paper}
- Year: {year}
- Month: {month}

IMPORTANT: This should be a Grade 12 NSC (National Senior Certificate) exam paper from South Africa.

OUTPUT REQUIREMENTS:
Return a strictly valid JSON object following this schema:
{
  "paperId": "{paperId}",
  "subject": "{subject}",
  "paper": "{paper}",
  "year": {year},
  "month": "{month}",
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
      "difficulty": "easy, medium, or hard"
    }
  ]
}

SPECIAL INSTRUCTIONS:
1. **Parsing Markdown**: The content is in markdown format. Look for question numbers like "1.", "2.", "1.1", etc.
2. **MCQs**: For Multiple Choice Questions, you MUST identify the correct answer based on your expert knowledge of the subject.
3. **Completeness**: Do not skip questions. If there are 10 questions in the paper, I expect 10 objects in the 'questions' array.
4. **Formatting**: Preserve mathematical notation using LaTeX where appropriate (e.g., $x^2$, $\frac{1}{2}$).
5. **No Hallucinations**: Only extract what is in the paper. If a topic is unclear, label it 'General'.
6. **Diagrams**: If a question refers to a diagram, include [Diagram: Description of what the diagram shows] in the question text.`;

const unsupportedSubjectPrompt = `You are an educational AI assistant. The user has uploaded a document that may not be a South African NSC Grade 12 exam paper.

CONTEXT:
- Subject: {subject}
- Paper: {paper}
- Year: {year}
- Month: {month}

TASK:
1. First, determine if this appears to be a valid exam paper with questions
2. If it IS a valid exam paper with multiple questions, extract them following the standard format
3. If it does NOT appear to be a valid exam paper (e.g., it's a textbook chapter, notes, marking guidelines only, or a non-NSC curriculum), return a special response

If it's NOT a valid NSC Grade 12 exam paper, return ONLY this JSON (no other text):
{
  "isUnsupported": true,
  "reason": "Brief explanation of why this is not supported (e.g., 'This appears to be a university-level exam', 'This is a marking guideline not a question paper', 'This is not from the NSC curriculum')",
  "suggestion": "A helpful suggestion for the user"
}

If it IS a valid exam paper, return the standard extraction format.`;

export class UnsupportedSubjectError extends Error {
	reason: string;
	suggestion: string;

	constructor(reason: string, suggestion: string) {
		super(reason);
		this.name = 'UnsupportedSubjectError';
		this.reason = reason;
		this.suggestion = suggestion;
	}
}

function extractJsonFromText(text: string): string {
	let cleaned = text.replace(/```json\n?|```/g, '').trim();
	const startIdx = cleaned.indexOf('{');
	const endIdx = cleaned.lastIndexOf('}');
	if (startIdx !== -1 && endIdx !== -1) {
		cleaned = cleaned.substring(startIdx, endIdx + 1);
	}
	return cleaned;
}

export async function extractQuestionsFromMarkdown(
	markdown: string,
	paperId: string,
	subject: string,
	paper: string,
	year: number,
	month: string
): Promise<ExtractedPaper> {
	if (!process.env.GEMINI_API_KEY) {
		throw new Error('AI service not configured');
	}

	logInfo('markdown-extractor', `Extracting questions from markdown for ${paperId}`, { subject });

	const isSupported = isNSCSupportedSubject(subject);

	const promptTemplate = isSupported ? extractionPrompt : unsupportedSubjectPrompt;
	const prompt = promptTemplate
		.replace(/{subject}/g, subject)
		.replace(/{paper}/g, paper)
		.replace(/{year}/g, year.toString())
		.replace(/{month}/g, month)
		.replace(/{paperId}/g, paperId);

	try {
		const result = await generateTextWithAI({
			prompt: `${prompt}\n\n---\n\nMARKDOWN CONTENT:\n\n${markdown}`,
		});

		const cleaned = extractJsonFromText(result);
		const parsed = JSON.parse(cleaned);

		if (parsed.isUnsupported === true) {
			logWarn('markdown-extractor', `Unsupported subject detected for ${paperId}`, {
				subject,
				reason: parsed.reason,
			});
			throw new UnsupportedSubjectError(
				parsed.reason || 'This document does not appear to be a valid NSC Grade 12 exam paper',
				parsed.suggestion ||
					'Please upload a South African NSC Grade 12 past paper for best results'
			);
		}

		logInfo('markdown-extractor', `Extraction successful for ${paperId}`, {
			questionsCount: parsed.questions?.length || 0,
		});

		return extractedPaperSchema.parse(parsed);
	} catch (error) {
		if (error instanceof UnsupportedSubjectError) {
			throw error;
		}

		logWarn('markdown-extractor', `Initial extraction failed for ${paperId}, attempting fallback`, {
			error: error instanceof Error ? error.message : 'Unknown error',
			subject,
		});

		if (!isSupported) {
			const fallbackPrompt = `The user uploaded a document for subject "${subject}". Try to extract any questions you can find, even if it's not a standard NSC format. 

Return a JSON with questions if you find any, or return:
{"isUnsupported": true, "reason": "...", "suggestion": "..."}

Markdown content:
${markdown}`;

			try {
				const fallbackResult = await generateTextWithAI({
					prompt: fallbackPrompt,
				});

				const cleaned = extractJsonFromText(fallbackResult);
				const parsed = JSON.parse(cleaned);

				if (parsed.isUnsupported === true) {
					throw new UnsupportedSubjectError(
						parsed.reason || 'This document does not appear to be a valid exam paper',
						parsed.suggestion ||
							'Lumni AI specializes in South African NSC Grade 12 curriculum. Please upload an NSC past paper for the best experience.'
					);
				}

				return extractedPaperSchema.parse(parsed);
			} catch (fallbackError) {
				if (fallbackError instanceof UnsupportedSubjectError) {
					throw fallbackError;
				}
				logWarn('markdown-extractor', `Fallback extraction also failed for ${paperId}`, {
					error: fallbackError instanceof Error ? fallbackError.message : 'Unknown error',
				});
			}
		}

		throw new UnsupportedSubjectError(
			"We couldn't extract questions from this document",
			'Lumni AI focuses on South African NSC Grade 12 exam papers. Please upload a valid NSC past paper (Mathematics, Physics, Chemistry, Life Sciences, English, Geography, History, Accounting, or Economics).'
		);
	}
}
