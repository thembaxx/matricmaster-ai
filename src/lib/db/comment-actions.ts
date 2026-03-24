'use server';

import { and, desc, eq, sql } from 'drizzle-orm';
import { ensureAuthenticated } from './auth-utils';
import { getDb } from './index';
import { comments, commentVotes, users } from './schema';

/**
 * Create a comment
 * Uses session-based authentication to prevent IDOR
 */
export async function createComment(
	_userId: string,
	data: {
		content: string;
		resourceType: string;
		resourceId: string;
		parentId?: string;
	}
) {
	try {
		const user = await ensureAuthenticated();
		// Always use the authenticated session's user ID to prevent IDOR
		const activeUserId = user.id;

		const db = getDb();
		const [comment] = await db
			.insert(comments)
			.values({
				userId: activeUserId,
				content: data.content,
				resourceType: data.resourceType,
				resourceId: data.resourceId,
				parentId: data.parentId,
			})
			.returning();
		return { success: true, comment };
	} catch (error) {
		console.debug('[Comments] Error creating comment:', error);
		return { success: false, error: String(error) };
	}
}

/**
 * Get comments for a resource
 */
export async function getComments(resourceType: string, resourceId: string) {
	try {
		const db = getDb();
		const commentsList = await db
			.select({
				id: comments.id,
				content: comments.content,
				resourceType: comments.resourceType,
				resourceId: comments.resourceId,
				parentId: comments.parentId,
				isEdited: comments.isEdited,
				upvotes: comments.upvotes,
				downvotes: comments.downvotes,
				createdAt: comments.createdAt,
				updatedAt: comments.updatedAt,
				userId: comments.userId,
				userName: users.name,
				userImage: users.image,
			})
			.from(comments)
			.leftJoin(users, eq(comments.userId, users.id))
			.where(and(eq(comments.resourceType, resourceType), eq(comments.resourceId, resourceId)))
			.orderBy(desc(comments.createdAt));

		return commentsList;
	} catch (error) {
		console.debug('[Comments] Error getting comments:', error);
		return [];
	}
}

/**
 * Get a single comment
 */
export async function getComment(commentId: string) {
	try {
		const db = getDb();
		const [comment] = await db
			.select({
				id: comments.id,
				content: comments.content,
				resourceType: comments.resourceType,
				resourceId: comments.resourceId,
				parentId: comments.parentId,
				isEdited: comments.isEdited,
				upvotes: comments.upvotes,
				downvotes: comments.downvotes,
				createdAt: comments.createdAt,
				updatedAt: comments.updatedAt,
				userId: comments.userId,
			})
			.from(comments)
			.where(eq(comments.id, commentId))
			.limit(1);
		return comment || null;
	} catch (error) {
		console.debug('[Comments] Error getting comment:', error);
		return null;
	}
}

/**
 * Update a comment
 * Verifies that the comment belongs to the authenticated user
 */
export async function updateComment(commentId: string, _userId: string, content: string) {
	try {
		const user = await ensureAuthenticated();
		// Always use the authenticated session's user ID to prevent IDOR
		const activeUserId = user.id;

		const db = getDb();
		const [updated] = await db
			.update(comments)
			.set({
				content,
				isEdited: true,
				updatedAt: new Date(),
			})
			.where(and(eq(comments.id, commentId), eq(comments.userId, activeUserId)))
			.returning();
		return { success: true, comment: updated };
	} catch (error) {
		console.debug('[Comments] Error updating comment:', error);
		return { success: false, error: String(error) };
	}
}

/**
 * Delete a comment
 * Verifies that the comment belongs to the authenticated user
 */
export async function deleteComment(commentId: string, _userId: string) {
	try {
		const user = await ensureAuthenticated();
		// Always use the authenticated session's user ID to prevent IDOR
		const activeUserId = user.id;

		const db = getDb();
		await db
			.delete(comments)
			.where(and(eq(comments.id, commentId), eq(comments.userId, activeUserId)));
		return { success: true };
	} catch (error) {
		console.debug('[Comments] Error deleting comment:', error);
		return { success: false, error: String(error) };
	}
}

