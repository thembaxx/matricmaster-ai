'use server';

import { z } from 'zod';
import { AI_MODELS, generateAI } from '@/lib/ai-config';

const explanationSchema = z.object({
	subject: z.string().min(1).max(100),
	topic: z.string().min(1).max(500),
});

const studyPlanSchema = z.object({
	subjects: z.array(z.string().min(1).max(100)).min(1).max(20),
	hours: z.number().min(1).max(168),
});

const searchSchema = z.object({
	query: z.string().min(1).max(500),
});

function sanitizeInput(input: string): string {
	return input.replace(/[<>]/g, '').trim().slice(0, 1000);
}

function cleanJson(text: string): string {
	return text.replace(/```json\n?|```/g, '').trim();
}

export async function getExplanationAction(subject: string, topic: string): Promise<string> {
	try {
		const validated = explanationSchema.parse({ subject, topic });

		const sanitizedSubject = sanitizeInput(validated.subject);
		const sanitizedTopic = sanitizeInput(validated.topic);

		const prompt = `You are an expert Grade 12 tutor in South Africa. Explain the topic "${sanitizedTopic}" in the subject "${sanitizedSubject}" in a way that is interactive and easy to understand for a student. Use simple analogies and highlight key formulas if applicable.`;

		const result = await generateAI({ prompt, model: AI_MODELS.PRIMARY });

		return result || "I'm sorry, I couldn't generate an explanation for this topic at the moment.";
	} catch (error) {
		if (error instanceof z.ZodError) {
			return 'Invalid input provided.';
		}
		console.debug('AI API Error:', error);
		return "Sorry, I couldn't generate an explanation right now. Please try again later.";
	}
}

export async function generateStudyPlanAction(subjects: string[], hours: number): Promise<string> {
	try {
		const validated = studyPlanSchema.parse({ subjects, hours });

		const sanitizedSubjects = validated.subjects.map(sanitizeInput);
		const sanitizedHours = Math.min(Math.max(validated.hours, 1), 168);

		const prompt = `Generate a focused Grade 12 study plan for these subjects: ${sanitizedSubjects.join(', ')}. The student has ${sanitizedHours} hours per week. Structure it as a daily quest path with specific topics to cover. Return as a list.`;

		const result = await generateAI({ prompt, model: AI_MODELS.PRIMARY });

		return result || "I'll help you create a plan soon!";
	} catch (error) {
		if (error instanceof z.ZodError) {
			return 'Invalid input provided.';
		}
		console.debug('Study Plan Generation Error:', error);
		return "I'll help you create a plan soon!";
	}
}

export async function smartSearchAction(
	query: string
): Promise<{ suggestions: string[]; tip: string } | null> {
	try {
		const validated = searchSchema.parse({ query });

		const sanitizedQuery = sanitizeInput(validated.query);

		const prompt = `Based on the search query "${sanitizedQuery}", suggest 3-4 specific Grade 12 South African curriculum topics or questions that a student might be looking for. Also provide a very brief (1 sentence) helpful tip related to the query. Format the response as a JSON object with keys "suggestions" (array of strings) and "tip" (string).`;

		const result = await generateAI({ prompt, model: AI_MODELS.PRIMARY });

		if (result) {
			const cleaned = cleanJson(result);
			const parsed = JSON.parse(cleaned) as unknown;

			if (
				typeof parsed === 'object' &&
				parsed !== null &&
				'suggestions' in parsed &&
				'tip' in parsed &&
				Array.isArray((parsed as { suggestions: unknown }).suggestions) &&
				typeof (parsed as { tip: unknown }).tip === 'string'
			) {
				return parsed as { suggestions: string[]; tip: string };
			}
		}
		return null;
	} catch (error) {
		if (error instanceof z.ZodError) {
			return null;
		}
		console.debug('Smart Search Error:', error);
		return null;
	}
}

