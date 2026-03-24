'use server';

import { and, desc, eq, gte, sql } from 'drizzle-orm';
import { getAuth } from '@/lib/auth';
import { type DbType, dbManager } from '@/lib/db';
import {
	aiConversations,
	bookmarks,
	pastPapers,
	questions,
	searchHistory,
	subjects,
} from '@/lib/db/schema';

async function getDb(): Promise<DbType> {
	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) throw new Error('Database not available');
	return dbManager.getDb() as DbType;
}

export interface ContentRecommendation {
	type: 'pastPaper' | 'topic' | 'question' | 'conversation';
	id: string;
	title: string;
	subject?: string;
	relevanceScore: number;
	reason: string;
}

export interface SearchInsight {
	popularTopics: { topic: string; count: number }[];
	trendingSubjects: { subject: string; growth: number }[];
	relatedQueries: string[];
}

export async function recordSearch(query: string): Promise<{ success: boolean; error?: string }> {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession();
		if (!session?.user) return { success: false, error: 'Unauthorized' };

		const db = await getDb();

		await db.insert(searchHistory).values({
			userId: session.user.id,
			query,
		});

		return { success: true };
	} catch (error) {
		console.error('recordSearch failed:', error);
		return { success: false, error: 'Failed to record search' };
	}
}

export async function getSearchInsights(): Promise<{
	success: boolean;
	error?: string;
	data?: SearchInsight;
}> {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession();
		if (!session?.user) throw new Error('Unauthorized');

		const db = await getDb();

		const recentSearches = await db.query.searchHistory.findMany({
			where: gte(searchHistory.createdAt, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
			orderBy: [desc(searchHistory.createdAt)],
		});

		const topicCounts = new Map<string, number>();
		for (const search of recentSearches) {
			const words = search.query.toLowerCase().split(' ');
			for (const word of words) {
				topicCounts.set(word, (topicCounts.get(word) || 0) + 1);
			}
		}

		const popularTopics = Array.from(topicCounts.entries())
			.sort((a, b) => b[1] - a[1])
			.slice(0, 10)
			.map(([topic, count]) => ({ topic, count }));

		const mySearches = recentSearches.filter(
			(s: (typeof recentSearches)[number]) => s.userId === session.user.id
		);
		const myTopics = new Set<string>(
			mySearches.flatMap((s: (typeof mySearches)[number]) => s.query.toLowerCase().split(' '))
		);

		const trendingSubjects: { subject: string; growth: number }[] = [];

		const relatedQueries: string[] = Array.from(myTopics)
			.filter((topic: string) => topicCounts.has(topic) && (topicCounts.get(topic) ?? 0) > 3)
			.slice(0, 5);

		return {
			success: true,
			data: {
				popularTopics,
				trendingSubjects,
				relatedQueries,
			},
		};
	} catch (error) {
		console.error('getSearchInsights failed:', error);
		return { success: false, error: 'Failed to get search insights' };
	}
}

export async function getPersonalizedRecommendations(
	limit = 10
): Promise<{ success: boolean; error?: string; data?: ContentRecommendation[] }> {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession();
		if (!session?.user) throw new Error('Unauthorized');

		const db = await getDb();

		const recentSearches = await db.query.searchHistory.findMany({
			where: eq(searchHistory.userId, session.user.id),
			orderBy: [desc(searchHistory.createdAt)],
			limit: 20,
		});

		const searchTopics = new Set<string>(
			recentSearches
				.flatMap((s: (typeof recentSearches)[number]) => s.query.toLowerCase().split(' '))
				.filter((t: string) => t.length > 2)
		);

		const bookmarksList = await db.query.bookmarks.findMany({
			where: eq(bookmarks.userId, session.user.id),
		});

		const bookmarkedTypes = new Set(
			bookmarksList.map((b: (typeof bookmarksList)[number]) => b.bookmarkType)
		);

		const recommendations: ContentRecommendation[] = [];

		const pastPapersList = await db.query.pastPapers.findMany({
			where: eq(pastPapers.isExtracted, true),
			orderBy: [desc(pastPapers.createdAt)],
			limit: 20,
		});

		for (const paper of pastPapersList) {
			let relevanceScore = 10;

			for (const topic of searchTopics) {
				if (paper.subject.toLowerCase().includes(topic)) {
					relevanceScore += 20;
				}
			}

			if (!bookmarkedTypes.has('pastPaper')) {
				relevanceScore += 5;
			}

			recommendations.push({
				type: 'pastPaper',
				id: paper.id,
				title: `${paper.subject} - ${paper.paper} ${paper.year}`,
				subject: paper.subject,
				relevanceScore,
				reason: searchTopics.size > 0 ? 'Based on your recent searches' : 'Popular this week',
			});
		}

		const subjectsList = await db.query.subjects.findMany({
			where: eq(subjects.isActive, true),
		});

		for (const subject of subjectsList) {
			let relevanceScore = 15;

			for (const topic of searchTopics) {
				if (subject.name.toLowerCase().includes(topic)) {
					relevanceScore += 25;
				}
			}

			recommendations.push({
				type: 'topic',
				id: subject.id.toString(),
				title: subject.name,
				subject: subject.name,
				relevanceScore,
				reason: 'Subject overview',
			});
		}

		const conversations = await db.query.aiConversations.findMany({
			where: eq(aiConversations.userId, session.user.id),
			orderBy: [desc(aiConversations.updatedAt)],
			limit: 5,
		});

		for (const conv of conversations) {
			recommendations.push({
				type: 'conversation',
				id: conv.id,
				title: conv.title,
				subject: conv.subject || undefined,
				relevanceScore: 30,
				reason: 'Continue your previous learning',
			});
		}

		return {
			success: true,
			data: recommendations.sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, limit),
		};
	} catch (error) {
		console.error('getPersonalizedRecommendations failed:', error);
		return { success: false, error: 'Failed to get personalized recommendations' };
	}
}

