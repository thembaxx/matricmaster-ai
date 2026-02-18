import { type NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({ headers: request.headers });

		if (!session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const { contentType, contentId, sharePlatform } = body;

		if (!contentType || !contentId || !sharePlatform) {
			return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
		}

		// In production, save share record to database
		const share = {
			id: crypto.randomUUID(),
			userId: session.user.id,
			contentType,
			contentId,
			sharePlatform,
			createdAt: new Date().toISOString(),
		};

		return NextResponse.json(share, { status: 201 });
	} catch (error) {
		console.error('Error tracking share:', error);
		return NextResponse.json({ error: 'Failed to track share' }, { status: 500 });
	}
}
