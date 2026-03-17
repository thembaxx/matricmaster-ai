import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';

const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY || '' });
const geminiModel = google('gemini-2.5-flash');

export interface LearningLoopAction {
	type: 'generateFlashcard' | 'addToStudyPlan' | 'findSimilarQuestions' | 'generateNotes';
	priority: 'high' | 'medium' | 'low';
	title: string;
	description: string;
	metadata?: Record<string, unknown>;
}

export async function analyzeSolvedProblem(
	problemText: string,
	solution: string,
	subject: string,
	topic: string
): Promise<LearningLoopAction[]> {
	const prompt = `
Analyze this solved problem and suggest follow-up learning actions:

Problem: ${problemText}
Solution: ${solution}
Subject: ${subject}
Topic: ${topic}

Return 2-4 learning actions the student should take next. Each action should be one of these types:
- "generateFlashcard": Create a flashcard for key concept
- "addToStudyPlan": Add this topic to study schedule
- "findSimilarQuestions": Find similar past paper questions
- "generateNotes": Create study notes from this problem

For each action, include:
- type: one of the above
- priority: "high", "medium", or "low"
- title: short actionable title
- description: why this action is valuable

Return as JSON array:
[
  {
    "type": "generateFlashcard",
    "priority": "high", 
    "title": "Create flashcard for [concept]",
    "description": "This concept frequently appears in exams"
  }
]
`;

	try {
		const { object } = await generateObject({
			model: geminiModel,
			schema: z.array(
				z.object({
					type: z.enum([
						'generateFlashcard',
						'addToStudyPlan',
						'findSimilarQuestions',
						'generateNotes',
					]),
					priority: z.enum(['high', 'medium', 'low']),
					title: z.string(),
					description: z.string(),
				})
			),
			prompt,
		});

		return object.map((item) => ({
			...item,
			metadata: { subject, topic },
		}));
	} catch (error) {
		console.debug('Failed to analyze problem:', error);
		return [];
	}
}

export async function generateNotesFromConversation(
	transcript: string,
	subject?: string
): Promise<{
	title: string;
	summary: string;
	keyPoints: string[];
	topics: string[];
}> {
	const prompt = `
Convert this voice tutor conversation into structured study notes:

Transcript:
${transcript}

${subject ? `Subject: ${subject}` : ''}

Return as JSON:
{
  "title": "Study notes title",
  "summary": "2-3 sentence summary of key learning",
  "keyPoints": ["Point 1", "Point 2", ...],
  "topics": ["topic1", "topic2", ...]
}
`;

	const { object } = await generateObject({
		model: geminiModel,
		schema: z.object({
			title: z.string(),
			summary: z.string(),
			keyPoints: z.array(z.string()),
			topics: z.array(z.string()),
		}),
		prompt,
	});

	return object;
}

export async function generateFlashcardsFromVoice(
	transcript: string,
	subject?: string
): Promise<Array<{ front: string; back: string }>> {
	const prompt = `
Convert this voice note into flashcards. Extract key concepts and create Q&A pairs:

Transcript:
${transcript}

${subject ? `Subject: ${subject}` : ''}

Return as JSON array (3-6 flashcards):
[
  { "front": "Question 1", "back": "Answer 1" },
  { "front": "Question 2", "back": "Answer 2" }
]
`;

	const { object } = await generateObject({
		model: geminiModel,
		schema: z.array(
			z.object({
				front: z.string(),
				back: z.string(),
			})
		),
		prompt,
	});

	return object;
}
