'use server';

import { asc, eq } from 'drizzle-orm';
import { getAuth } from '@/lib/auth';
import { type DbType, dbManager } from '@/lib/db';
import { topicConfidence } from '@/lib/db/schema';
import {
	calculateOptimalDifficulty,
	getAdaptiveInsights,
	updateTopicConfidence as updateTopicConfidenceService,
} from '@/services/adaptiveLearningService';

type TopicConfidenceRow = typeof topicConfidence.$inferSelect;

async function getDb(): Promise<DbType> {
	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) throw new Error('Database not available');
	return await dbManager.getDb();
}

export interface QuizQuestion {
	question: string;
	options: string[];
	correctAnswer: number;
	topic: string;
	subject: string;
	difficulty: 'easy' | 'medium' | 'hard';
}

export interface VoiceQuizSession {
	sessionId: string;
	hostId: string;
	participantId: string;
	sharedTopic: string;
	questions: QuizQuestion[];
	currentQuestionIndex: number;
	status: 'waiting' | 'active' | 'completed';
	scores: Record<string, number>;
}

export async function startVoiceQuizSession(
	participantId: string,
	sharedTopic: string
): Promise<{ success: boolean; error?: string; data?: VoiceQuizSession }> {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession();
		if (!session?.user) throw new Error('Unauthorized');

		const db = await getDb();

		const hostConfidences = await db.query.topicConfidence.findMany({
			where: eq(topicConfidence.userId, session.user.id),
			orderBy: [asc(topicConfidence.confidenceScore)],
			limit: 10,
		});

		const difficultyResult = await calculateOptimalDifficulty(1, sharedTopic);

		const questions = await generateAdaptiveQuizQuestions(
			sharedTopic,
			hostConfidences,
			difficultyResult.recommendedDifficulty
		);

		return {
			success: true,
			data: {
				sessionId: crypto.randomUUID(),
				hostId: session.user.id,
				participantId,
				sharedTopic,
				questions,
				currentQuestionIndex: 0,
				status: 'waiting',
				scores: { [session.user.id]: 0, [participantId]: 0 },
			},
		};
	} catch (error) {
		console.error('startVoiceQuizSession failed:', error);
		return { success: false, error: 'Failed to start voice quiz session' };
	}
}

