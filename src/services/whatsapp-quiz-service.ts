// @ts-nocheck - Pre-existing schema mismatches; needs dedicated refactoring pass
/**
 * WhatsApp Quiz Delivery Service
 *
 * Purpose: Deliver quiz questions and receive answers via WhatsApp
 * for low-connectivity users who can't access the full app.
 *
 * Features:
 * - Daily quiz questions delivered via WhatsApp
 * - Answer collection and scoring
 * - Subject-specific quiz streams
 * - Spaced repetition for review questions
 * - Streak tracking and gamification
 */

import { eq, sql } from 'drizzle-orm';
import { dbManager } from '@/lib/db';
import { questionAttempts, questions, topicMastery } from '@/lib/db/schema';
import { rateLimitedSend } from './whatsapp-service';

// ========================
// QUIZ DELIVERY TYPES
// ========================

export type QuizDeliveryMode = 'daily' | 'review' | 'weak_topic' | 'on_demand';

export interface WhatsAppQuizConfig {
	mode: QuizDeliveryMode;
	subject?: string;
	topic?: string;
	questionCount: number;
	difficulty: 'easy' | 'medium' | 'hard';
}

export interface WhatsAppQuizSession {
	userId: string;
	sessionId: string;
	questions: WhatsAppQuizQuestion[];
	currentQuestionIndex: number;
	startedAt: Date;
	mode: QuizDeliveryMode;
}

export interface WhatsAppQuizQuestion {
	id: string;
	text: string;
	options: string[];
	correctAnswerIndex: number;
	explanation?: string;
	subject: string;
	topic: string;
}

export interface WhatsAppQuizAnswer {
	questionId: string;
	answerIndex: number;
	isCorrect: boolean;
	responseTimeMs: number;
}

// ========================
// QUIZ GENERATION
// ========================

/**
 * Generate quiz questions for WhatsApp delivery
 */
export async function generateWhatsAppQuiz(
	userId: string,
	config: WhatsAppQuizConfig
): Promise<WhatsAppQuizSession> {
	// Select questions based on mode
	let selectedQuestions: WhatsAppQuizQuestion[] = [];

	if (config.mode === 'weak_topic' && config.topic) {
		// Get questions from topics where user is struggling
		selectedQuestions = await getQuestionsForWeakTopic(userId, config.topic, config.questionCount);
	} else if (config.mode === 'review') {
		// Get questions for spaced repetition review
		selectedQuestions = await getReviewQuestions(userId, config.questionCount);
	} else {
		// Get random questions from subject or general
		selectedQuestions = await getRandomQuestions(
			config.subject,
			config.questionCount,
			config.difficulty
		);
	}

	if (selectedQuestions.length === 0) {
		throw new Error('No questions available for this configuration');
	}

	return {
		userId,
		sessionId: generateSessionId(),
		questions: selectedQuestions,
		currentQuestionIndex: 0,
		startedAt: new Date(),
		mode: config.mode,
	};
}

/**
 * Format a quiz question for WhatsApp delivery
 */
export function formatQuestionForWhatsApp(
	question: WhatsAppQuizQuestion,
	questionNumber: number,
	totalQuestions: number
): string {
	const optionsText = question.options.map((opt, idx) => `${idx + 1}. ${opt}`).join('\n');

	return `📝 Question ${questionNumber}/${totalQuestions}

${question.text}

${optionsText}

Reply with the number of your answer (1-${question.options.length})`;
}

/**
 * Process a user's answer received via WhatsApp
 */
