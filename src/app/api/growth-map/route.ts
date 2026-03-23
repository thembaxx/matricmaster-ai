import { and, eq, gte, sql } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import { dbManager } from '@/lib/db';
import { conceptStruggles, questionAttempts, questions, topicConfidence } from '@/lib/db/schema';

export async function GET(request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		await dbManager.initialize();
		const db = dbManager.getDb();

		const thirtyDaysAgo = new Date();
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

		const sevenDaysAgo = new Date();
		sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

		// Get mistake counts per topic
		const mistakeCounts = await db
			.select({
				topic: questions.topic,
				mistakeCount: sql<number>`count(*)::int`,
			})
			.from(questionAttempts)
			.innerJoin(questions, eq(questions.id, questionAttempts.questionId))
			.where(
				and(
					eq(questionAttempts.userId, session.user.id),
					eq(questionAttempts.isCorrect, false),
					gte(questionAttempts.attemptedAt, thirtyDaysAgo)
				)
			)
			.groupBy(questions.topic)
			.orderBy(sql`count(*) desc`)
			.limit(10);

		// Get confidence scores
		const confidences = await db
			.select({
				topic: topicConfidence.topic,
				subject: topicConfidence.subject,
				confidenceScore: topicConfidence.confidenceScore,
			})
			.from(topicConfidence)
			.where(eq(topicConfidence.userId, session.user.id));

		const confidenceMap = new Map<string, { score: number; subject: string }>(
			confidences.map((c: (typeof confidences)[number]) => [
				c.topic,
				{ score: Number(c.confidenceScore), subject: c.subject },
			])
		);

		// Get struggle counts
		const struggles = await db
			.select({
				concept: conceptStruggles.concept,
				struggleCount: conceptStruggles.struggleCount,
			})
			.from(conceptStruggles)
			.where(
				and(eq(conceptStruggles.userId, session.user.id), eq(conceptStruggles.isResolved, false))
			);

		const struggleMap = new Map<string, number>(
			struggles.map((s: { concept: string; struggleCount: number }) => [s.concept, s.struggleCount])
		);

		// Get recent accuracy per topic (last 7 days vs previous 7 days for trend)
		const recentScores = await db
			.select({
				topic: questions.topic,
				correct: sql<number>`count(case when ${questionAttempts.isCorrect} = true then 1 end)::int`,
				total: sql<number>`count(*)::int`,
			})
			.from(questionAttempts)
			.innerJoin(questions, eq(questions.id, questionAttempts.questionId))
			.where(
				and(
					eq(questionAttempts.userId, session.user.id),
					gte(questionAttempts.attemptedAt, sevenDaysAgo)
				)
			)
			.groupBy(questions.topic);

		const recentMap = new Map<string, number>(
			recentScores.map((s: { topic: string; correct: number; total: number }) => [
				s.topic,
				s.total > 0 ? s.correct / s.total : 0,
			])
		);

		const fourteenDaysAgo = new Date();
		fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

		const previousScores = await db
			.select({
				topic: questions.topic,
				correct: sql<number>`count(case when ${questionAttempts.isCorrect} = true then 1 end)::int`,
				total: sql<number>`count(*)::int`,
			})
			.from(questionAttempts)
			.innerJoin(questions, eq(questions.id, questionAttempts.questionId))
			.where(
				and(
					eq(questionAttempts.userId, session.user.id),
					gte(questionAttempts.attemptedAt, fourteenDaysAgo),
					sql`${questionAttempts.attemptedAt} < ${sevenDaysAgo}`
				)
			)
			.groupBy(questions.topic);

		const previousMap = new Map<string, number>(
			previousScores.map((s: { topic: string; correct: number; total: number }) => [
				s.topic,
				s.total > 0 ? s.correct / s.total : 0,
			])
		);

		// Build enriched topic data
		const topics = mistakeCounts.map((m: { topic: string; mistakeCount: number }) => {
			const confidence = confidenceMap.get(m.topic);
			const recent = recentMap.get(m.topic) ?? 0;
			const previous = previousMap.get(m.topic) ?? recent;
			const trend: 'up' | 'down' | 'stable' =
				recent > previous + 0.05 ? 'up' : recent < previous - 0.05 ? 'down' : 'stable';

			return {
				topic: m.topic,
				subject: confidence?.subject ?? '',
				mistakes: m.mistakeCount,
				confidence: confidence?.score ?? null,
				trend,
				struggleCount: struggleMap.get(m.topic) ?? 0,
			};
		});

		// Generate insights
		const insights: string[] = [];
		const highMistakeTopics = topics.filter((t: (typeof topics)[number]) => t.mistakes > 10);
		const improvingTopics = topics.filter((t: (typeof topics)[number]) => t.trend === 'up');
		const decliningTopics = topics.filter((t: (typeof topics)[number]) => t.trend === 'down');

		if (highMistakeTopics.length > 0) {
			insights.push(
				`Your biggest challenge is "${highMistakeTopics[0].topic}" with ${highMistakeTopics[0].mistakes} mistakes. Focus here for the biggest improvement.`
			);
		}
		if (improvingTopics.length > 0) {
			insights.push(`Great improvement in "${improvingTopics[0].topic}"! Keep up the momentum.`);
		}
		if (decliningTopics.length > 0) {
			insights.push(
				`We suggest focusing on "${decliningTopics[0].topic}" — your recent scores have dipped.`
			);
		}
		if (topics.length === 0) {
			insights.push('Complete some quizzes to see your growth map and personalized insights.');
		}

		return NextResponse.json({ topics, insights });
	} catch (error) {
		console.debug('[Growth Map API] Error:', error);
		return NextResponse.json({ error: 'Failed to fetch growth map data' }, { status: 500 });
	}
}
