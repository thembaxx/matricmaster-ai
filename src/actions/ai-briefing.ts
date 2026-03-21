'use server';

import { and, asc, desc, eq, isNotNull } from 'drizzle-orm';
import { headers } from 'next/headers';
import { appConfig } from '@/app.config';
import { generateTextWithAI, getBestAvailableModel } from '@/lib/ai';
import { getAuth } from '@/lib/auth';
import { dbManager } from '@/lib/db';
import {
	conceptStruggles,
	studySessions,
	topicConfidence,
	topicMastery,
	universityTargets,
	userProgress,
} from '@/lib/db/schema';

export interface BriefingData {
	apsProgress: {
		currentAps: number;
		targetAps: number;
		pointsThisMonth: number;
		universityTarget?: string;
	};
	weakTopics: Array<{
		topic: string;
		subject: string;
		confidence: number;
	}>;
	streak: {
		currentStreak: number;
		hasStudiedToday: boolean;
	};
	greeting: string;
	motivationalMessage?: string;
	quickTips?: string[];
	hasAiGreeting: boolean;
}

export async function generatePersonalizedBriefing(): Promise<BriefingData> {
	const auth = await getAuth();
	const headersList = await headers();
	const session = await auth.api.getSession({ headers: headersList });

	if (!session?.user) {
		return getDefaultBriefing();
	}

	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) {
		return getDefaultBriefing();
	}

	const db = dbManager.getDb();

	try {
		const target = await db.query.universityTargets.findFirst({
			where: and(
				eq(universityTargets.userId, session.user.id),
				eq(universityTargets.isActive, true)
			),
		});

		const progress = await db.query.userProgress.findMany({
			where: eq(userProgress.userId, session.user.id),
		});

		const confidences = await db.query.topicConfidence.findMany({
			where: eq(topicConfidence.userId, session.user.id),
			orderBy: [asc(topicConfidence.confidenceScore)],
			limit: 3,
		});

		const struggles = await db.query.conceptStruggles.findMany({
			where: and(
				eq(conceptStruggles.userId, session.user.id),
				eq(conceptStruggles.isResolved, false)
			),
		});

		const masteries = await db.query.topicMastery.findMany({
			where: eq(topicMastery.userId, session.user.id),
			orderBy: [desc(topicMastery.masteryLevel)],
			limit: 5,
		});

		const recentSessions = await db.query.studySessions.findMany({
			where: and(eq(studySessions.userId, session.user.id), isNotNull(studySessions.completedAt)),
			orderBy: [desc(studySessions.completedAt)],
			limit: 5,
		});

		const totalQuestions = progress.reduce((sum, p) => sum + (p.totalQuestionsAttempted || 0), 0);
		const totalCorrect = progress.reduce((sum, p) => sum + (p.totalCorrect || 0), 0);
		const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
		const currentStreak = progress[0]?.streakDays || 0;

		const currentAps = accuracy;
		const targetAps = target?.targetAps || appConfig.nsc.defaultTargetAps;
		const universityTarget = target?.universityName;

		const weakTopics = confidences.map((c) => ({
			topic: c.topic,
			subject: c.subject,
			confidence: Number(c.confidenceScore),
		}));

		const strongTopics = masteries.filter((m) => Number(m.masteryLevel) >= 0.7).map((m) => m.topic);

		const hasStudiedToday = recentSessions.some((s) => {
			if (!s.completedAt) return false;
			const today = new Date();
			const sessionDate = new Date(s.completedAt);
			return (
				sessionDate.getDate() === today.getDate() &&
				sessionDate.getMonth() === today.getMonth() &&
				sessionDate.getFullYear() === today.getFullYear()
			);
		});

		const greetingData = {
			userName: session.user.name || 'Scholar',
			currentAps,
			targetAps,
			universityTarget,
			weakTopicsCount: weakTopics.length,
			strugleCount: struggles.length,
			streakDays: currentStreak,
			hasStudiedToday,
			accuracy,
			totalQuestions,
			strongTopics,
			recentSessionCount: recentSessions.length,
		};

		const { greeting, motivationalMessage, quickTips } = await generateGeminiGreeting(greetingData);

		return {
			apsProgress: {
				currentAps,
				targetAps,
				pointsThisMonth: struggles.length * 5,
				universityTarget,
			},
			weakTopics,
			streak: {
				currentStreak,
				hasStudiedToday,
			},
			greeting,
			motivationalMessage,
			quickTips,
			hasAiGreeting: true,
		};
	} catch (error) {
		console.error('Error generating personalized briefing:', error);
		return getDefaultBriefing();
	}
}

interface GreetingData {
	userName: string;
	currentAps: number;
	targetAps: number;
	universityTarget?: string;
	weakTopicsCount: number;
	strugleCount: number;
	streakDays: number;
	hasStudiedToday: boolean;
	accuracy: number;
	totalQuestions: number;
	strongTopics: string[];
	recentSessionCount: number;
}

