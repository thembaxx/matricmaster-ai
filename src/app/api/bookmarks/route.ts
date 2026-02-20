import { type NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import {
	createBookmarkAction,
	deleteBookmarkAction,
	getBookmarksAction,
	isBookmarkedAction,
} from '@/lib/db/bookmark-actions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/bookmarks - Get user's bookmarks
export async function GET(request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({ headers: request.headers });
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const searchParams = request.nextUrl.searchParams;
		const type = searchParams.get('type') as
			| 'question'
			| 'past_paper'
			| 'study_note'
			| 'quiz'
			| null;

		const bookmarks = await getBookmarksAction(session.user.id, type ?? undefined);

		return NextResponse.json({ success: true, data: bookmarks });
	} catch (error) {
		console.error('[API] Error fetching bookmarks:', error);
		return NextResponse.json({ error: 'Failed to fetch bookmarks' }, { status: 500 });
	}
}

// POST /api/bookmarks - Create a bookmark
export async function POST(request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({ headers: request.headers });
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const { bookmarkType, referenceId, note } = body;

		if (!bookmarkType || !referenceId) {
			return NextResponse.json(
				{ error: 'Missing required fields: bookmarkType, referenceId' },
				{ status: 400 }
			);
		}

		// Check if already bookmarked
		const alreadyBookmarked = await isBookmarkedAction(session.user.id, referenceId);
		if (alreadyBookmarked) {
			return NextResponse.json({ error: 'Already bookmarked' }, { status: 409 });
		}

		const result = await createBookmarkAction(session.user.id, bookmarkType, referenceId, note);

		if (!result.success) {
			return NextResponse.json(
				{ error: result.error || 'Failed to create bookmark' },
				{ status: 500 }
			);
		}

		return NextResponse.json({ success: true, data: result.bookmark });
	} catch (error) {
		console.error('[API] Error creating bookmark:', error);
		return NextResponse.json({ error: 'Failed to create bookmark' }, { status: 500 });
	}
}

// DELETE /api/bookmarks - Delete a bookmark
export async function DELETE(request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({ headers: request.headers });
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const searchParams = request.nextUrl.searchParams;
		const bookmarkId = searchParams.get('id');

		if (!bookmarkId) {
			return NextResponse.json({ error: 'Missing required parameter: id' }, { status: 400 });
		}

		const result = await deleteBookmarkAction(bookmarkId, session.user.id);

		if (!result.success) {
			return NextResponse.json({ error: 'Failed to delete bookmark' }, { status: 500 });
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('[API] Error deleting bookmark:', error);
		return NextResponse.json({ error: 'Failed to delete bookmark' }, { status: 500 });
	}
}