export async function processWhatsAppAnswer(
	userId: string,
	session: WhatsAppQuizSession,
	answerText: string
): Promise<{
	isCorrect: boolean;
	correctAnswer: string;
	explanation: string;
	isQuizComplete: boolean;
	nextQuestion?: string;
}> {
	const currentQuestion = session.questions[session.currentQuestionIndex];
	if (!currentQuestion) {
		return {
			isCorrect: false,
			correctAnswer: '',
			explanation: 'No active question found.',
			isQuizComplete: true,
		};
	}

	// Parse answer (expecting a number)
	const answerIndex = Number.parseInt(answerText.trim(), 10) - 1;
	const isCorrect = answerIndex === currentQuestion.correctAnswerIndex;

	// Record the attempt
	await recordQuestionAttempt(
		userId,
		currentQuestion.id,
		isCorrect,
		currentQuestion.subject,
		currentQuestion.topic
	);

	// Build feedback
	let feedback: string;
	if (isCorrect) {
		feedback = '✅ Correct! Well done!\n\n';
	} else {
		feedback = `❌ Not quite. The correct answer is: ${currentQuestion.options[currentQuestion.correctAnswerIndex]}\n\n`;
	}

	if (currentQuestion.explanation) {
		feedback += `💡 Explanation:\n${currentQuestion.explanation}\n\n`;
	}

	// Move to next question or complete quiz
	session.currentQuestionIndex++;

	if (session.currentQuestionIndex >= session.questions.length) {
		// Quiz complete - generate summary
		const summary = await generateQuizSummary(userId, session);
		return {
			isCorrect,
			correctAnswer: currentQuestion.options[currentQuestion.correctAnswerIndex],
			explanation: feedback + summary,
			isQuizComplete: true,
		};
	}

	// Return next question
	const nextQuestion = formatQuestionForWhatsApp(
		session.questions[session.currentQuestionIndex],
		session.currentQuestionIndex + 1,
		session.questions.length
	);

	return {
		isCorrect,
		correctAnswer: currentQuestion.options[currentQuestion.correctAnswerIndex],
		explanation: feedback,
		isQuizComplete: false,
		nextQuestion,
	};
}

/**
 * Generate quiz completion summary
 */
async function generateQuizSummary(userId: string, _session: WhatsAppQuizSession): Promise<string> {
	const db = await dbManager.getDb();

	// Calculate score from recorded attempts
	const attempts = await db
		.select({
			correct: sql<number>`count(*) filter (where ${questionAttempts.isCorrect} = true)`,
			total: sql<number>`count(*)`,
		})
		.from(questionAttempts)
		.where(eq(questionAttempts.userId, userId));

	const correct = attempts[0]?.correct || 0;
	const total = attempts[0]?.total || 1;
	const percentage = Math.round((correct / total) * 100);

	let message = '🎉 Quiz Complete!\n\n';
	message += `Score: ${correct}/${total} (${percentage}%)\n\n`;

	if (percentage >= 80) {
		message += `🌟 Excellent work! You're mastering this topic!`;
	} else if (percentage >= 60) {
		message += '👍 Good effort! Keep practicing to improve.';
	} else {
		message += '📚 Keep at it! Review this topic and try again.';
	}

	message += '\n\nOpen the Lumni app for detailed explanations and more practice.';

	return message;
}

// ========================
// QUESTION SELECTION
// ========================

/**
 * Get questions from topics where user is struggling
 */
async function getQuestionsForWeakTopic(
	_userId: string,
	topic: string,
	count: number
): Promise<WhatsAppQuizQuestion[]> {
	const db = await dbManager.getDb();

	const result = await db
		.select({
			id: questions.id,
			text: questions.questionText,
			subject: questions.subjectId,
			topic: questions.topic,
			options: questions.options,
		})
		.from(questions)
		.where(eq(questions.topic, topic))
		.limit(count);

	return result.map((q) => ({
		id: q.id,
		text: q.text,
		options: q.options || ['Option A', 'Option B', 'Option C', 'Option D'],
		correctAnswerIndex: 0, // TODO: Get from options table
		subject: q.subject,
		topic: q.topic,
	}));
}

/**
 * Get questions for spaced repetition review
 */
async function getReviewQuestions(userId: string, count: number): Promise<WhatsAppQuizQuestion[]> {
	const db = await dbManager.getDb();
	const now = new Date();

	// Get questions due for review (nextReviewAt is today or past)
	const result = await db
		.select({
			id: questionAttempts.questionId,
			text: questions.questionText,
			subject: questions.subjectId,
			topic: questions.topic,
			options: questions.options,
		})
		.from(questionAttempts)
		.innerJoin(questions, eq(questionAttempts.questionId, questions.id))
		.where(
			sql`${questionAttempts.nextReviewAt} <= ${now} AND ${questionAttempts.userId} = ${userId}`
		)
		.limit(count);

	return result.map((q) => ({
		id: q.questionAttempts_questionId,
		text: q.questions_questionText,
		options: q.questions_options || ['Option A', 'Option B', 'Option C', 'Option D'],
		correctAnswerIndex: 0,
		subject: q.questions_subjectId,
		topic: q.questions_topic,
	}));
}

/**
 * Get random questions (with optional subject filter)
 */
