import { type NextRequest, NextResponse } from 'next/server';
import {
	generateRealTimeExplanationAction,
	type RealTimeExplanationRequest,
} from '@/services/aiActions';
import type { UserLearningProfile } from '@/types/learning-profile';

export async function POST(request: NextRequest) {
	try {
		const body = (await request.json()) as RealTimeExplanationRequest & {
			userProfile?: UserLearningProfile;
		};

		const result = await generateRealTimeExplanationAction(body, body.userProfile);

		return NextResponse.json(result);
	} catch (error) {
		console.error('Real-time explanation API error:', error);
		return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
	}
}
