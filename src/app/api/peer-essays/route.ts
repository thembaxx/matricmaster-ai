'use server';

import { and, asc, eq, ne, sql } from 'drizzle-orm';
import { headers } from 'next/headers';
import { getAuth } from '@/lib/auth';
import { dbManager } from '@/lib/db';
import { peerEssays } from '@/lib/db/schema';

const MAX_PEER_GRADES = 3;
const _GRADING_XP = 15;

async function getDb() {
	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) throw new Error('Database not available');
	return dbManager.getDb();
}

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const toGrade = searchParams.get('to_grade') === 'true';

	const auth = await getAuth();
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session?.user) {
		return Response.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const db = await getDb();

	try {
		if (toGrade) {
			// Get essays from other users that need grading (not from self, still need more grades)
			const essays = await db
				.select({
					id: peerEssays.id,
					subject: peerEssays.subject,
					topic: peerEssays.topic,
					essayContent: peerEssays.essayContent,
					status: peerEssays.status,
					peerGradeCount: peerEssays.peerGradeCount,
					xpEarned: peerEssays.xpEarned,
					createdAt: peerEssays.createdAt,
				})
				.from(peerEssays)
				.where(
					and(
						ne(peerEssays.userId, session.user.id),
						sql`${peerEssays.peerGradeCount} < ${MAX_PEER_GRADES}`,
						eq(peerEssays.status, 'pending')
					)
				)
				.orderBy(asc(peerEssays.createdAt))
				.limit(20);

			return Response.json(essays);
		}
		// Get current user's essays
		const essays = await db
			.select({
				id: peerEssays.id,
				subject: peerEssays.subject,
				topic: peerEssays.topic,
				essayContent: peerEssays.essayContent,
				status: peerEssays.status,
				peerGradeCount: peerEssays.peerGradeCount,
				xpEarned: peerEssays.xpEarned,
				createdAt: peerEssays.createdAt,
			})
			.from(peerEssays)
			.where(eq(peerEssays.userId, session.user.id))
			.orderBy(asc(peerEssays.createdAt));

		return Response.json(essays);
	} catch (error) {
		console.error('Error fetching peer essays:', error);
		return Response.json({ error: 'Failed to fetch essays' }, { status: 500 });
	}
}

export async function POST(request: Request) {
	const auth = await getAuth();
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session?.user) {
		return Response.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const body = await request.json();
	const { subject, topic, content } = body;

	if (!subject || !topic || !content || content.length < 100) {
		return Response.json(
			{ error: 'Subject, topic, and at least 100 characters required' },
			{ status: 400 }
		);
	}

	const db = await getDb();

	try {
		const [essay] = await db
			.insert(peerEssays)
			.values({
				userId: session.user.id,
				subject,
				topic,
				essayContent: content,
				status: 'pending',
				peerGradeCount: 0,
				xpEarned: 0,
			})
			.returning();

		return Response.json(essay);
	} catch (error) {
		console.error('Error submitting essay:', error);
		return Response.json({ error: 'Failed to submit essay' }, { status: 500 });
	}
}
