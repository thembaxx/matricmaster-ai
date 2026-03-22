import { type NextRequest, NextResponse } from 'next/server';
import { trackEnergySession } from '@/services/energy-tracking-service';

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { date, startTime, endTime, correctAnswers, totalQuestions, durationMinutes } = body;

		if (!date || !startTime || !endTime) {
			return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
		}

		const result = await trackEnergySession({
			date: new Date(date),
			startTime,
			endTime,
			correctAnswers: correctAnswers || 0,
			totalQuestions: totalQuestions || 0,
			durationMinutes: durationMinutes || 0,
		});

		return NextResponse.json(result);
	} catch (error) {
		console.error('Failed to track energy session:', error);
		return NextResponse.json({ error: 'Failed to track session' }, { status: 500 });
	}
}
