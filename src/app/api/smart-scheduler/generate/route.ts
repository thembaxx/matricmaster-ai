import { type NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import { generateStudyBlocks, getExamCountdowns, getWeakAreas } from '@/services/scheduleAIService';

export async function POST(_request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession();
		if (!session?.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const weakAreas = await getWeakAreas();
		const examCountdowns = await getExamCountdowns();

		const blocks = generateStudyBlocks(weakAreas, examCountdowns);

		return NextResponse.json({
			blocks,
			suggestions: [],
		});
	} catch (error) {
		console.error('Error generating schedule:', error);
		return NextResponse.json({ error: 'Failed to generate schedule' }, { status: 500 });
	}
}
