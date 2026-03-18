'use server';

import { desc, eq } from 'drizzle-orm';
import { getAuth } from '@/lib/auth';
import { dbManager } from '@/lib/db';
import { conceptStruggles, topicConfidence } from '@/lib/db/schema';
import { aiChatMessages, aiChatSessions } from '@/lib/db/schema-ai-chat';
import { getBuddyProfile } from './buddyActions';

async function getDb() {
	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) throw new Error('Database not available');
	return dbManager.getDb();
}

export interface UserContext {
	weakAreas: string[];
	confidenceScores: { topic: string; subject: string; score: number }[];
	personality: string;
}

export async function getUserContext(): Promise<UserContext> {
	const auth = await getAuth();
	const session = await auth.api.getSession();
	if (!session?.user) throw new Error('Unauthorized');

	const db = await getDb();

	const struggles = await db.query.conceptStruggles.findMany({
		where: eq(conceptStruggles.userId, session.user.id),
		limit: 10,
	});

	const confidence = await db.query.topicConfidence.findMany({
		where: eq(topicConfidence.userId, session.user.id),
		limit: 20,
	});

	const buddyProfile = await getBuddyProfile();

	return {
		weakAreas: struggles.map((s) => s.concept),
		confidenceScores: confidence.map((c) => ({
			topic: c.topic,
			subject: c.subject,
			score: Number.parseFloat(String(c.confidenceScore)),
		})),
		personality: buddyProfile?.personality || 'mentor',
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

	return `You are an AI Study Buddy for South African NSC Grade 12 students.
${personalityPrompt}
Current subject focus: ${subject}
${weakAreasContext}
${lowConfidenceContext}

Guidelines:
- Use the student's weak areas to provide targeted explanations
- For low-confidence topics, explain more foundational concepts first
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

	return results.map((r) => ({
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

	return messages.map((m) => ({
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

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-2.0-flash';

export async function getAIResponse(
	messages: { role: string; content: string }[],
	userContext: UserContext,
	subject: string
): Promise<string> {
	const systemPrompt = buildSystemPrompt(userContext, subject);

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
		}
	);

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`Gemini API error: ${error}`);
	}

	const data = await response.json();
	return (
		data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.'
	);
}
