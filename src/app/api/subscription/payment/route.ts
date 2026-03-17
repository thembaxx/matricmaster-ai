import { eq } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';
import { AnalyticsEvents, trackEvent } from '@/lib/analytics';
import { getAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import { PLAN_TIERS, payments, userSubscriptions } from '@/lib/db/schema';
import { getEnv } from '@/lib/env';
import { initializePayment, verifyPayment } from '@/lib/payments/paystack';

export async function POST(request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const { planId, paymentType = 'subscription' } = body;

		const appUrl = getEnv('NEXT_PUBLIC_APP_URL');

		const plan = await db.query.subscriptionPlans.findFirst({
			where: (plans, { eq }) => eq(plans.id, planId),
		});

		if (!plan) {
			return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
		}

		if (planId === PLAN_TIERS.FREE) {
			return NextResponse.json({ error: 'Free plan does not require payment' }, { status: 400 });
		}

		const userEmail = session.user.email;
		if (!userEmail) {
			return NextResponse.json({ error: 'User email not found' }, { status: 400 });
		}

		const existingSubscription = await db.query.userSubscriptions.findFirst({
			where: (subs, { eq, and }) =>
				and(eq(subs.userId, session.user.id), eq(subs.status, 'active')),
		});

		if (existingSubscription && existingSubscription.planId === planId) {
			return NextResponse.json({ error: 'Already subscribed to this plan' }, { status: 400 });
		}

		const reference = `sub_${Date.now()}_${session.user.id.slice(0, 8)}`;

		const paymentData = await initializePayment({
			email: userEmail,
			amount: Number(plan.priceZar),
			reference,
			metadata: {
				userId: session.user.id,
				planId,
				paymentType,
			},
			callbackUrl: `${appUrl}/subscription/verify?ref=${reference}`,
		});

		if (!paymentData.status) {
			return NextResponse.json({ error: 'Failed to initialize payment' }, { status: 500 });
		}

		await db.insert(payments).values({
			userId: session.user.id,
			amount: plan.priceZar,
			paystackReference: reference,
			status: 'pending',
			metadata: JSON.stringify({ planId, paymentType }),
		});

		await trackEvent({
			event: 'payment_initialized',
			userId: session.user.id,
			properties: {
				planId,
				amount: plan.priceZar,
				reference,
			},
		});

		return NextResponse.json({
			authorizationUrl: paymentData.data?.authorization_url,
			reference,
		});
	} catch (error) {
		console.debug('Payment initialization error:', error);
		return NextResponse.json({ error: 'Payment initialization failed' }, { status: 500 });
	}
}

export async function GET(request: NextRequest) {
	const searchParams = request.nextUrl.searchParams;
	const reference = searchParams.get('reference');
	const status = searchParams.get('status');

	if (!reference) {
		return NextResponse.redirect(new URL('/subscription?error=no_reference', request.url));
	}

	try {
		const payment = await db.query.payments.findFirst({
			where: (p, { eq }) => eq(p.paystackReference, reference),
		});

		if (!payment) {
			return NextResponse.redirect(new URL('/subscription?error=payment_not_found', request.url));
		}

		if (status === 'cancelled') {
			return NextResponse.redirect(new URL('/subscription?cancelled=true', request.url));
		}

		const verification = await verifyPayment(reference);

		if (!verification.verified) {
			await db
				.update(payments)
				.set({ status: 'failed', failureReason: verification.message })
				.where(eq(payments.id, payment.id));

			return NextResponse.redirect(new URL('/subscription?error=verification_failed', request.url));
		}

		await db
			.update(payments)
			.set({
				status: 'success',
				paystackTransactionId: verification.transactionId,
			})
			.where(eq(payments.id, payment.id));

		const metadata = payment.metadata ? JSON.parse(payment.metadata) : {};
		const { planId, userId } = metadata;

		if (userId) {
			const existingSubscription = await db.query.userSubscriptions.findFirst({
				where: (subs, { eq, and }) => and(eq(subs.userId, userId), eq(subs.status, 'active')),
			});

			if (existingSubscription) {
				await db
					.update(userSubscriptions)
					.set({ status: 'inactive', updatedAt: new Date() })
					.where(eq(userSubscriptions.id, existingSubscription.id));
			}

			const periodStart = new Date();
			const periodEnd = new Date();
			periodEnd.setMonth(periodEnd.getMonth() + 1);

			await db.insert(userSubscriptions).values({
				userId,
				planId,
				status: 'active',
				currentPeriodStart: periodStart,
				currentPeriodEnd: periodEnd,
			});

			await trackEvent({
				event: AnalyticsEvents.PAYMENT_COMPLETED,
				userId,
				properties: {
					planId,
					amount: payment.amount,
					reference,
				},
			});
		}

		return NextResponse.redirect(new URL('/subscription?success=true', request.url));
	} catch (error) {
		console.debug('Payment verification error:', error);
		return NextResponse.redirect(new URL('/subscription?error=verification_error', request.url));
	}
}