const questionGenerationSchema = z.object({
	subject: z.string().min(1).max(100),
	topic: z.string().min(1).max(200),
	difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
	questionType: z
		.enum(['multiple_choice', 'true_false', 'short_answer'])
		.default('multiple_choice'),
	count: z.number().min(1).max(10).default(5),
});

export interface GeneratedQuestion {
	question: string;
	options?: string[];
	correctAnswer: string;
	explanation: string;
	topic: string;
	difficulty: string;
	marks: number;
}

export async function generateQuestionsAction(
	subject: string,
	topic: string,
	difficulty: 'easy' | 'medium' | 'hard' = 'medium',
	questionType: 'multiple_choice' | 'true_false' | 'short_answer' = 'multiple_choice',
	count = 5
): Promise<{ success: boolean; questions?: GeneratedQuestion[]; error?: string }> {
	try {
		const validated = questionGenerationSchema.parse({
			subject,
			topic,
			difficulty,
			questionType,
			count,
		});

		const sanitizedSubject = sanitizeInput(validated.subject);
		const sanitizedTopic = sanitizeInput(validated.topic);

		const questionTypeText = {
			multiple_choice: '4 multiple choice options (A, B, C, D)',
			true_false: 'true/false questions',
			short_answer: 'short answer questions requiring brief responses',
		}[validated.questionType];

		const difficultyText = {
			easy: 'basic recall and understanding questions',
			medium: 'application and analysis questions',
			hard: 'synthesis and evaluation questions',
		}[validated.difficulty];

		const prompt = `You are an expert Grade 12 South African NSC exam creator. Generate ${validated.count} ${validated.difficulty} ${sanitizedSubject} questions on the topic "${sanitizedTopic}". 

Requirements:
- Question type: ${questionTypeText}
- Difficulty level: ${difficultyText}
- Follow NSC exam conventions
- Include clear, unambiguous questions
- Ensure only ONE correct answer for multiple choice
- Include a detailed explanation for each correct answer

Format as JSON array with this structure:
[
  {
    "question": "question text here",
    "options": ["A) option", "B) option", "C) option", "D) option"] (only for multiple_choice),
    "correctAnswer": "correct answer here",
    "explanation": "detailed explanation of why this is correct",
    "topic": "${sanitizedTopic}",
    "difficulty": "${validated.difficulty}",
    "marks": number (1-5)
  }
]

Return ONLY valid JSON array, no other text.`;

		const result = await generateAI({ prompt, model: AI_MODELS.PRIMARY });

		if (result) {
			const cleaned = cleanJson(result);
			const parsed = JSON.parse(cleaned) as unknown;

			if (Array.isArray(parsed)) {
				const questions = parsed.map((q) => ({
					question: (q as { question: string }).question || '',
					options: (q as { options?: string[] }).options,
					correctAnswer: (q as { correctAnswer: string }).correctAnswer || '',
					explanation: (q as { explanation: string }).explanation || '',
					topic: sanitizedTopic,
					difficulty: validated.difficulty,
					marks: (q as { marks?: number }).marks || 2,
				})) as GeneratedQuestion[];

				return { success: true, questions };
			}
		}

		return { success: false, error: 'Failed to parse questions from AI response' };
	} catch (error) {
		if (error instanceof z.ZodError) {
			return { success: false, error: 'Invalid input provided' };
		}
		console.debug('Question Generation Error:', error);
		return { success: false, error: 'Failed to generate questions. Please try again.' };
	}
}

const mathSolutionSchema = z.object({
	subject: z.string().min(1).max(100),
	topic: z.string().min(1).max(200),
	problem: z.string().min(1).max(1000),
});

export interface MathStep {
	step: string;
	explanation: string;
	formula?: string;
}

