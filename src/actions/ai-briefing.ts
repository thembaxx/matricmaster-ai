'use server';

import { and, asc, desc, eq, isNotNull } from 'drizzle-orm';
import { headers } from 'next/headers';
import { appConfig } from '@/app.config';
import { generateTextWithAI, getBestAvailableModel } from '@/lib/ai';
import { getAuth } from '@/lib/auth';
import { dbManager } from '@/lib/db';
import {
	conceptStruggles,
	type StudySession,
	studySessions,
	type TopicMastery,
	topicConfidence,
	topicMastery,
	type UserProgress,
	universityTargets,
	userProgress,
	type WellnessCheckIn,
	wellnessCheckIns,
} from '@/lib/db/schema';
import { checkBurnoutRisk } from '@/services/burnoutDetection';
import { type DailyChallenge, generateDailyChallenges } from '@/services/dailyChallenges';
import { detectStruggles } from '@/services/struggleDetector';

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
	wellnessScore: number;
	isBurnedOut: boolean;
	greeting: string;
	motivationalMessage?: string;
	quickTips?: string[];
	hasAiGreeting: boolean;
	suggestBreak: boolean;
	wellnessInsight?: string;
	energySuggestion?: string;
	struggles: Array<{
		topic: string;
		subject: string;
		severity: 'high' | 'medium' | 'low';
		reason: string;
	}>;
	burnoutRisk?: {
		level: 'low' | 'moderate' | 'high' | 'severe';
		score: number;
		indicators: string[];
	};
	dailyChallenges?: Array<{
		id: string;
		title: string;
		type: string;
		target: number;
		current: number;
		xpReward: number;
		isCompleted: boolean;
	}>;
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

	const db = await dbManager.getDb();

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

		const unresolvedStruggles = await db.query.conceptStruggles.findMany({
			where: and(
				eq(conceptStruggles.userId, session.user.id),
				eq(conceptStruggles.isResolved, false)
			),
		});

		const [struggles, burnoutRisk] = await Promise.all([
			detectStruggles(session.user.id).catch(() => []),
			checkBurnoutRisk().catch(() => undefined),
		]);

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

		const wellnessCheckInsData = await db.query.wellnessCheckIns.findMany({
			where: eq(wellnessCheckIns.userId, session.user.id),
			orderBy: [desc(wellnessCheckIns.createdAt)],
			limit: 5,
		});

		const challenges = await generateDailyChallenges(session.user.id).catch(
			() => [] as DailyChallenge[]
		);

		const recentMoods = wellnessCheckInsData.map((w: WellnessCheckIn) => w.moodBefore);
		const averageMood =
			recentMoods.length > 0
				? recentMoods.reduce((a: number, b: number) => a + b, 0) / recentMoods.length
				: 3.5;

		const isBurnedOut =
			averageMood < 2.5 ||
			(recentMoods.length >= 3 &&
				recentMoods.slice(0, 3).filter((m: number, i: number) => i > 0 && m < recentMoods[i - 1])
					.length >= 2);

		const wellnessScore = Math.round(Math.max(0, Math.min(100, averageMood * 20)));

		const totalQuestions = progress.reduce(
			(sum: number, p: UserProgress) => sum + (p.totalQuestionsAttempted || 0),
			0
		);
		const totalCorrect = progress.reduce(
			(sum: number, p: UserProgress) => sum + (p.totalCorrect || 0),
			0
		);
		const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
		const currentStreak = progress[0]?.streakDays || 0;

		const currentAps = accuracy;
		const targetAps = target?.targetAps || appConfig.nsc.defaultTargetAps;
		const universityTarget = target?.universityName;

		const weakTopics = confidences.map((c: typeof topicConfidence.$inferSelect) => ({
			topic: c.topic,
			subject: c.subject,
			confidence: Number(c.confidenceScore),
		}));

		const strongTopics = masteries
			.filter((m: TopicMastery) => Number(m.masteryLevel) >= 0.7)
			.map((m: TopicMastery) => m.topic);

		const hasStudiedToday = recentSessions.some((s: StudySession) => {
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
			strugleCount: unresolvedStruggles.length,
			streakDays: currentStreak,
			hasStudiedToday,
			accuracy,
			totalQuestions,
			strongTopics,
			recentSessionCount: recentSessions.length,
			wellnessScore,
			isBurnedOut,
		};

		const { greeting, motivationalMessage, quickTips } = await generateGeminiGreeting(greetingData);

		// Wellness insight based on mood data
		let wellnessInsight: string | undefined;
		let energySuggestion: string | undefined;

		if (isBurnedOut) {
			wellnessInsight = 'Your mood has been declining. Consider lighter study sessions today.';
			energySuggestion =
				'Try reviewing flashcards or reading notes instead of tackling new topics.';
		} else if (wellnessScore < 50) {
			wellnessInsight = 'Energy levels are lower than usual. Short, focused sessions work best.';
			energySuggestion = 'Set a 25-minute timer and focus on one weak topic. Then take a break.';
		} else if (wellnessScore >= 80 && hasStudiedToday) {
			wellnessInsight = 'You are in a great flow! High energy and consistent study habits.';
			energySuggestion =
				'This is a good time to tackle challenging topics or practice past papers.';
		} else if (wellnessScore >= 60) {
			energySuggestion = 'Good energy today. Mix in some practice questions with your review.';
		}

		const isSevereBurnout = burnoutRisk?.level === 'severe';
		const shouldSuggestBreak = isBurnedOut || isSevereBurnout;

		const allQuickTips = quickTips ? [...quickTips] : [];
		if (isSevereBurnout) {
			allQuickTips.unshift('Your study patterns suggest burnout — take a break today');
		}
		const topStruggle = struggles.find((s) => s.severity === 'high');
		if (topStruggle) {
			allQuickTips.push(`Focus on ${topStruggle.topic} — it needs the most attention`);
		}

		return {
			apsProgress: {
				currentAps,
				targetAps,
				pointsThisMonth: unresolvedStruggles.length * 5,
				universityTarget,
			},
			weakTopics,
			streak: {
				currentStreak,
				hasStudiedToday,
			},
			wellnessScore,
			isBurnedOut,
			greeting,
			motivationalMessage,
			quickTips: allQuickTips.length > 0 ? allQuickTips : quickTips,
			hasAiGreeting: true,
			suggestBreak: shouldSuggestBreak,
			wellnessInsight,
			energySuggestion,
			struggles: struggles.map((s) => ({
				topic: s.topic,
				subject: s.subject,
				severity: s.severity,
				reason: s.reason,
			})),
			burnoutRisk: burnoutRisk
				? { level: burnoutRisk.level, score: burnoutRisk.score, indicators: burnoutRisk.indicators }
				: undefined,
			dailyChallenges: challenges.map((c) => ({
				id: c.id,
				title: c.title,
				type: c.type,
				target: c.target,
				current: c.current,
				xpReward: c.xpReward,
				isCompleted: c.isCompleted,
			})),
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
	wellnessScore: number;
	isBurnedOut: boolean;
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
- Wellness Score: ${data.wellnessScore}/100
- Burnout Risk: ${data.isBurnedOut ? 'Yes - needs rest' : 'No'}
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
- If burnout risk is high, suggest a break and lighter study
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
		wellnessScore: 75,
		isBurnedOut: false,
		greeting: `Welcome to ${appConfig.name}! Let's start your journey to university success!`,
		motivationalMessage: "Your path to success starts with a single step. Let's take it together!",
		quickTips: ['Complete your first quiz', 'Set your university goal', 'Review your first topic'],
		hasAiGreeting: false,
		suggestBreak: false,
		struggles: [],
		dailyChallenges: [],
	};
}
