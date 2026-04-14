import { headers } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import { generateTutorBriefing } from '@/services/tutor-briefing-service';

/**
 * GET /api/tutoring/sessions/[sessionId]/briefing
 * Generate AI-powered tutor briefing for a session
 */
export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ sessionId: string }> }
) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { sessionId } = await params;

		const briefing = await generateTutorBriefing(sessionId);

		return NextResponse.json({
			success: true,
			data: briefing,
		});
	} catch (error) {
		console.error('Tutor briefing error:', error);
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : 'Failed to generate briefing' },
			{ status: 500 }
		);
	}
}