export async function generateMathSolutionAction(
	subject: string,
	topic: string,
	problem: string
): Promise<{
	success: boolean;
	solution?: { steps: MathStep[]; finalAnswer: string; tips: string[] };
	error?: string;
}> {
	try {
		const validated = mathSolutionSchema.parse({
			subject,
			topic,
			problem,
		});

		const sanitizedSubject = sanitizeInput(validated.subject);
		const sanitizedTopic = sanitizeInput(validated.topic);
		const sanitizedProblem = sanitizeInput(validated.problem).slice(0, 1000);

		const prompt = `You are an expert Grade 12 Mathematics tutor in South Africa. Provide a detailed step-by-step solution for the following problem.

Subject: ${sanitizedSubject}
Topic: ${sanitizedTopic}
Problem: ${sanitizedProblem}

Requirements:
- Show ALL working steps clearly
- Explain each step in simple terms
- Highlight key formulas used (format as: **formula name**: formula)
- Provide the final answer clearly
- Give 2-3 tips for similar problems
- Use proper mathematical notation

Format as JSON:
{
  "steps": [
    {
      "step": "Step 1: what you're doing",
      "explanation": "why you're doing it",
      "formula": "any formula used (optional)"
    }
  ],
  "finalAnswer": "the final answer",
  "tips": ["tip 1", "tip 2", "tip 3"]
}

Return ONLY valid JSON, no other text.`;

		const result = await generateAI({ prompt, model: AI_MODELS.PRIMARY });

		if (result) {
			const cleaned = cleanJson(result);
			const parsed = JSON.parse(cleaned) as unknown;

			if (
				typeof parsed === 'object' &&
				parsed !== null &&
				'steps' in parsed &&
				'finalAnswer' in parsed &&
				'tips' in parsed
			) {
				return {
					success: true,
					solution: {
						steps: (parsed as { steps: MathStep[] }).steps || [],
						finalAnswer: (parsed as { finalAnswer: string }).finalAnswer || '',
						tips: (parsed as { tips: string[] }).tips || [],
					},
				};
			}
		}

		return { success: false, error: 'Failed to parse solution from AI response' };
	} catch (error) {
		if (error instanceof z.ZodError) {
			return { success: false, error: 'Invalid input provided' };
		}
		console.debug('Math Solution Error:', error);
		return { success: false, error: 'Failed to generate solution. Please try again.' };
	}
}

const flashcardGenerationSchema = z.object({
	subject: z.string().min(1).max(100),
	topic: z.string().min(1).max(200),
	count: z.number().min(1).max(20).default(10),
});

export interface GeneratedFlashcard {
	front: string;
	back: string;
	difficulty: 'easy' | 'medium' | 'hard';
}

export async function generateFlashcardContentAction(
	subject: string,
	topic: string,
	count = 10
): Promise<GeneratedFlashcard[]> {
	try {
		const validated = flashcardGenerationSchema.parse({ subject, topic, count });

		const sanitizedSubject = sanitizeInput(validated.subject);
		const sanitizedTopic = sanitizeInput(validated.topic);

		const prompt = `You are an expert Grade 12 South African NSC tutor. Generate ${validated.count} flashcards for the subject "${sanitizedSubject}" on the topic "${sanitizedTopic}".

Requirements:
- Front: A clear question or concept prompt
- Back: A concise, accurate answer suitable for exam revision
- Difficulty: Assign 'easy', 'medium', or 'hard' to each card
- Cover key definitions, formulas, processes, and common exam questions
- Follow South African NSC curriculum standards

Format as JSON array:
[
  {
    "front": "question or concept here",
    "back": "answer here",
    "difficulty": "easy" | "medium" | "hard"
  }
]

Return ONLY valid JSON array, no other text.`;

		const result = await generateAI({ prompt, model: AI_MODELS.PRIMARY });

		if (result) {
			const cleaned = cleanJson(result);
			const parsed = JSON.parse(cleaned) as unknown;

			if (Array.isArray(parsed)) {
				return parsed
					.filter(
						(item): item is Record<string, unknown> => typeof item === 'object' && item !== null
					)
					.map((item) => {
						const difficulty =
							item.difficulty === 'easy' || item.difficulty === 'hard' ? item.difficulty : 'medium';
						return {
							front: typeof item.front === 'string' ? item.front : '',
							back: typeof item.back === 'string' ? item.back : '',
							difficulty: difficulty as 'easy' | 'medium' | 'hard',
						};
					})
					.filter((card) => card.front && card.back);
			}
		}

		return [];
	} catch (error) {
		if (error instanceof z.ZodError) {
			return [];
		}
		console.debug('Flashcard Generation Error:', error);
		return [];
	}
}

