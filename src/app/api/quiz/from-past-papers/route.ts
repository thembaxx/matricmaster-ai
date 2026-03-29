'use server';

import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuth } from '@/lib/auth';
import { dbManager } from '@/lib/db';
import {
	analyzePastPaperWeakAreas,
	generateAdaptiveQuizFromPastPapers,
	getPastPaperStats,
} from '@/lib/services/pastPaperAdaptiveLearning';

const generateQuizSchema = z.object({
	subject: z.string().min(1),
	questionCount: z.number().int().min(1).max(50).optional().default(10),
	excludeQuestionIds: z.array(z.string()).optional().default([]),
	includeTopics: z.array(z.string()).optional(),
});

export async function POST(request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({ headers: request.headers as never });

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const parsed = generateQuizSchema.parse(body);
		const { subject, questionCount, excludeQuestionIds, includeTopics } = parsed;

		const connected = await dbManager.waitForConnection(3, 2000);
		if (!connected) {
			return NextResponse.json({ error: 'Database not available' }, { status: 503 });
		}

		const weakAreas = await analyzePastPaperWeakAreas(session.user.id, subject);

		const questions = await generateAdaptiveQuizFromPastPapers(session.user.id, subject, {
			questionCount,
			excludeQuestionIds,
			includeTopics,
		});

		const stats = await getPastPaperStats(session.user.id, subject);

		return NextResponse.json({
			success: true,
			questions: questions.map((q) => ({
				id: q.questionId,
				questionText: q.questionText,
				topic: q.topic,
				difficulty: q.difficulty,
				marks: q.marks,
				year: q.year,
				paper: q.paper,
				month: q.month,
			})),
			weakAreas: weakAreas.slice(0, 5).map((w) => ({
				topic: w.topic,
				subject: w.subject,
				attemptCount: w.attemptCount,
				averageScore: w.averageScore,
				confidence: w.confidence,
			})),
			stats: {
				totalAttempts: stats.totalAttempts,
				accuracy: stats.accuracy,
			},
			meta: {
				targetedTopics: questions.map((q) => q.topic),
				adaptiveWeight: true,
			},
		});
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 });
		}
		console.error('[FromPastPapers] Quiz generation error:', error);
		return NextResponse.json(
			{ error: 'Failed to generate quiz from past papers' },
			{ status: 500 }
		);
	}
}

export async function GET(request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({ headers: request.headers as never });

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const subject = searchParams.get('subject') || undefined;

		const connected = await dbManager.waitForConnection(3, 2000);
		if (!connected) {
			return NextResponse.json({ error: 'Database not available' }, { status: 503 });
		}

		const weakAreas = await analyzePastPaperWeakAreas(session.user.id, subject);
		const stats = await getPastPaperStats(session.user.id, subject);

		return NextResponse.json({
			success: true,
			weakAreas: weakAreas.map((w) => ({
				topic: w.topic,
				subject: w.subject,
				subjectId: w.subjectId,
				attemptCount: w.attemptCount,
				averageScore: Math.round(w.averageScore * 100) / 100,
				confidence: w.confidence,
				lastAttempt: w.lastAttempt,
			})),
			stats,
		});
	} catch (error) {
		console.error('[FromPastPapers] Stats error:', error);
		return NextResponse.json({ error: 'Failed to get past paper stats' }, { status: 500 });
	}
}