async function generateGeminiGreeting(data: GreetingData): Promise<{
	greeting: string;
	motivationalMessage?: string;
	quickTips?: string[];
}> {
	const hour = new Date().getHours();
	let timeOfDay = 'day';
	if (hour < 12) timeOfDay = 'morning';
	else if (hour < 18) timeOfDay = 'afternoon';
	else timeOfDay = 'evening';

	const strongTopicsText =
		data.strongTopics.length > 0 ? `Strong in: ${data.strongTopics.slice(0, 3).join(', ')}` : '';

	const prompt = `You are MatricMaster AI, a motivational study coach for South African Matric students.

Generate a personalized greeting and briefing for a student with this profile:

STUDENT PROFILE:
- Name: ${data.userName}
- Time of day: ${timeOfDay}
- Current Accuracy: ${data.currentAps}%
- Target APS: ${data.targetAps}
- University Goal: ${data.universityTarget || 'Not set'}
- Current Streak: ${data.streakDays} days
- Questions Attempted: ${data.totalQuestions}
- Weak Topics: ${data.weakTopicsCount}
- Unresolved Struggles: ${data.strugleCount}
- Studied Today: ${data.hasStudiedToday ? 'Yes' : 'No'}
- ${strongTopicsText}

Generate a response with these fields (in JSON format):
{
  "greeting": "A warm, encouraging greeting (max 50 chars)",
  "motivationalMessage": "2-3 sentences of motivational coaching tailored to their situation (max 150 chars)",
  "quickTips": ["1 actionable tip", "2 more tips if needed"]
}

Guidelines:
- Keep it encouraging, energetic, and South African friendly
- If they have a streak, celebrate it!
- If they haven't studied today, motivate them to start
- If they have weak topics, offer to help
- Reference their university goal if set
- Keep tips practical and immediately actionable
- Total response should be under 300 characters for greeting + message combined`;

	try {
		const response = await generateTextWithAI({
			prompt,
			model: getBestAvailableModel(),
			temperature: 0.8,
		});

		const parsed = JSON.parse(response.trim());

		return {
			greeting: parsed.greeting || generateFallbackGreeting(data),
			motivationalMessage: parsed.motivationalMessage,
			quickTips: parsed.quickTips || [],
		};
	} catch (error) {
		console.debug('Gemini greeting generation failed, using fallback:', error);
		return {
			greeting: generateFallbackGreeting(data),
			motivationalMessage: generateFallbackMessage(data),
			quickTips: generateFallbackTips(data),
		};
	}
}

function generateFallbackGreeting(data: GreetingData): string {
	const hour = new Date().getHours();
	let timeGreeting = 'Good day';
	if (hour < 12) timeGreeting = 'Good morning';
	else if (hour < 18) timeGreeting = 'Good afternoon';
	else timeGreeting = 'Good evening';

	const name = data.userName.split(' ')[0] || 'Scholar';

	if (data.streakDays > 0) {
		return `${timeGreeting}, ${name}! 🔥 ${data.streakDays} day streak!`;
	}

	if (!data.hasStudiedToday) {
		return `${timeGreeting}, ${name}! Ready to crush today?`;
	}

	return `${timeGreeting}, ${name}! Let's keep the momentum going!`;
}

function generateFallbackMessage(data: GreetingData): string {
	if (data.strugleCount > 0) {
		return `You've got this! Let's tackle those ${data.strugleCount} concepts together and turn them into wins.`;
	}

	if (data.weakTopicsCount > 0) {
		return `You're making progress! Focus on your weak spots and watch your APS climb to ${data.targetAps}.`;
	}

	if (data.accuracy >= 70) {
		return `Amazing work! You're performing well. Keep it up and you'll reach ${data.universityTarget || 'your goal'} in no time!`;
	}

	return `Every question counts! Keep practicing and your accuracy will improve. You've got this!`;
}

function generateFallbackTips(data: GreetingData): string[] {
	const tips: string[] = [];

	if (!data.hasStudiedToday) {
		tips.push('Start with a quick 10-minute review');
	}

	if (data.strugleCount > 0) {
		tips.push('Review your mistake bank');
	}

	if (data.weakTopicsCount > 0) {
		tips.push('Practice weak topics first');
	}

	if (tips.length < 2) {
		tips.push('Complete at least 5 questions');
	}

	if (tips.length < 3) {
		tips.push('Review flashcards if available');
	}

	return tips.slice(0, 3);
}

function getDefaultBriefing(): BriefingData {
	return {
		apsProgress: {
			currentAps: 0,
			targetAps: appConfig.nsc.defaultTargetAps,
			pointsThisMonth: 0,
		},
		weakTopics: [],
		streak: {
			currentStreak: 0,
			hasStudiedToday: false,
		},
		greeting: `Welcome to ${appConfig.name}! Let's start your journey to university success!`,
		motivationalMessage: "Your path to success starts with a single step. Let's take it together!",
		quickTips: ['Complete your first quiz', 'Set your university goal', 'Review your first topic'],
		hasAiGreeting: false,
	};
}
