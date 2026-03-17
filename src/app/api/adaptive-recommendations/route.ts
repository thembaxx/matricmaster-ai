import { type NextRequest, NextResponse } from 'next/server';
import { getAdaptiveRecommendations } from '@/actions/adaptive-learning';

export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;
		const limit = Number.parseInt(searchParams.get('limit') || '10', 10);

		const recommendations = await getAdaptiveRecommendations(limit);

		return NextResponse.json({
			recommendations,
			count: recommendations.length,
		});
	} catch (error) {
		console.debug('Failed to get adaptive recommendations:', error);
		return NextResponse.json({ error: 'Failed to get recommendations' }, { status: 500 });
	}
}
