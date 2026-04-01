import crypto from 'node:crypto';
import { eq } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';
import { trackEvent } from '@/lib/analytics';
import { dbManager } from '@/lib/db';
import { payments, userSubscriptions } from '@/lib/db/schema';
import { logger } from '@/lib/logger';

const webhookLogger = logger.createLogger('paystack-webhook');

async function getDbConnection() {
	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) throw new Error('Database not available');
	return dbManager.getDb();
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.text();
		const signature = request.headers.get('x-paystack-signature');

		webhookLogger.info('Paystack webhook received', {
			hasSignature: !!signature,
			bodyLength: body.length,
		});

		const secret = process.env.PAYSTACK_SECRET_KEY;
		if (!secret) {
			webhookLogger.error('Missing configuration', {
				missing: 'PAYSTACK_SECRET_KEY',
			});
			return NextResponse.json({ error: 'Server config error' }, { status: 500 });
		}

		const hash = crypto.createHmac('sha512', secret).update(body).digest('hex');

		if (hash !== signature) {
			webhookLogger.error('Webhook verification failed', {
				reason: 'Invalid signature',
			});
			return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
		}

		const event = JSON.parse(body);

		webhookLogger.info('Paystack webhook verified', {
			event: event.event,
			reference: event.data?.reference,
		});

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

			default:
				webhookLogger.warn('Unrecognized event type', {
					event: event.event,
					reference: event.data?.reference,
				});
		}

		return NextResponse.json({ received: true });
	} catch (error) {
		webhookLogger.error('Webhook processing error', {
			error: error instanceof Error ? error.message : 'Unknown error',
			stack: error instanceof Error ? error.stack : undefined,
		});
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
		webhookLogger.warn('Duplicate payment event detected', {
			reference: data.reference,
			customerEmail: data.customer.email,
			amount: data.amount,
			existingPaymentId: existing[0].id,
		});
		return;
	}

	webhookLogger.info('Processing successful payment', {
		reference: data.reference,
		customerEmail: data.customer.email,
		amount: data.amount,
		currency: data.currency,
		userId: data.metadata?.userId,
	});

	await db
		.update(payments)
		.set({
			status: 'success',
			paystackTransactionId: data.reference,
			updatedAt: new Date(),
		})
		.where(eq(payments.paystackReference, data.reference));

	webhookLogger.info('Payment verified and updated successfully', {
		reference: data.reference,
		amount: data.amount,
		customerEmail: data.customer.email,
	});

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
		webhookLogger.warn('Duplicate failed payment event detected', {
			reference: data.reference,
			customerEmail: data.customer.email,
			amount: data.amount,
			existingPaymentId: existing[0].id,
		});
		return;
	}

	const reason = data.gateway_response || `Payment failed - reference: ${data.reference}`;

	webhookLogger.info('Processing failed payment', {
		reference: data.reference,
		customerEmail: data.customer.email,
		amount: data.amount,
		reason,
	});

	await db
		.update(payments)
		.set({
			status: 'failed',
			failureReason: reason,
			updatedAt: new Date(),
		})
		.where(eq(payments.paystackReference, data.reference));

	webhookLogger.info('Payment failure recorded', {
		reference: data.reference,
		customerEmail: data.customer.email,
		amount: data.amount,
	});

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
		webhookLogger.warn('Subscription not renewed webhook missing subscription_code', {
			event: 'subscription.not_renewed',
		});
		return;
	}

	webhookLogger.info('Processing subscription not renewed', {
		subscriptionCode: _data.subscription_code,
	});

	await db
		.update(userSubscriptions)
		.set({
			status: 'expired',
			updatedAt: new Date(),
		})
		.where(eq(userSubscriptions.paystackSubscriptionCode, _data.subscription_code));

	webhookLogger.info('Subscription updated to expired', {
		subscriptionCode: _data.subscription_code,
	});
}

async function handleSubscriptionDisable(data: {
	subscription_code?: string;
	email_token?: string;
}) {
	webhookLogger.info('Processing subscription disable', {
		subscriptionCode: data.subscription_code,
	});

	await handleSubscriptionNotRenewed(data);
}
