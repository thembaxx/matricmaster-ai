import { and, asc, eq } from 'drizzle-orm';
import { getDb } from './index';
import { PLAN_TIERS, type SubscriptionPlan, subscriptionPlans, userSubscriptions } from './schema';

const DEFAULT_PLANS: Omit<SubscriptionPlan, 'createdAt' | 'updatedAt'>[] = [
	{
		id: PLAN_TIERS.FREE,
		name: 'Free',
		description: 'Basic access for all students',
		priceZar: '0',
		billingInterval: 'monthly',
		features: [
			'3 past papers per month',
			'Basic AI explanations',
			'Limited flashcard decks',
			'Basic progress tracking',
			'Study streak tracking',
			'Ads supported',
		],
		isActive: true,
	},
	{
		id: PLAN_TIERS.PRO,
		name: 'Pro',
		description: 'Enhanced learning experience',
		priceZar: '99',
		billingInterval: 'monthly',
		features: [
			'Unlimited past papers',
			'Unlimited AI explanations',
			'Unlimited flashcard decks',
			'Advanced progress analytics',
			'No ads',
			'Offline mode',
			'AI personalized study plans',
			'Exam timer & mock exams',
		],
		isActive: true,
	},
	{
		id: PLAN_TIERS.PREMIUM,
		name: 'Premium',
		description: 'Complete exam preparation',
		priceZar: '199',
		billingInterval: 'monthly',
		features: [
			'Everything in Pro',
			'Live tutoring credits (2/month)',
			'Priority support',
			'Earn while you learn rewards',
			'Early access to new features',
			'University APS calculator',
			'Certificate of completion',
		],
		isActive: true,
	},
];

export async function seedSubscriptionPlans(): Promise<void> {
	console.log('Seeding subscription plans...');
	const dbClient = await getDb();

	for (const plan of DEFAULT_PLANS) {
		const existing = await dbClient
			.select()
			.from(subscriptionPlans)
			.where(eq(subscriptionPlans.id, plan.id))
			.limit(1);

		if (existing.length === 0) {
			await dbClient.insert(subscriptionPlans).values(plan);
			console.log(`✅ Created plan: ${plan.name}`);
		} else {
			console.log(`ℹ️ Plan already exists: ${plan.name}`);
		}
	}
}

export async function getPlanById(planId: string): Promise<SubscriptionPlan | undefined> {
	const dbClient = await getDb();
	const result = await dbClient
		.select()
		.from(subscriptionPlans)
		.where(eq(subscriptionPlans.id, planId))
		.limit(1);

	return result[0];
}

export async function getAllActivePlans(): Promise<SubscriptionPlan[]> {
	const dbClient = await getDb();
	return dbClient
		.select()
		.from(subscriptionPlans)
		.where(eq(subscriptionPlans.isActive, true))
		.orderBy(asc(subscriptionPlans.priceZar));
}

export async function getUserPlan(userId: string): Promise<SubscriptionPlan | null> {
	const dbClient = await getDb();
	const subscriptions = await dbClient
		.select()
		.from(userSubscriptions)
		.where(and(eq(userSubscriptions.userId, userId), eq(userSubscriptions.status, 'active')))
		.limit(1);

	if (subscriptions.length === 0) return null;

	const sub = subscriptions[0];
	const plans = await dbClient
		.select()
		.from(subscriptionPlans)
		.where(eq(subscriptionPlans.id, sub.planId))
		.limit(1);

	return plans[0] || null;
}
