declare module '@paystack/paystack-sdk' {
	export interface InitializeTransactionResponse {
		data: {
			authorization_url: string;
			access_code: string;
			reference: string;
		};
		status: boolean;
		message: string;
	}

	export class PaystackProvider {
		constructor(secretKey: string);
		transaction: {
			initialize: (data: {
				amount: number;
				email: string;
				reference?: string;
				currency?: string;
				callback_url?: string;
				metadata?: Record<string, unknown> | string;
			}) => Promise<InitializeTransactionResponse>;
			verify: (reference: string) => Promise<{
				status: boolean;
				message: string;
				data: {
					status: string;
					amount: number;
					customer: { email: string };
					reference?: string;
					id?: number;
				};
			}>;
		};
		customer: {
			create: (data: { email: string; first_name?: string; last_name?: string }) => Promise<{
				status: boolean;
				message: string;
				data: { customer_code?: string };
			}>;
		};
		subscription: {
			create: (data: { customer: string; plan: string; email_token: string }) => Promise<{
				status: boolean;
				message: string;
				data?: { subscription_code?: string };
			}>;
			disable: (data: { code: string; token?: string }) => Promise<{
				status: boolean;
				message: string;
			}>;
			get: (code: string) => Promise<{
				status: boolean;
				message: string;
				data?: {
					status: string;
					subscription_code: string;
					plan_code: string;
					next_payment_date?: string;
				};
			}>;
		};
	}
}
