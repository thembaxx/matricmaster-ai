export interface Plan {
	id: string;
	name: string;
	description: string;
	priceZar: string;
	billingInterval: string;
	features: string[];
}

export interface Subscription {
	planId: string;
	planName: string;
	status: string;
	currentPeriodEnd: Date;
}

export interface SubscriptionData {
	plans: Plan[];
	subscription: Subscription | null;
}
