import { NextResponse } from 'next/server';
import { generatePreDownloadPlan } from '@/actions/load-shedding-offline';

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const { affectedBlocks } = body;

		const plan = await generatePreDownloadPlan(affectedBlocks || []);

		return NextResponse.json({
			success: true,
			plan,
			recommendedTasks: [
				...plan.beforeLoadShedding.map((c) => c.title),
				...plan.duringLoadShedding.map((c) => c.title),
			],
		});
	} catch (error) {
		console.error('Failed to prepare offline content:', error);
		return NextResponse.json(
			{ success: false, error: 'Failed to prepare offline content' },
			{ status: 500 }
		);
	}
}
