import { and, desc, eq, gte, sql } from 'drizzle-orm';
import { NSC_EXAM_DATES } from '@/content/exam-dates';
import {
	analyzeInput,
	filterOutput,
	getSafeFallbackMessage,
	logContentFilterEvent,
} from '@/lib/ai/content-filter';
import { getAuth } from '@/lib/auth';
import { dbManager } from '@/lib/db';
import { conceptStruggles, quizResults, topicConfidence, topicMastery } from '@/lib/db/schema';
import { aiChatMessages, aiChatSessions } from '@/lib/db/schema-ai-chat';
import { getBuddyProfile } from './buddyActions';
import { edgeCaseService } from './edge-case-service';

async function getDb() {
	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) throw new Error('Database not available');
	return dbManager.getDb();
}

export interface UserContext {
	weakAreas: string[];
	confidenceScores: { topic: string; subject: string; score: number }[];
	personality: string;
	quizPerformance: {
		accuracy: number;
		totalQuizzes: number;
	};
	weakTopics: { topic: string; mastery: number }[];
	upcomingExams: { subject: string; date: string; daysUntil: number }[];
}

export async function getUserContext(): Promise<UserContext> {
	const auth = await getAuth();
	const session = await auth.api.getSession();
	if (!session?.user) throw new Error('Unauthorized');

	const db = await getDb();
	const userId = session.user.id;

	// 1. Existing logic: struggles & confidence
	const struggles = await db.query.conceptStruggles.findMany({
		where: eq(conceptStruggles.userId, userId),
		limit: 10,
	});

	const confidence = await db.query.topicConfidence.findMany({
		where: eq(topicConfidence.userId, userId),
		limit: 20,
	});

	// 2. New: Recent quiz performance (last 7 days)
	const sevenDaysAgo = new Date();
	sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

	const recentQuizzes = await db.query.quizResults.findMany({
		where: and(eq(quizResults.userId, userId), gte(quizResults.completedAt, sevenDaysAgo)),
	});

	let quizAccuracy = 0;
	if (recentQuizzes.length > 0) {
		const totalPercentage = recentQuizzes.reduce((sum, q) => sum + Number(q.percentage), 0);
		quizAccuracy = totalPercentage / recentQuizzes.length;
	}

	// 3. New: Topic mastery levels (weakest topics)
	const masteryData = await db.query.topicMastery.findMany({
		where: eq(topicMastery.userId, userId),
		orderBy: [sql`${topicMastery.masteryLevel} ASC`],
		limit: 10, // Get bottom 10 to find the 3 weakest unique ones
	});

	// Deduplicate topics (in case user has multiple entries for same topic - though schema suggests unique constraint)
	const uniqueWeakTopics = [];
	const seenTopics = new Set<string>();

	for (const m of masteryData) {
		if (!seenTopics.has(m.topic)) {
			seenTopics.add(m.topic);
			uniqueWeakTopics.push({
				topic: m.topic,
				mastery: Number(m.masteryLevel),
			});
		}
		if (uniqueWeakTopics.length >= 3) break;
	}

	// 4. New: Upcoming exam dates
	const now = new Date();
	const upcomingExams = NSC_EXAM_DATES.map((exam) => {
		const examDate = new Date(exam.date);
		const diffTime = examDate.getTime() - now.getTime();
		const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return {
			subject: exam.subject,
			date: exam.date,
			daysUntil,
			paper: exam.paper,
		};
	})
		.filter((exam) => exam.daysUntil >= 0) // Only future exams
		.sort((a, b) => a.daysUntil - b.daysUntil)
		.slice(0, 3); // Get next 3 exams

	const buddyProfile = await getBuddyProfile();

	return {
		weakAreas: struggles.map((s: (typeof struggles)[number]) => s.concept),
		confidenceScores: confidence.map((c: (typeof confidence)[number]) => ({
			topic: c.topic,
			subject: c.subject,
			score: Number.parseFloat(String(c.confidenceScore)),
		})),
		personality: buddyProfile?.personality || 'mentor',
		quizPerformance: {
			accuracy: Math.round(quizAccuracy),
			totalQuizzes: recentQuizzes.length,
		},
		weakTopics: uniqueWeakTopics,
		upcomingExams: upcomingExams.map(({ subject, date, daysUntil }) => ({
			subject,
			date,
			daysUntil,
		})),
	};
}

