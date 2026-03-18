import { addDays } from 'date-fns';
import { type NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import { detectConflicts } from '@/services/scheduleAIService';
import type { StudyBlock } from '@/types/smart-scheduler';

export async function POST(request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession();
		if (!session?.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const { completedBlocks = [], blocks = [] } = body;

		const suggestions = detectConflicts(blocks as StudyBlock[]);

		const now = new Date();
		const missedBlocks = (blocks as StudyBlock[]).filter(
			(b: StudyBlock) => !completedBlocks.includes(b.id) && new Date(b.date) < now
		);

		const rescheduleSuggestions = missedBlocks.map((b: StudyBlock) => ({
			...b,
			date: addDays(new Date(), 1),
		}));

		return NextResponse.json({
			rescheduled: rescheduleSuggestions,
			newSuggestions: suggestions,
		});
	} catch (error) {
		console.error('Error optimizing schedule:', error);
		return NextResponse.json({ error: 'Failed to optimize' }, { status: 500 });
	}
}
