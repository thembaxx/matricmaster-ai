import { type NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/server-auth';
import { createSession, deleteSession, getSessions } from '@/services/chatService';

export async function GET(_request: NextRequest) {
	await requireAuth();
	try {
		const sessions = await getSessions();
		return NextResponse.json(sessions);
	} catch (error) {
		console.debug('Error fetching sessions:', error);
		return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
	}
}

export async function POST(request: NextRequest) {
	await requireAuth();
	try {
		const body = await request.json();
		const subject = body.subject || 'general';
		const session = await createSession(subject);
		return NextResponse.json(session);
	} catch (error) {
		console.debug('Error creating session:', error);
		return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
	}
}

export async function DELETE(request: NextRequest) {
	await requireAuth();
	try {
		const { searchParams } = new URL(request.url);
		const sessionId = searchParams.get('id');
		if (!sessionId) {
			return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
		}
		await deleteSession(sessionId);
		return NextResponse.json({ success: true });
	} catch (error) {
		console.debug('Error deleting session:', error);
		return NextResponse.json({ error: 'Failed to delete session' }, { status: 500 });
	}
}
