import { NextResponse } from 'next/server';
import {
	getAdaptiveRecommendations,
	processNudgeAdaptively,
} from '@/actions/nudge-adaptive-pipeline';

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const { nudgeId, nudgeType, topic } = body;

		if (!nudgeType) {
			return NextResponse.json({ success: false, error: 'nudgeType is required' }, { status: 400 });
		}

		const actions = await processNudgeAdaptively(nudgeId || crypto.randomUUID(), nudgeType, topic);

		return NextResponse.json({
			success: true,
			actions,
		});
	} catch (error) {
		console.error('Failed to process nudge:', error);
		return NextResponse.json({ success: false, error: 'Failed to process nudge' }, { status: 500 });
	}
}

export async function GET() {
	try {
		const result = await getAdaptiveRecommendations();

		return NextResponse.json({
			success: true,
			...result,
		});
	} catch (error) {
		console.error('Failed to get recommendations:', error);
		return NextResponse.json(
			{ success: false, error: 'Failed to get recommendations' },
			{ status: 500 }
		);
	}
}
