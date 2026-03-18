import { and, eq, gte, sql } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import { dbManager } from '@/lib/db';
import { questionAttempts, questions } from '@/lib/db/schema';

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

		const result = mistakeCounts.map((m) => ({
			...m,
			subject: m.topic,
		}));

		return NextResponse.json(result);
	} catch (error) {
		console.debug('[Growth Map API] Error:', error);
		return NextResponse.json({ error: 'Failed to fetch growth map data' }, { status: 500 });
	}
}
