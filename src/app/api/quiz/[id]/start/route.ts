import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(
	request: Request,
	{ params }: { params: { id: string } }
) {
	// In a real app, we would create a session in the database
	const sessionId = uuidv4();

	return NextResponse.json({
		sessionId,
		quizId: params.id,
		startTime: new Date().toISOString(),
	});
}
