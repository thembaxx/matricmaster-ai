import { nanoid } from 'nanoid';
import { NextResponse } from 'next/server';

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	// In a real app, we would create a session in the database
	const sessionId = nanoid();

	return NextResponse.json({
		sessionId,
		quizId: id,
		startTime: new Date().toISOString(),
	});
}