export function buildSystemPrompt(userContext: UserContext, subject: string): string {
	const personalityPrompts: Record<string, string> = {
		mentor:
			'You are a patient, experienced mentor who guides students to discover answers themselves.',
		tutor: 'You are a knowledgeable tutor who provides clear, structured explanations.',
		friend: 'You are a friendly study buddy who explains things in a casual, relatable way.',
	};

	const personalityPrompt =
		personalityPrompts[userContext.personality] || personalityPrompts.mentor;

	const weakAreasContext =
		userContext.weakAreas.length > 0
			? `\nThe student is currently struggling with: ${userContext.weakAreas.join(', ')}`
			: '';

	const confidenceContext = userContext.confidenceScores
		.filter((c) => c.score < 0.5)
		.slice(0, 5)
		.map((c) => `${c.topic} (${c.subject}): ${Math.round(c.score * 100)}% confidence`)
		.join(', ');

	const lowConfidenceContext = confidenceContext
		? `\nTopics where confidence is low: ${confidenceContext}`
		: '';

	// New context: Quiz Performance
	const quizPerformanceContext = `\nRecent Quiz Performance (last 7 days): ${userContext.quizPerformance.accuracy}% accuracy across ${userContext.quizPerformance.totalQuizzes} quizzes.`;

	// New context: Weakest Topics
	const weakTopicsContext =
		userContext.weakTopics.length > 0
			? `\nWeakest Topics by Mastery Level: ${userContext.weakTopics.map((t) => `${t.topic} (${t.mastery}%)`).join(', ')}`
			: '';

	// New context: Upcoming Exams
	const upcomingExamsContext =
		userContext.upcomingExams.length > 0
			? `\nUpcoming Exams: ${userContext.upcomingExams.map((e) => `${e.subject} in ${e.daysUntil} days`).join(', ')}`
			: '';

	return `You are an AI Study Buddy for South African NSC Grade 12 students.
${personalityPrompt}
Current subject focus: ${subject}
${weakAreasContext}
${lowConfidenceContext}
${quizPerformanceContext}
${weakTopicsContext}
${upcomingExamsContext}

Guidelines:
- Use the student's weak areas and lowest mastery topics to provide targeted explanations
- For low-confidence topics, explain more foundational concepts first
- If recent quiz performance is low, offer encouragement and focus on basics
- If an exam is approaching (less than 14 days), prioritize high-yield topics and exam techniques
- Support all NSC subjects: Mathematics, Physical Sciences, Life Sciences, Geography, History, English, Afrikaans, etc.
- When explaining, use examples from the South African curriculum
- Keep explanations concise but thorough
- If the student asks about something outside academic topics, politely redirect
- Format math and science clearly using markdown`;
}

export async function createSession(subject = 'general') {
	const auth = await getAuth();
	const session = await auth.api.getSession();
	if (!session?.user) throw new Error('Unauthorized');

	const db = await getDb();
	const [newSession] = await db
		.insert(aiChatSessions)
		.values({
			userId: session.user.id,
			title: 'New Conversation',
			subject,
		})
		.returning();

	return { id: newSession.id, title: newSession.title };
}

export async function getSessions() {
	const auth = await getAuth();
	const session = await auth.api.getSession();
	if (!session?.user) throw new Error('Unauthorized');

	const db = await getDb();
	const results = await db.query.aiChatSessions.findMany({
		where: eq(aiChatSessions.userId, session.user.id),
		orderBy: [desc(aiChatSessions.updatedAt)],
		limit: 20,
	});

	return results.map((r: (typeof results)[number]) => ({
		id: r.id,
		title: r.title,
		subject: r.subject,
		updatedAt: r.updatedAt,
	}));
}

