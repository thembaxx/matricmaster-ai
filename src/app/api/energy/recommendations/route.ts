import { type NextRequest, NextResponse } from 'next/server';
import {
	getEnergyRecommendations,
	getOptimalStudyWindows,
} from '@/services/energy-tracking-service';

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const userId = searchParams.get('userId') || undefined;

		const [recommendations, windows] = await Promise.all([
			getEnergyRecommendations(),
			getOptimalStudyWindows(userId),
		]);

		return NextResponse.json({
			recommendations,
			windows,
		});
	} catch (error) {
		console.error('Failed to get energy recommendations:', error);
		return NextResponse.json({ error: 'Failed to get recommendations' }, { status: 500 });
	}
}
