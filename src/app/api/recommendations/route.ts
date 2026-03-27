import { type NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/api-error-handler';
import { getAuth } from '@/lib/auth';
import { generateCrossFeatureRecommendations } from '@/services/crossFeatureFlow';

export async function GET(request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
		}

		const recommendations = await generateCrossFeatureRecommendations();

		return NextResponse.json({
			success: true,
			recommendations,
		});
	} catch (error) {
		return handleApiError(error);
	}
}
