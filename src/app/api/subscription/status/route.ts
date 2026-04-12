import { and, eq, gte } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { getAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import { userSubscriptions } from '@/lib/db/schema';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limit';
import { PLANS } from '@/lib/subscriptionManager';

const statusResponseSchema = z.object({
	tier: z.string(),
	features: z.array(z.string()),
	expiresAt: z.string().nullable(),
	status: z.string().nullable(),
});

export async function GET(request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Rate limit: 5 requests per minute
		const rateLimit = await checkRateLimit(session.user.id, 'subscription-status');
		const headers = getRateLimitHeaders(rateLimit);
		if (!rateLimit.success) {
			return NextResponse.json(
				{ error: 'Too many requests', retryAfter: rateLimit.resetIn },
				{ status: 429, headers }
			);
		}

		// Query active subscription
		const subscription = await db.query.userSubscriptions.findFirst({
			where: and(
				eq(userSubscriptions.userId, session.user.id),
				eq(userSubscriptions.status, 'active'),
				gte(userSubscriptions.currentPeriodEnd, new Date())
			),
			with: {
				plan: true,
			},
		});

		if (!subscription) {
			// Free tier default
			const freePlan = PLANS.find((p) => p.id === 'free');
			return NextResponse.json(
				statusResponseSchema.parse({
					tier: 'free',
					features: freePlan?.featureKeys ?? [],
					expiresAt: null,
					status: 'none',
				}),
				{ headers }
			);
		}

		// Map plan to tier and features
		const plan = PLANS.find((p) => p.id === subscription.planId);
		const featureKeys = plan?.featureKeys ?? [];

		return NextResponse.json(
			statusResponseSchema.parse({
				tier: subscription.planId ?? 'free',
				features: featureKeys,
				expiresAt: subscription.currentPeriodEnd?.toISOString() ?? null,
				status: subscription.status,
			}),
			{ headers }
		);
	} catch (error) {
		console.error('Failed to fetch subscription status:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
