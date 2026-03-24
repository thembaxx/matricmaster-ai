import { and, asc, eq } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import { type DbType, dbManager } from '@/lib/db';
import { subscriptionPlans, userSubscriptions } from '@/lib/db/schema';

async function getDb(): Promise<DbType> {
	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) {
		throw new Error('Database not available');
	}
	return (await dbManager.getDb()) as DbType;
}

export async function GET(request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const db = await getDb();

		const plans = await db
			.select()
			.from(subscriptionPlans)
			.where(eq(subscriptionPlans.isActive, true))
			.orderBy(asc(subscriptionPlans.priceZar));

		const subscription = await db
			.select()
			.from(userSubscriptions)
			.where(
				and(eq(userSubscriptions.userId, session.user.id), eq(userSubscriptions.status, 'active'))
			)
			.limit(1)
			.then((rows) => rows[0]);

		return NextResponse.json({
			plans,
			subscription: subscription
				? {
						id: subscription.id,
						planId: subscription.planId,
						planName: null,
						status: subscription.status,
						currentPeriodEnd: subscription.currentPeriodEnd,
						cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
					}
				: null,
		});
	} catch (error) {
		console.debug('Subscription fetch error:', error);
		return NextResponse.json({ error: 'Failed to fetch subscription' }, { status: 500 });
	}
}
