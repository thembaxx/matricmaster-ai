import { inArray, lt } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';
import { dbManager } from '@/lib/db';
import { aiConversations, flashcardReviews, searchHistory } from '@/lib/db/schema';

const VERCEL_CRON_SECRET = process.env.CRON_SECRET;

export async function POST(request: NextRequest) {
	const authHeader = request.headers.get('authorization');
	if (authHeader !== `Bearer ${VERCEL_CRON_SECRET}`) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const db = await dbManager.getDb();
	const cutoffDate = new Date();
	cutoffDate.setMonth(cutoffDate.getMonth() - 3);

	const results = {
		flashcardReviews: 0,
		searchHistory: 0,
		aiConversations: 0,
	};

	try {
		const oldReviews = await db.query.flashcardReviews.findMany({
			where: (fields, { lt }) => lt(fields.reviewedAt, cutoffDate),
			limit: 1000,
		});

		if (oldReviews.length > 0) {
			const reviewIds = oldReviews.map((r: { id: string }) => r.id);
			await db.delete(flashcardReviews).where(inArray(flashcardReviews.id, reviewIds));
			results.flashcardReviews = oldReviews.length;
		}

		const deletedSearch = await db
			.delete(searchHistory)
			.where(lt(searchHistory.createdAt, cutoffDate));
		results.searchHistory = Number(deletedSearch.rowCount || 0);

		const conversationsToKeep = 50;
		const allConversations = await db.query.aiConversations.findMany({
			orderBy: (fields, { desc }) => desc(fields.createdAt),
		});

		const userIds = [...new Set(allConversations.map((c: { userId: string }) => c.userId))];

		for (const userId of userIds) {
			const userConversations = allConversations.filter(
				(c: { userId: string }) => c.userId === userId
			);
			if (userConversations.length > conversationsToKeep) {
				const toDelete = userConversations.slice(conversationsToKeep);
				const deleteIds = toDelete.map((c: { id: string }) => c.id);
				await db.delete(aiConversations).where(inArray(aiConversations.id, deleteIds));
				results.aiConversations += deleteIds.length;
			}
		}

		return NextResponse.json({ success: true, archived: results });
	} catch (error) {
		console.error('Archive job failed:', error);
		return NextResponse.json({ error: 'Archive job failed' }, { status: 500 });
	}
}