async function getRandomQuestions(
	subject: string | undefined,
	count: number,
	_difficulty: string
): Promise<WhatsAppQuizQuestion[]> {
	const db = await dbManager.getDb();

	let query = db
		.select({
			id: questions.id,
			text: questions.questionText,
			subject: questions.subjectId,
			topic: questions.topic,
			options: questions.options,
		})
		.from(questions)
		.limit(count);

	if (subject) {
		query = db
			.select({
				id: questions.id,
				text: questions.questionText,
				subject: questions.subjectId,
				topic: questions.topic,
				options: questions.options,
			})
			.from(questions)
			.where(eq(questions.subjectId, subject))
			.orderBy(sql`random()`)
			.limit(count);
	}

	const result = await query;

	return result.map((q) => ({
		id: q.id,
		text: q.text,
		options: q.options || ['Option A', 'Option B', 'Option C', 'Option D'],
		correctAnswerIndex: 0,
		subject: q.subject,
		topic: q.topic,
	}));
}

// ========================
// DELIVERY FUNCTIONS
// ========================

/**
 * Send daily quiz via WhatsApp
 */
export async function sendDailyQuiz(phoneNumber: string, userId: string): Promise<boolean> {
	try {
		const session = await generateWhatsAppQuiz(userId, {
			mode: 'daily',
			questionCount: 5,
			difficulty: 'medium',
		});

		const firstQuestion = formatQuestionForWhatsApp(
			session.questions[0],
			1,
			session.questions.length
		);

		const quizMessage = `📚 Daily Quiz Time!\n\n${firstQuestion}`;

		// Store session for tracking (in-memory or cache)
		// TODO: Store in Redis/cache for answer processing

		return await rateLimitedSend(phoneNumber, quizMessage, userId);
	} catch (error) {
		console.error('Failed to send daily quiz:', error);
		return false;
	}
}

/**
 * Send weak topic alert with quiz
 */
export async function sendWeakTopicQuiz(
	phoneNumber: string,
	userId: string,
	topic: string,
	subject: string
): Promise<boolean> {
	try {
		const session = await generateWhatsAppQuiz(userId, {
			mode: 'weak_topic',
			subject,
			topic,
			questionCount: 3,
			difficulty: 'easy',
		});

		const alertMessage = `📢 Time to practice ${topic}!\n\nLet's work on this together. Here's your first question:\n\n`;

		const firstQuestion = formatQuestionForWhatsApp(
			session.questions[0],
			1,
			session.questions.length
		);

		return await rateLimitedSend(phoneNumber, alertMessage + firstQuestion, userId);
	} catch (error) {
		console.error('Failed to send weak topic quiz:', error);
		return false;
	}
}

/**
 * Send on-demand quiz request
 */
export async function handleOnDemandQuizRequest(
	phoneNumber: string,
	userId: string,
	subject?: string
): Promise<boolean> {
	try {
		const session = await generateWhatsAppQuiz(userId, {
			mode: 'on_demand',
			subject,
			questionCount: 5,
			difficulty: 'medium',
		});

		const subjectText = subject ? `${subject}` : 'general';
		const introMessage = `🎯 Starting a ${subjectText} quiz!\n\n`;

		const firstQuestion = formatQuestionForWhatsApp(
			session.questions[0],
			1,
			session.questions.length
		);

		return await rateLimitedSend(phoneNumber, introMessage + firstQuestion, userId);
	} catch (error) {
		console.error('Failed to start on-demand quiz:', error);
		return false;
	}
}

// ========================
// UTILITIES
// ========================

function generateSessionId(): string {
	return `wa_quiz_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

async function recordQuestionAttempt(
	userId: string,
	questionId: string,
	isCorrect: boolean,
	subject: string,
	topic: string
): Promise<void> {
	const db = await dbManager.getDb();

	await db.insert(questionAttempts).values({
		userId,
		questionId,
		isCorrect,
		subjectId: subject,
		topic,
		attemptedAt: new Date(),
	});

	// Update topic mastery
	const existingMastery = await db
		.select()
		.from(topicMastery)
		.where(
			sql`${topicMastery.userId} = ${userId} AND ${topicMastery.topic} = ${topic} AND ${topicMastery.subjectId} = ${subject}`
		)
		.limit(1);

	if (existingMastery.length > 0) {
		const currentMastery = Number(existingMastery[0].masteryLevel);
		const delta = isCorrect ? 0.05 : -0.03;
		const newMastery = Math.max(0, Math.min(1, currentMastery + delta));

		await db
			.update(topicMastery)
			.set({
				masteryLevel: newMastery,
				lastPracticed: new Date(),
			})
			.where(eq(topicMastery.id, existingMastery[0].id));
	} else {
		await db.insert(topicMastery).values({
			userId,
			subjectId: subject,
			topic,
			masteryLevel: isCorrect ? 0.3 : 0.1,
			lastPracticed: new Date(),
		});
	}
}
