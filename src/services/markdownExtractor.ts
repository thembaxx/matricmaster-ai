'use server';

import { GoogleGenAI } from '@google/genai';
import { logInfo } from '@/lib/monitoring';
import { type ExtractedPaper, extractedPaperSchema } from './pdfExtractor';

const extractionPrompt = `You are a world-class educational AI specialized in South African NSC (National Senior Certificate) exam analysis.
Your task is to extract EVERY SINGLE question and sub-question from the provided markdown-formatted exam paper with 100% accuracy.

CONTEXT:
- Subject: {subject}
- Paper: {paper}
- Year: {year}
- Month: {month}

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
          "options": [] // Only if sub-question is MCQ
        }
      ],
      "marks": 15,
      "topic": "Identify the CAPS curriculum topic (e.g., 'Newton's Laws', 'Calculus', 'Organic Chemistry')",
      "difficulty": "easy" | "medium" | "hard"
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

export async function extractQuestionsFromMarkdown(
	markdown: string,
	paperId: string,
	subject: string,
	paper: string,
	year: number,
	month: string
): Promise<ExtractedPaper> {
	const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
	if (!ai) {
		throw new Error('AI service not configured');
	}

	logInfo('markdown-extractor', `Extracting questions from markdown for ${paperId}`);

	const prompt = extractionPrompt
		.replace(/{subject}/g, subject)
		.replace(/{paper}/g, paper)
		.replace(/{year}/g, year.toString())
		.replace(/{month}/g, month)
		.replace(/{paperId}/g, paperId);

	const result = await ai.models.generateContent({
		model: 'gemini-2.5-flash',
		contents: [
			{
				role: 'user',
				parts: [{ text: prompt }, { text: `\n\n---\n\nMARKDOWN CONTENT:\n\n${markdown}` }],
			},
		],
		config: { responseMimeType: 'application/json' },
	});

	if (!result.text) {
		throw new Error('No response from AI');
	}

	const cleaned = result.text.replace(/```json\n?|```/g, '').trim();
	const parsed = JSON.parse(cleaned);

	logInfo('markdown-extractor', `Extraction successful for ${paperId}`, {
		questionsCount: parsed.questions?.length || 0,
	});

	return extractedPaperSchema.parse(parsed);
}
