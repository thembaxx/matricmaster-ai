import crypto from 'node:crypto';
import { eq } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';
import { trackEvent } from '@/lib/analytics';
import { dbManager } from '@/lib/db';
import { payments, userSubscriptions } from '@/lib/db/schema';

async function getDbConnection() {
	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) throw new Error('Database not available');
	return dbManager.getDb();
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.text();
		const signature = request.headers.get('x-paystack-signature');

		const secret = process.env.PAYSTACK_SECRET_KEY;
		if (!secret) {
			console.error('PAYSTACK_SECRET_KEY not configured');
			return NextResponse.json({ error: 'Server config error' }, { status: 500 });
		}

		const hash = crypto.createHmac('sha512', secret).update(body).digest('hex');

		if (hash !== signature) {
			return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
		}

		const event = JSON.parse(body);

		switch (event.event) {
			case 'charge.success':
				await handleSuccessfulCharge(event.data);
				break;

			case 'charge.failed':
				await handleFailedCharge(event.data);
				break;

			case 'subscription.not_renewed':
				await handleSubscriptionNotRenewed(event.data);
				break;

			case 'subscription.disable':
				await handleSubscriptionDisable(event.data);
				break;
		}

		return NextResponse.json({ received: true });
	} catch (error) {
		console.error('Webhook processing error:', error);
		return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
	}
}

async function handleSuccessfulCharge(data: {
	reference: string;
	customer: { email: string };
	amount: number;
	currency?: string;
	metadata?: Record<string, unknown>;
}) {
	const db = await getDbConnection();

	const existing = await db
		.select()
		.from(payments)
		.where(eq(payments.paystackReference, data.reference))
		.limit(1);

	if (existing.length > 0 && existing[0].status === 'success') {
		console.debug(`Payment ${data.reference} already processed, skipping`);
		return;
	}

	await db
		.update(payments)
		.set({
			status: 'success',
			paystackTransactionId: data.reference,
			updatedAt: new Date(),
		})
		.where(eq(payments.paystackReference, data.reference));

	if (data.metadata?.userId) {
		await trackEvent({
			event: 'payment_completed',
			userId: data.metadata.userId as string,
			properties: {
				reference: data.reference,
				amount: data.amount,
				source: 'webhook',
			},
		});
	}
}

async function handleFailedCharge(data: {
	reference: string;
	customer: { email: string };
	amount: number;
	gateway_response?: string;
	metadata?: Record<string, unknown>;
}) {
	const db = await getDbConnection();

	const existing = await db
		.select()
		.from(payments)
		.where(eq(payments.paystackReference, data.reference))
		.limit(1);

	if (existing.length > 0 && existing[0].status === 'failed') {
		console.debug(`Payment ${data.reference} already marked as failed, skipping`);
		return;
	}

	const reason = data.gateway_response || `Payment failed - reference: ${data.reference}`;

	await db
		.update(payments)
		.set({
			status: 'failed',
			failureReason: reason,
			updatedAt: new Date(),
		})
		.where(eq(payments.paystackReference, data.reference));

	console.debug(`Payment failed for ${data.customer.email}: ${reason}`);

	if (data.metadata?.userId) {
		await trackEvent({
			event: 'payment_failed',
			userId: data.metadata.userId as string,
			properties: {
				reference: data.reference,
				amount: data.amount,
			},
		});
	}
}

async function handleSubscriptionNotRenewed(_data: {
	subscription_code?: string;
	email_token?: string;
}) {
	const db = await getDbConnection();

	if (!_data.subscription_code) {
		console.warn('subscription.not_renewed webhook missing subscription_code, skipping');
		return;
	}

	await db
		.update(userSubscriptions)
		.set({
			status: 'expired',
			updatedAt: new Date(),
		})
		.where(eq(userSubscriptions.paystackSubscriptionCode, _data.subscription_code));
}

async function handleSubscriptionDisable(data: {
	subscription_code?: string;
	email_token?: string;
}) {
	await handleSubscriptionNotRenewed(data);
}
