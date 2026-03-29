import { type NextRequest, NextResponse } from 'next/server';
import {
	getDailyProgressSummary,
	sendUpcomingStudyReminders,
} from '@/lib/services/whatsappReminders';

export async function GET(request: NextRequest) {
	const authHeader = request.headers.get('authorization');
	const cronSecret = process.env.CRON_SECRET;

	if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const { searchParams } = new URL(request.url);
	const type = searchParams.get('type') || 'reminders';

	try {
		switch (type) {
			case 'reminders': {
				const result = await sendUpcomingStudyReminders();
				return NextResponse.json({
					success: true,
					sent: result.sent,
					errors: result.errors,
				});
			}

			case 'daily-summary': {
				const userId = searchParams.get('userId');
				if (!userId) {
					return NextResponse.json({ error: 'userId required' }, { status: 400 });
				}
				const summary = await getDailyProgressSummary(userId, new Date());
				return NextResponse.json({ success: true, summary });
			}

			default:
				return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
		}
	} catch (error) {
		console.error('Cron error:', error);
		return NextResponse.json({ error: 'Cron failed' }, { status: 500 });
	}
}
