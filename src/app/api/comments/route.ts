import { type NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import { createComment, getComments } from '@/lib/db/comment-actions';

export async function POST(request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({ headers: request.headers });

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const { content, resourceType, resourceId, parentId } = body;

		if (!content || !resourceType || !resourceId) {
			return NextResponse.json(
				{ error: 'Missing required fields: content, resourceType, resourceId' },
				{ status: 400 }
			);
		}

		const result = await createComment(session.user.id, {
			content,
			resourceType,
			resourceId,
			parentId,
		});

		if (!result.success) {
			return NextResponse.json(
				{ error: result.error || 'Failed to create comment' },
				{ status: 500 }
			);
		}

		return NextResponse.json({ success: true, data: result.comment }, { status: 201 });
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
			return NextResponse.json(
				{ error: 'Missing resource parameters: resourceType, resourceId' },
				{ status: 400 }
			);
		}

		const comments = await getComments(resourceType, resourceId);

		return NextResponse.json({ success: true, data: comments });
	} catch (error) {
		console.error('Error fetching comments:', error);
		return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
	}
}