/**
 * Vote on a comment (upvote/downvote)
 * Uses session-based authentication to prevent IDOR
 */
export async function voteOnComment(_userId: string, commentId: string, voteType: 'up' | 'down') {
	try {
		const user = await ensureAuthenticated();
		// Always use the authenticated session's user ID to prevent IDOR
		const activeUserId = user.id;

		const db = getDb();

		// Check if user already voted
		const existing = await db
			.select()
			.from(commentVotes)
			.where(and(eq(commentVotes.userId, activeUserId), eq(commentVotes.commentId, commentId)))
			.limit(1);

		if (existing.length > 0) {
			// Already voted - remove vote if same, otherwise update
			if (existing[0].voteType === voteType) {
				// Remove vote
				await db.delete(commentVotes).where(eq(commentVotes.id, existing[0].id));

				// Update comment counts
				if (voteType === 'up') {
					await db
						.update(comments)
						.set({ upvotes: sql`GREATEST(0, ${comments.upvotes} - 1)` })
						.where(eq(comments.id, commentId));
				} else {
					await db
						.update(comments)
						.set({ downvotes: sql`GREATEST(0, ${comments.downvotes} - 1)` })
						.where(eq(comments.id, commentId));
				}
			} else {
				// Change vote
				await db.update(commentVotes).set({ voteType }).where(eq(commentVotes.id, existing[0].id));

				// Update comment counts
				if (voteType === 'up') {
					await db
						.update(comments)
						.set({
							upvotes: sql`${comments.upvotes} + 1`,
							downvotes: sql`GREATEST(0, ${comments.downvotes} - 1)`,
						})
						.where(eq(comments.id, commentId));
				} else {
					await db
						.update(comments)
						.set({
							downvotes: sql`${comments.downvotes} + 1`,
							upvotes: sql`GREATEST(0, ${comments.upvotes} - 1)`,
						})
						.where(eq(comments.id, commentId));
				}
			}
		} else {
			// New vote
			await db.insert(commentVotes).values({
				userId: activeUserId,
				commentId,
				voteType,
			});

			// Update comment counts
			if (voteType === 'up') {
				await db
					.update(comments)
					.set({ upvotes: sql`${comments.upvotes} + 1` })
					.where(eq(comments.id, commentId));
			} else {
				await db
					.update(comments)
					.set({ downvotes: sql`${comments.downvotes} + 1` })
					.where(eq(comments.id, commentId));
			}
		}

		return { success: true };
	} catch (error) {
		console.debug('[Comments] Error voting on comment:', error);
		return { success: false, error: String(error) };
	}
}

/**
 * Get user's vote on a comment
 */
export async function getUserVote(_userId: string, commentId: string) {
	try {
		const user = await ensureAuthenticated();
		// Always use the authenticated session's user ID to prevent IDOR
		const activeUserId = user.id;

		const db = getDb();
		const [vote] = await db
			.select()
			.from(commentVotes)
			.where(and(eq(commentVotes.userId, activeUserId), eq(commentVotes.commentId, commentId)))
			.limit(1);
		return vote?.voteType || null;
	} catch (error) {
		console.debug('[Comments] Error getting user vote:', error);
		return null;
	}
}

/**
 * Flag a comment
 * Requires authentication
 */
export async function flagComment(commentId: string, reason: string) {
	try {
		await ensureAuthenticated();
		const db = getDb();
		await db
			.update(comments)
			.set({ isFlagged: true, flagReason: reason })
			.where(eq(comments.id, commentId));
		return { success: true };
	} catch (error) {
		console.debug('[Comments] Error flagging comment:', error);
		return { success: false, error: String(error) };
	}
}

/**
 * Get replies to a comment
 */
export async function getReplies(commentId: string) {
	return getComments('comment', commentId);
}