async function generateAdaptiveQuizQuestions(
	topic: string,
	confidences: (typeof topicConfidence.$inferSelect)[],
	recommendedDifficulty: 'easy' | 'medium' | 'hard'
): Promise<QuizQuestion[]> {
	const weakTopicsList = confidences
		.filter((c) => Number(c.confidenceScore) < 0.6)
		.map((c) => c.topic);

	void weakTopicsList;

	const baseQuestions: Record<string, QuizQuestion[]> = {
		Calculus: [
			{
				question: 'What is the derivative of x²?',
				options: ['x', '2x', '2', 'x²'],
				correctAnswer: 1,
				topic: 'Calculus',
				subject: 'Mathematics',
				difficulty: 'easy',
			},
			{
				question: 'What is ∫2x dx?',
				options: ['x² + C', '2x² + C', 'x + C', '2 + C'],
				correctAnswer: 0,
				topic: 'Calculus',
				subject: 'Mathematics',
				difficulty: 'medium',
			},
			{
				question: 'Find d/dx(sin x)',
				options: ['cos x', '-cos x', '-sin x', 'tan x'],
				correctAnswer: 0,
				topic: 'Calculus',
				subject: 'Mathematics',
				difficulty: 'medium',
			},
		],
		'Euclidean Geometry': [
			{
				question: 'The sum of angles in a triangle equals?',
				options: ['90°', '180°', '360°', '270°'],
				correctAnswer: 1,
				topic: 'Euclidean Geometry',
				subject: 'Mathematics',
				difficulty: 'easy',
			},
			{
				question: 'A triangle with all sides equal is called?',
				options: ['Isosceles', 'Scalene', 'Equilateral', 'Right'],
				correctAnswer: 2,
				topic: 'Euclidean Geometry',
				subject: 'Mathematics',
				difficulty: 'easy',
			},
		],
		Algebra: [
			{
				question: 'Solve: 2x + 5 = 13',
				options: ['x = 3', 'x = 4', 'x = 5', 'x = 6'],
				correctAnswer: 1,
				topic: 'Algebra',
				subject: 'Mathematics',
				difficulty: 'easy',
			},
			{
				question: 'Factor: x² - 9',
				options: ['(x - 3)(x + 3)', '(x - 9)(x + 1)', '(x - 3)²', '(x + 3)²'],
				correctAnswer: 0,
				topic: 'Algebra',
				subject: 'Mathematics',
				difficulty: 'medium',
			},
		],
		'Chemical Equilibrium': [
			{
				question: 'What happens when temperature increases in an exothermic reaction?',
				options: ['Shift right', 'Shift left', 'No change', 'Equal amounts'],
				correctAnswer: 1,
				topic: 'Chemical Equilibrium',
				subject: 'Physical Sciences',
				difficulty: 'medium',
			},
			{
				question: "Le Chatelier's principle states that?",
				options: [
					'Equilibrium always favors products',
					'System opposes changes',
					'Reactions are irreversible',
					"Temperature doesn't affect equilibrium",
				],
				correctAnswer: 1,
				topic: 'Chemical Equilibrium',
				subject: 'Physical Sciences',
				difficulty: 'medium',
			},
		],
		Electrostatics: [
			{
				question: 'Like charges?',
				options: ['Attract', 'Repel', 'Have no effect', 'Combine'],
				correctAnswer: 1,
				topic: 'Electrostatics',
				subject: 'Physical Sciences',
				difficulty: 'easy',
			},
			{
				question: 'The force between two charges is proportional to?',
				options: [
					'The distance',
					'The distance squared',
					'The inverse distance',
					'The inverse distance squared',
				],
				correctAnswer: 3,
				topic: 'Electrostatics',
				subject: 'Physical Sciences',
				difficulty: 'medium',
			},
		],
	};

	const topicQuestions = baseQuestions[topic] || [
		{
			question: `What is a key concept in ${topic}?`,
			options: ['Concept A', 'Concept B', 'Concept C', 'Concept D'],
			correctAnswer: 0,
			topic,
			subject: 'General',
			difficulty: 'easy',
		},
	];

	const filtered = topicQuestions.filter(
		(q) => q.difficulty === recommendedDifficulty || q.difficulty === 'medium'
	);

	if (filtered.length > 0) {
		return filtered;
	}

	return topicQuestions;
}

export async function submitQuizAnswer(
	_sessionId: string,
	_userId: string,
	questionIndex: number,
	answerIndex: number,
	topic?: string,
	subjectId?: number
): Promise<{ success: boolean; error?: string; data?: { correct: boolean; score: number } }> {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession();
		if (!session?.user) throw new Error('Unauthorized');

		const correct = answerIndex === questionIndex;

		if (topic && subjectId !== undefined) {
			await updateTopicConfidenceService(topic, subjectId, correct);
		}

		const adaptiveInsights = await getAdaptiveInsights();

		void adaptiveInsights;

		return {
			success: true,
			data: {
				correct,
				score: correct ? 10 : 0,
			},
		};
	} catch (error) {
		console.error('submitQuizAnswer failed:', error);
		return { success: false, error: 'Failed to submit quiz answer' };
	}
}

export async function getSharedWeakTopic(
	userId1: string,
	userId2: string
): Promise<{ success: boolean; error?: string; data?: string | null }> {
	try {
		const db = await getDb();

		const confidences1 = await db.query.topicConfidence.findMany({
			where: eq(topicConfidence.userId, userId1),
			orderBy: [asc(topicConfidence.confidenceScore)],
			limit: 5,
		});

		const confidences2 = await db.query.topicConfidence.findMany({
			where: eq(topicConfidence.userId, userId2),
			orderBy: [asc(topicConfidence.confidenceScore)],
			limit: 5,
		});

		const topics1: string[] = confidences1.map((c: TopicConfidenceRow) => c.topic);
		const topics2: string[] = confidences2.map((c: TopicConfidenceRow) => c.topic);
		const topicSet1 = new Set(topics1);
		const topicSet2 = new Set(topics2);

		for (const topic of topicSet1) {
			if (topicSet2.has(topic)) {
				return { success: true, data: topic };
			}
		}

		const firstTopic = confidences1[0]?.topic ?? confidences2[0]?.topic ?? null;
		return { success: true, data: firstTopic };
	} catch (error) {
		console.error('getSharedWeakTopic failed:', error);
		return { success: false, error: 'Failed to get shared weak topic' };
	}
}
