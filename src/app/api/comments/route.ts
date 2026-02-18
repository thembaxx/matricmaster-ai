import { type NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
	try {
		const auth = getAuth();
		const session = await auth.api.getSession({ headers: request.headers });

		if (!session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const { content, resourceType, resourceId, parentId } = body;

		if (!content || !resourceType || !resourceId) {
			return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
		}

		// In production, save to database
		const comment = {
			id: crypto.randomUUID(),
			userId: session.user.id,
			userName: session.user.name,
			userAvatar: session.user.image,
			content,
			resourceType,
			resourceId,
			parentId,
			upvotes: 0,
			downvotes: 0,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		return NextResponse.json(comment, { status: 201 });
	} catch (error) {
		console.error('Error creating comment:', error);
		return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
	}
}

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const resourceType = searchParams.get('resourceType');
		const resourceId = searchParams.get('resourceId');

		if (!resourceType || !resourceId) {
			return NextResponse.json({ error: 'Missing resource parameters' }, { status: 400 });
		}

		// In production, fetch from database
		// Return empty array for now - would query DB
		const comments: unknown[] = [];

		return NextResponse.json(comments);
	} catch (error) {
		console.error('Error fetching comments:', error);
		return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
	}
}
