import { type NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const plans = await db.query.subscriptionPlans.findMany({
			where: (p, { eq }) => eq(p.isActive, true),
			orderBy: (p, { asc }) => [asc(p.priceZar)],
		});

		const subscription = await db.query.userSubscriptions.findFirst({
			where: (subs, { eq, and }) =>
				and(eq(subs.userId, session.user.id), eq(subs.status, 'active')),
			with: {
				plan: true,
			},
		});

		return NextResponse.json({
			plans,
			subscription: subscription
				? {
						id: subscription.id,
						planId: subscription.planId,
						planName: subscription.plan?.name,
						status: subscription.status,
						currentPeriodEnd: subscription.currentPeriodEnd,
						cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
					}
				: null,
		});
	} catch (error) {
		console.error('Subscription fetch error:', error);
		return NextResponse.json({ error: 'Failed to fetch subscription' }, { status: 500 });
	}
}