const essayFeedbackSchema = z.object({
	essayTopic: z.string().min(1).max(500),
	essayContent: z.string().min(1).max(5000),
	wordCount: z.number().min(50).max(2000).optional(),
});

export interface EssayFeedback {
	score: number;
	grade: string;
	strengths: string[];
	areasForImprovement: string[];
	suggestions: string[];
	formattingFeedback: string;
	overallFeedback: string;
}

export async function generateEssayFeedbackAction(
	essayTopic: string,
	essayContent: string,
	wordCount?: number
): Promise<{ success: boolean; feedback?: EssayFeedback; error?: string }> {
	try {
		const validated = essayFeedbackSchema.parse({
			essayTopic,
			essayContent,
			wordCount,
		});

		const sanitizedTopic = sanitizeInput(validated.essayTopic);
		const sanitizedContent = sanitizeInput(validated.essayContent).slice(0, 5000);

		const prompt = `You are an expert English teacher and essay grader for South African Grade 12 NSC exams. Provide detailed feedback on the following essay.

Essay Topic: ${sanitizedTopic}
Word Count: ${validated.wordCount || Math.ceil(sanitizedContent.split(' ').length)}

Essay Content:
${sanitizedContent}

Requirements:
- Evaluate based on NSC English Paper 3 criteria
- Score out of 100
- Provide constructive feedback
- Identify specific strengths and weaknesses
- Give actionable suggestions for improvement

Format as JSON:
{
  "score": number (0-100),
  "grade": "letter grade (A+, A, B+, B, C+, C, D, F)",
  "strengths": ["specific strength 1", "specific strength 2", "specific strength 3"],
  "areasForImprovement": ["specific area 1", "specific area 2", "specific area 3"],
  "suggestions": ["actionable suggestion 1", "actionable suggestion 2", "actionable suggestion 3"],
  "formattingFeedback": "feedback on structure, paragraphs, and formatting",
  "overallFeedback": "2-3 sentence summary encouraging improvement"
}

Return ONLY valid JSON, no other text.`;

		const result = await generateAI({ prompt, model: AI_MODELS.PRIMARY });

		if (result) {
			const cleaned = cleanJson(result);
			const parsed = JSON.parse(cleaned) as unknown;

			if (
				typeof parsed === 'object' &&
				parsed !== null &&
				'score' in parsed &&
				'grade' in parsed &&
				'strengths' in parsed
			) {
				const feedback = parsed as Record<string, unknown>;
				return {
					success: true,
					feedback: {
						score: typeof feedback.score === 'number' ? feedback.score : 0,
						grade: typeof feedback.grade === 'string' ? feedback.grade : 'F',
						strengths: Array.isArray(feedback.strengths) ? feedback.strengths : [],
						areasForImprovement: Array.isArray(feedback.areasForImprovement)
							? (feedback.areasForImprovement as string[])
							: [],
						suggestions: Array.isArray(feedback.suggestions)
							? (feedback.suggestions as string[])
							: [],
						formattingFeedback:
							typeof feedback.formattingFeedback === 'string' ? feedback.formattingFeedback : '',
						overallFeedback:
							typeof feedback.overallFeedback === 'string' ? feedback.overallFeedback : '',
					},
				};
			}
		}

		return { success: false, error: 'Failed to parse feedback from AI response' };
	} catch (error) {
		if (error instanceof z.ZodError) {
			return { success: false, error: 'Invalid input provided' };
		}
		console.debug('Essay Feedback Error:', error);
		return { success: false, error: 'Failed to generate feedback. Please try again.' };
	}
}
