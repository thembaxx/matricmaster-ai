import { NextResponse } from 'next/server';
import { getLoadSheddingStudyRecommendations } from '@/actions/load-shedding-offline';

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const stage = Number.parseInt(searchParams.get('stage') || '0', 10);

		const recommendations = await getLoadSheddingStudyRecommendations(stage);

		return NextResponse.json({
			success: true,
			activities: recommendations.recommendedActivities.map((a) => a.activity),
			tips: recommendations.tips,
		});
	} catch (error) {
		console.error('Failed to get recommendations:', error);
		return NextResponse.json(
			{ success: false, error: 'Failed to get recommendations' },
			{ status: 500 }
		);
	}
}