export async function discoverPastPapers(
	subject?: string,
	year?: number,
	paper?: string
): Promise<{ success: boolean; error?: string; data?: (typeof pastPapers.$inferSelect)[] }> {
	try {
		const db = await getDb();

		let query = db.query.pastPapers.findMany({
			where: eq(pastPapers.isExtracted, true),
			orderBy: [desc(pastPapers.year), desc(pastPapers.createdAt)],
		});

		if (subject || year || paper) {
			const conditions = [eq(pastPapers.isExtracted, true)];

			if (subject) {
				conditions.push(sql`LOWER(${pastPapers.subject}) LIKE ${`%${subject.toLowerCase()}%`}`);
			}
			if (year) {
				conditions.push(eq(pastPapers.year, year));
			}
			if (paper) {
				conditions.push(sql`LOWER(${pastPapers.paper}) LIKE ${`%${paper.toLowerCase()}%`}`);
			}

			query = db.query.pastPapers.findMany({
				where: and(...conditions),
				orderBy: [desc(pastPapers.year), desc(pastPapers.createdAt)],
			});
		}

		const results = await query;
		return { success: true, data: results };
	} catch (error) {
		console.error('discoverPastPapers failed:', error);
		return { success: false, error: 'Failed to discover past papers' };
	}
}

export async function getSimilarQuestions(
	questionId: string,
	limit = 5
): Promise<{ success: boolean; error?: string; data?: (typeof questions.$inferSelect)[] }> {
	try {
		const db = await getDb();

		const question = await db.query.questions.findFirst({
			where: eq(questions.id, questionId),
		});

		if (!question) return { success: true, data: [] };

		const similar = await db.query.questions.findMany({
			where: and(
				eq(questions.subjectId, question.subjectId),
				eq(questions.topic, question.topic),
				sql`${questions.id} != ${questionId}`
			),
			limit,
		});

		return { success: true, data: similar };
	} catch (error) {
		console.error('getSimilarQuestions failed:', error);
		return { success: false, error: 'Failed to get similar questions' };
	}
}

export async function saveBookmark(
	bookmarkType: string,
	referenceId: string,
	note?: string
): Promise<{ success: boolean; error?: string; bookmark?: typeof bookmarks.$inferSelect }> {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession();
		if (!session?.user) throw new Error('Unauthorized');

		const db = await getDb();

		const existing = await db.query.bookmarks.findFirst({
			where: and(eq(bookmarks.userId, session.user.id), eq(bookmarks.referenceId, referenceId)),
		});

		if (existing) return { success: true, bookmark: existing };

		const [bookmark] = await db
			.insert(bookmarks)
			.values({
				userId: session.user.id,
				bookmarkType,
				referenceId,
				note,
			})
			.returning();

		return { success: true, bookmark };
	} catch (error) {
		console.error('saveBookmark failed:', error);
		return { success: false, error: 'Failed to save bookmark' };
	}
}

export async function saveAIConversation(
	title: string,
	subject: string,
	messages: string
): Promise<{
	success: boolean;
	error?: string;
	conversation?: typeof aiConversations.$inferSelect;
}> {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession();
		if (!session?.user) throw new Error('Unauthorized');

		const db = await getDb();

		const messageCount = (messages.match(/"role"/g) || []).length;

		const [conversation] = await db
			.insert(aiConversations)
			.values({
				userId: session.user.id,
				title,
				subject,
				messages,
				messageCount,
			})
			.returning();

		return { success: true, conversation };
	} catch (error) {
		console.error('saveAIConversation failed:', error);
		return { success: false, error: 'Failed to save AI conversation' };
	}
}
