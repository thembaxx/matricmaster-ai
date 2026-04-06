'use server';

import { z } from 'zod';
import { getRecommendedTopics } from '@/actions/curriculum-prerequisites';
import {
	formatFallbackContent,
	getFallbackResponse,
	hasFallbackContent,
} from '@/lib/ai/fallbackContent';
import { AI_MODELS, generateAI } from '@/lib/ai-config';
import type { UserLearningProfile } from '@/types/learning-profile';

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

export async function getExplanationAction(
	subject: string,
	topic: string,
	userProfile?: UserLearningProfile
): Promise<string> {
	let sanitizedSubject = '';
	let sanitizedTopic = '';

	try {
		const validated = explanationSchema.parse({ subject, topic });

		sanitizedSubject = sanitizeInput(validated.subject);
		sanitizedTopic = sanitizeInput(validated.topic);

		// Build personalized context
		let personalizationContext = '';

		if (userProfile) {
			const subjectMastery = userProfile.subjectMastery[sanitizedSubject];
			const topicScore = subjectMastery?.topicScores[sanitizedTopic] || 0;

			personalizationContext = `
Learning Profile Context:
- Preferred difficulty: ${userProfile.preferredDifficulty}
- Learning style: ${userProfile.learningStyle}
- Current mastery level for this topic: ${topicScore}/100
- Subject overall score: ${subjectMastery?.overallScore || 0}/100
- Preferred content types: ${userProfile.preferredContentTypes.join(', ')}
- Weak areas to focus on: ${userProfile.weakAreas.filter((area) => area.includes(sanitizedTopic) || area.includes(sanitizedSubject)).join(', ') || 'none specified'}

Recent interactions with this topic: ${
				userProfile.interactionHistory
					.filter((i) => i.subject === sanitizedSubject && i.topic === sanitizedTopic)
					.slice(-3)
					.map((i) => `${i.action} (${i.performance ? `${i.performance}%` : 'no score'})`)
					.join(', ') || 'none'
			}`;
		}

		const prompt = `You are an expert Grade 12 tutor in South Africa specializing in personalized education. Explain the topic "${sanitizedTopic}" in the subject "${sanitizedSubject}" in a way that is interactive and easy to understand for a student.

${
	personalizationContext
		? `ADAPT YOUR EXPLANATION BASED ON THIS STUDENT'S PROFILE:${personalizationContext}

INSTRUCTIONS FOR PERSONALIZATION:
- Adjust explanation complexity based on their mastery level and preferred difficulty
- Use analogies and examples that match their learning style (${userProfile?.learningStyle})
- Focus on areas they struggle with in weak areas
- Incorporate their preferred content types (${userProfile?.preferredContentTypes.join(', ')})
- Build on their recent interactions and progress`
		: 'Use simple analogies and highlight key formulas if applicable.'
}`;

		const result = await generateAI({ prompt, model: AI_MODELS.PRIMARY });

		return result || "I'm sorry, I couldn't generate an explanation for this topic at the moment.";
	} catch (error) {
		if (error instanceof z.ZodError) {
			return 'Invalid input provided.';
		}
		console.debug('AI API Error:', error);

		if (
			sanitizedSubject &&
			sanitizedTopic &&
			hasFallbackContent(sanitizedSubject, sanitizedTopic)
		) {
			const fallback = getFallbackResponse(sanitizedSubject, sanitizedTopic);
			if (fallback) {
				return formatFallbackContent(fallback);
			}
		}

		return "Sorry, I couldn't generate an explanation right now. Try reviewing your cached flashcards or past papers while we reconnect.";
	}
}

