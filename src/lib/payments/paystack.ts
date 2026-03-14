import { type InitializeTransactionResponse, PaystackProvider } from '@paystack/paystack-sdk';
import { getEnv } from '../env';

let paystackClient: PaystackProvider | null = null;

export function getPaystack(): PaystackProvider {
	if (paystackClient) return paystackClient;

	const secretKey = getEnv('PAYSTACK_SECRET_KEY');
	if (!secretKey) {
		throw new Error('Paystack secret key not configured');
	}

	paystackClient = new PaystackProvider(secretKey);
	return paystackClient;
}

export interface InitializePaymentParams {
	email: string;
	amount: number;
	currency?: string;
	reference?: string;
	metadata?: Record<string, unknown>;
	callbackUrl?: string;
}

export interface PaymentVerificationResult {
	verified: boolean;
	amount?: number;
	reference?: string;
	transactionId?: string;
	status?: string;
	message?: string;
}

export async function initializePayment(
	params: InitializePaymentParams
): Promise<InitializeTransactionResponse> {
	const client = getPaystack();
	const { email, amount, currency = 'ZAR', reference, metadata, callbackUrl } = params;

	const response = await client.transaction.initialize({
		email,
		amount: amount * 100,
		currency,
		reference,
		metadata: JSON.stringify(metadata || {}),
		callback_url: callbackUrl,
	});

	return response;
}

export async function verifyPayment(reference: string): Promise<PaymentVerificationResult> {
	const client = getPaystack();

	try {
		const response = await client.transaction.verify(reference);
		return {
			verified: response.status && response.data.status === 'success',
			amount: response.data.amount ? response.data.amount / 100 : undefined,
			reference: response.data.reference,
			transactionId: response.data.id?.toString(),
			status: response.data.status,
			message: response.message,
		};
	} catch (error) {
		console.error('Paystack verification error:', error);
		return {
			verified: false,
			message: error instanceof Error ? error.message : 'Verification failed',
		};
	}
}

export async function createCustomer(
	email: string,
	firstName?: string,
	lastName?: string
): Promise<string | null> {
	const client = getPaystack();

	try {
		const response = await client.customer.create({
			email,
			first_name: firstName,
			last_name: lastName,
		});

		if (response.status && response.data?.customer_code) {
			return response.data.customer_code;
		}
		return null;
	} catch (error) {
		console.error('Paystack customer creation error:', error);
		return null;
	}
}

export async function createSubscription(
	customerCode: string,
	subscriptionCode: string,
	emailToken: string
): Promise<{ success: boolean; subscriptionId?: string; message?: string }> {
	const client = getPaystack();

	try {
		const response = await client.subscription.create({
			customer: customerCode,
			plan: subscriptionCode,
			email_token: emailToken,
		});

		return {
			success: response.status,
			subscriptionId: response.data?.subscription_code,
			message: response.message,
		};
	} catch (error) {
		console.error('Paystack subscription creation error:', error);
		return {
			success: false,
			message: error instanceof Error ? error.message : 'Subscription creation failed',
		};
	}
}

export async function disableSubscription(subscriptionCode: string): Promise<boolean> {
	const client = getPaystack();

	try {
		const response = await client.subscription.disable({
			code: subscriptionCode,
			token: undefined,
		});
		return response.status;
	} catch (error) {
		console.error('Paystack subscription disable error:', error);
		return false;
	}
}

export async function getSubscription(subscriptionCode: string): Promise<{
	active: boolean;
	subscriptionCode: string;
	planCode?: string;
	currentPeriodEnd?: Date;
} | null> {
	const client = getPaystack();

	try {
		const response = await client.subscription.get(subscriptionCode);
		if (response.status && response.data) {
			return {
				active: response.data.status === 'active',
				subscriptionCode: response.data.subscription_code,
				planCode: response.data.plan_code,
				currentPeriodEnd: response.data.next_payment_date
					? new Date(response.data.next_payment_date)
					: undefined,
			};
		}
		return null;
	} catch (error) {
		console.error('Paystack subscription get error:', error);
		return null;
	}
}