export async function getSessionMessages(sessionId: string) {
	const auth = await getAuth();
	const authSession = await auth.api.getSession();
	if (!authSession?.user) throw new Error('Unauthorized');

	const db = await getDb();
	const messages = await db.query.aiChatMessages.findMany({
		where: eq(aiChatMessages.sessionId, sessionId),
		orderBy: [aiChatMessages.createdAt],
	});

	return messages.map((m: (typeof messages)[number]) => ({
		id: m.id,
		role: m.role,
		content: m.content,
		createdAt: m.createdAt,
	}));
}

export async function saveMessage(sessionId: string, role: 'user' | 'assistant', content: string) {
	const auth = await getAuth();
	const authSession = await auth.api.getSession();
	if (!authSession?.user) throw new Error('Unauthorized');

	const db = await getDb();
	await db.insert(aiChatMessages).values({ sessionId, role, content });

	await db
		.update(aiChatSessions)
		.set({ updatedAt: new Date() })
		.where(eq(aiChatSessions.id, sessionId));
}

export async function updateSessionTitle(sessionId: string, title: string) {
	const db = await getDb();
	await db
		.update(aiChatSessions)
		.set({ title, updatedAt: new Date() })
		.where(eq(aiChatSessions.id, sessionId));
}

export async function deleteSession(sessionId: string) {
	const db = await getDb();
	await db.delete(aiChatSessions).where(eq(aiChatSessions.id, sessionId));
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-2.0-flash';

export async function getAIResponse(
	messages: { role: string; content: string }[],
	userContext: UserContext,
	subject: string,
	signal?: AbortSignal
): Promise<string> {
	const systemPrompt = buildSystemPrompt(userContext, subject);

	// Filter the last user message for prompt injection
	const lastMessage = messages[messages.length - 1];
	if (lastMessage?.role === 'user') {
		const inputCheck = analyzeInput(lastMessage.content);
		if (inputCheck.action === 'block') {
			const auth = await getAuth();
			const session = await auth.api.getSession();
			if (session?.user) {
				logContentFilterEvent({
					userId: session.user.id,
					eventType: 'input_blocked',
					riskLevel: inputCheck.riskLevel,
					flaggedItems: inputCheck.flaggedPatterns,
				});
			}
			return getSafeFallbackMessage(inputCheck.reason);
		}
	}

	const conversationHistory = messages.map((m) => ({
		role: m.role === 'assistant' ? ('model' as const) : ('user' as const),
		parts: [{ text: m.content }],
	}));

	const response = await fetch(
		`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				contents: conversationHistory,
				systemInstruction: { parts: [{ text: systemPrompt }] },
				generationConfig: {
					temperature: 0.7,
					maxOutputTokens: 2048,
				},
			}),
			signal,
		}
	);

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`Gemini API error: ${error}`);
	}

	const data = await response.json();
	let aiResponse =
		data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';

	// Filter AI output for safety
	const outputFilter = filterOutput(aiResponse);
	if (outputFilter.action === 'block') {
		const auth = await getAuth();
		const session = await auth.api.getSession();
		if (session?.user) {
			logContentFilterEvent({
				userId: session.user.id,
				eventType: 'output_blocked',
				riskLevel: outputFilter.riskLevel,
				flaggedItems: outputFilter.flaggedCategories,
			});
		}
		return getSafeFallbackMessage();
	}

	if (outputFilter.action === 'redact') {
		const auth = await getAuth();
		const session = await auth.api.getSession();
		if (session?.user) {
			logContentFilterEvent({
				userId: session.user.id,
				eventType: 'output_redacted',
				riskLevel: outputFilter.riskLevel,
				flaggedItems: outputFilter.flaggedCategories,
			});
		}
	}

	aiResponse = outputFilter.filteredOutput;

	// Check for AI content errors (low confidence, potential hallucinations)
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession();
		if (session?.user) {
			const confidence = data.candidates?.[0]?.finishReason === 'STOP' ? 0.9 : 0.5;
			await edgeCaseService.handleAIContentError({
				userId: session.user.id,
				metadata: {
					confidence,
					contentType: 'chat_response',
					subject,
				},
			});
		}
	} catch (error) {
		// Non-critical error, don't block the response
		console.debug('Failed to check AI content error:', error);
	}

	return aiResponse;
}