export async function generateStudyPlanAction(subjects: string[], hours: number): Promise<string> {
	try {
		const validated = studyPlanSchema.parse({ subjects, hours });

		const sanitizedSubjects = validated.subjects.map(sanitizeInput);
		const sanitizedHours = Math.min(Math.max(validated.hours, 1), 168);

		// Gather prerequisite information for each subject
		let prerequisiteContext = '';
		try {
			for (const subject of sanitizedSubjects) {
				const recommendations = await getRecommendedTopics(subject, 3);
				if (recommendations.length > 0) {
					prerequisiteContext += `\n${subject} recommended topics based on prerequisites: ${recommendations.map((r) => r.topic).join(', ')}`;
				}
			}
		} catch (error) {
			console.debug('Failed to gather prerequisite context:', error);
			// Continue without prerequisite context if it fails
		}

		const prompt = `Generate a focused Grade 12 study plan for these subjects: ${sanitizedSubjects.join(', ')}. The student has ${sanitizedHours} hours per week.

Consider the South African NSC curriculum prerequisites and logical progression when structuring the plan. Focus on foundational topics first before moving to advanced concepts.

${prerequisiteContext}

Structure it as a daily quest path with specific topics to cover, ensuring prerequisite topics are covered before dependent topics. Return as a structured list with clear progression.`;

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
	count = 5,
	userProfile?: UserLearningProfile
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

		// Build personalized context
		let personalizationContext = '';

		if (userProfile) {
			const subjectMastery = userProfile.subjectMastery[sanitizedSubject];
			const topicScore = subjectMastery?.topicScores[sanitizedTopic] || 0;
			const userDifficultyPreference = userProfile.preferredDifficulty;
			const weakAreas = userProfile.weakAreas.filter(
				(area) => area.includes(sanitizedTopic) || area.includes(sanitizedSubject)
			);

			// Adjust difficulty based on user performance
			if (topicScore < 50 && validated.difficulty === 'hard') {
				validated.difficulty = 'medium';
			} else if (topicScore > 80 && validated.difficulty === 'easy') {
				validated.difficulty = 'medium';
			}

			personalizationContext = `
Student Learning Profile:
- Current topic mastery: ${topicScore}/100
- Preferred difficulty level: ${userDifficultyPreference}
- Weak areas: ${weakAreas.join(', ') || 'none specified'}
- Response to difficulty levels: Easy: ${userProfile.responseToDifficulty.easy}%, Medium: ${userProfile.responseToDifficulty.medium}%, Hard: ${userProfile.responseToDifficulty.hard}%
- Recent topic interactions: ${
				userProfile.interactionHistory
					.filter((i) => i.subject === sanitizedSubject && i.topic === sanitizedTopic)
					.slice(-5)
					.map((i) => `${i.action} (${i.performance ? `${i.performance}%` : 'no score'})`)
					.join(', ') || 'none'
			}

ADAPT QUESTIONS TO STUDENT:
- If mastery is low (<50%), focus on foundational concepts even for "hard" difficulty
- If mastery is high (>80%), include more challenging applications
- Target weak areas identified in their profile
- Match their preferred difficulty level where possible
- Build on their recent learning patterns`;
		}

		const prompt = `You are an expert Grade 12 South African NSC exam creator specializing in adaptive learning. Generate ${validated.count} ${validated.difficulty} ${sanitizedSubject} questions on the topic "${sanitizedTopic}".

Requirements:
- Question type: ${questionTypeText}
- Difficulty level: ${difficultyText}
- Follow NSC exam conventions
- Include clear, unambiguous questions
- Ensure only ONE correct answer for multiple choice
- Include a detailed explanation for each correct answer

${personalizationContext}

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

const flashcardExplanationSchema = z.object({
	front: z.string().min(1).max(500),
	back: z.string().min(1).max(1000),
});

export async function getFlashcardExplanationAction(front: string, back: string): Promise<string> {
	try {
		const validated = flashcardExplanationSchema.parse({ front, back });

		const sanitizedFront = sanitizeInput(validated.front);
		const sanitizedBack = sanitizeInput(validated.back);

		const prompt = `You are an expert Grade 12 tutor in South Africa. Explain the following flashcard concept in a clear and detailed way to help a student understand it better.

Question/Concept: "${sanitizedFront}"
Answer: "${sanitizedBack}"

Requirements:
- Explain the concept in simple, easy-to-understand terms
- Provide real-world examples or analogies where applicable
- Highlight why this concept is important for exams
- Include any key formulas or relationships if applicable
- Keep the explanation concise but comprehensive (2-3 paragraphs)

Provide only the explanation, no JSON formatting needed.`;

		const result = await generateAI({ prompt, model: AI_MODELS.PRIMARY });

		return (
			result || "I'm sorry, I couldn't generate an explanation for this concept at the moment."
		);
	} catch (error) {
		if (error instanceof z.ZodError) {
			return 'Invalid input provided.';
		}
		console.debug('AI Explanation Error:', error);
		return "Sorry, I couldn't generate an explanation right now. Please try again later.";
	}
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

export interface ExtractedConcept {
	concept: string;
	subject: string;
	relevance: number;
}

export async function extractConceptsFromConversationAction(
	messages: Array<{ role: string; content: string }>
): Promise<ExtractedConcept[]> {
	try {
		const context = messages.map((m) => `${m.role}: ${m.content}`).join('\n\n');
		const prompt = `Analyze the following AI tutor conversation and extract the key learning concepts discussed. Return a JSON array of concepts with the following structure:
[
  {
    "concept": "the concept name",
    "subject": "the subject (e.g., Mathematics, Physics)",
    "relevance": number (1-10)
  }
]

Focus on:
- Key definitions, formulas, or theorems
- Topics that were explained or discussed
- Areas where the student had questions or struggled

Conversation:
${context.slice(0, 3000)}

Return ONLY valid JSON array, no other text.`;

		const result = await generateAI({ prompt, model: AI_MODELS.PRIMARY });

		if (result) {
			const cleaned = cleanJson(result);
			const parsed = JSON.parse(cleaned) as unknown;

			if (Array.isArray(parsed)) {
				return parsed.map((item) => ({
					concept: (item as { concept: string }).concept || '',
					subject: (item as { subject: string }).subject || '',
					relevance: (item as { relevance: number }).relevance || 5,
				}));
			}
		}

		return [];
	} catch (error) {
		console.debug('Concept Extraction Error:', error);
		return [];
	}
}

const answerExplanationSchema = z.object({
	question: z.string().min(1).max(1000),
	correctAnswer: z.string().min(1).max(500),
	userAnswer: z.string().min(1).max(500),
	subject: z.string().min(1).max(100),
	topic: z.string().min(1).max(200),
});

export async function generateAnswerExplanationAction(
	question: string,
	correctAnswer: string,
	userAnswer: string,
	subject: string,
	topic: string
): Promise<string> {
	try {
		const validated = answerExplanationSchema.parse({
			question,
			correctAnswer,
			userAnswer,
			subject,
			topic,
		});

		const sanitizedQuestion = sanitizeInput(validated.question);
		const sanitizedCorrectAnswer = sanitizeInput(validated.correctAnswer);
		const sanitizedUserAnswer = sanitizeInput(validated.userAnswer);
		const sanitizedSubject = sanitizeInput(validated.subject);
		const sanitizedTopic = sanitizeInput(validated.topic);

		const prompt = `You are an expert Grade 12 ${sanitizedSubject} tutor in South Africa. The student got this question wrong and needs a contextual explanation to understand their mistake and learn the correct approach.

Question: "${sanitizedQuestion}"
Correct Answer: "${sanitizedCorrectAnswer}"
Student's Answer: "${sanitizedUserAnswer}"
Subject: ${sanitizedSubject}
Topic: ${sanitizedTopic}

Requirements:
- Explain WHY the student's answer is incorrect in simple terms
- Show the CORRECT reasoning and approach step by step
- Highlight the key concept or misconception that led to the mistake
- Provide a helpful tip to avoid similar mistakes in the future
- Keep it encouraging and focused on learning
- Use analogies or examples relevant to Grade 12 curriculum

Format your response as a clear, structured explanation (3-4 paragraphs maximum). Focus on the "why" and "how to fix it" rather than just stating facts.`;

		const result = await generateAI({ prompt, model: AI_MODELS.PRIMARY });

		return (
			result || "I'm sorry, I couldn't generate an explanation for this mistake at the moment."
		);
	} catch (error) {
		if (error instanceof z.ZodError) {
			return 'Invalid input provided.';
		}
		console.debug('Answer Explanation Error:', error);

		if (hasFallbackContent(subject, topic)) {
			const fallback = getFallbackResponse(subject, topic);
			if (fallback) {
				return formatFallbackContent(fallback);
			}
		}

		return "Sorry, I couldn't generate an explanation right now. Try reviewing your cached flashcards or past papers while we reconnect.";
	}
}

export async function generateFollowUpQuizFromConversationAction(
	messages: Array<{ role: string; content: string }>,
	subject: string | undefined
): Promise<{ success: boolean; questions?: GeneratedQuestion[]; error?: string }> {
	try {
		const concepts = await extractConceptsFromConversationAction(messages);

		if (concepts.length === 0) {
			return { success: false, error: 'No concepts found in conversation' };
		}

		const topConcept = concepts.reduce((max, c) => (c.relevance > max.relevance ? c : max));
		const topic = topConcept.concept;
		const subjectName = subject || topConcept.subject || 'Mathematics';

		return generateQuestionsAction(subjectName, topic, 'medium', 'multiple_choice', 5);
	} catch (error) {
		console.debug('Follow-up Quiz Generation Error:', error);
		return { success: false, error: 'Failed to generate follow-up quiz' };
	}
}

export interface RealTimeExplanationRequest {
	subject: string;
	topic: string;
	context: string; // Current question or user input
	userAction: 'question_asked' | 'answer_incorrect' | 'hint_requested' | 'stuck';
	previousInteractions?: Array<{
		timestamp: Date;
		action: string;
		performance?: number;
	}>;
}

export async function generateRealTimeExplanationAction(
	request: RealTimeExplanationRequest,
	userProfile?: UserLearningProfile
): Promise<{ success: boolean; explanation?: string; tips?: string[]; error?: string }> {
	try {
		const validated = z
			.object({
				subject: z.string().min(1).max(100),
				topic: z.string().min(1).max(200),
				context: z.string().min(1).max(1000),
				userAction: z.enum(['question_asked', 'answer_incorrect', 'hint_requested', 'stuck']),
				previousInteractions: z
					.array(
						z.object({
							timestamp: z.date(),
							action: z.string(),
							performance: z.number().optional(),
						})
					)
					.optional(),
			})
			.parse(request);

		const sanitizedSubject = sanitizeInput(validated.subject);
		const sanitizedTopic = sanitizeInput(validated.topic);
		const sanitizedContext = sanitizeInput(validated.context);

		// Build real-time personalization context
		let personalizationContext = '';
		let adaptiveDifficulty = 'medium';
		let focusAreas: string[] = [];

		if (userProfile) {
			const subjectMastery = userProfile.subjectMastery[sanitizedSubject];
			const topicScore = subjectMastery?.topicScores[sanitizedTopic] || 0;

			// Determine adaptive difficulty based on performance
			if (topicScore < 40) adaptiveDifficulty = 'easy';
			else if (topicScore > 75) adaptiveDifficulty = 'hard';

			// Identify focus areas based on user history
			focusAreas = userProfile.weakAreas.filter(
				(area) =>
					area.toLowerCase().includes(sanitizedTopic.toLowerCase()) ||
					area.toLowerCase().includes(sanitizedSubject.toLowerCase())
			);

			// Build context from recent interactions
			const recentInteractions =
				validated.previousInteractions ||
				userProfile.interactionHistory
					.filter((i) => i.subject === sanitizedSubject && i.topic === sanitizedTopic)
					.slice(-5);

			personalizationContext = `
LEARNER PROFILE ANALYSIS:
- Current topic mastery: ${topicScore}/100
- Recommended difficulty: ${adaptiveDifficulty}
- Learning style: ${userProfile.learningStyle}
- Preferred content types: ${userProfile.preferredContentTypes.join(', ')}
- Focus areas: ${focusAreas.join(', ') || 'none identified'}

RECENT LEARNING PATTERN:
${recentInteractions
	.map(
		(i) =>
			`- ${i.action} (${i.performance ? `${i.performance}%` : 'no score'}) at ${i.timestamp.toLocaleTimeString()}`
	)
	.join('\n')}

ADAPTIVE RESPONSE STRATEGY:
- Adjust explanation complexity to match ${adaptiveDifficulty} difficulty level
- Incorporate ${userProfile.learningStyle} learning style preferences
- Address specific weak areas: ${focusAreas.join(', ') || 'general topic coverage'}
- Provide ${userProfile.preferredContentTypes.join('/')} style explanations
- Build on recent interaction patterns`;
		}

		// Customize prompt based on user action
		const actionPrompts = {
			question_asked:
				'The student is asking a question about this topic. Provide a clear, direct answer with supporting explanation.',
			answer_incorrect:
				'The student got this wrong. Explain the correct approach and why their thinking might have led them astray.',
			hint_requested:
				'The student needs a gentle hint. Provide progressive guidance without giving away the full answer.',
			stuck:
				'The student is stuck and needs comprehensive help. Provide step-by-step guidance with multiple approaches.',
		};

		const prompt = `You are an expert ${sanitizedSubject} tutor providing real-time assistance to a Grade 12 student.

CONTEXT: ${sanitizedContext}
ACTION TYPE: ${validated.userAction}
${actionPrompts[validated.userAction]}

${personalizationContext}

REQUIREMENTS:
- Provide immediate, actionable help
- Use ${adaptiveDifficulty} level complexity
- Include 2-3 specific study tips
- Keep response focused and under 300 words
- End with a question to check understanding

Return JSON format:
{
  "explanation": "main explanation text",
  "tips": ["tip 1", "tip 2", "tip 3"]
}`;

		const result = await generateAI({ prompt, model: AI_MODELS.PRIMARY });

		if (result) {
			const cleaned = cleanJson(result);
			const parsed = JSON.parse(cleaned) as unknown;

			if (
				typeof parsed === 'object' &&
				parsed !== null &&
				'explanation' in parsed &&
				'tips' in parsed
			) {
				return {
					success: true,
					explanation: (parsed as { explanation: string }).explanation,
					tips: Array.isArray((parsed as { tips: unknown }).tips)
						? (parsed as { tips: string[] }).tips
						: [],
				};
			}
		}

		return { success: false, error: 'Failed to parse real-time explanation from AI response' };
	} catch (error) {
		if (error instanceof z.ZodError) {
			return { success: false, error: 'Invalid input provided' };
		}
		console.debug('Real-time Explanation Error:', error);
		return { success: false, error: 'Failed to generate real-time explanation' };
	}
}
