import { db } from './index';
import { PLAN_TIERS, type SubscriptionPlan, subscriptionPlans } from './schema';

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

	for (const plan of DEFAULT_PLANS) {
		const existing = await db.query.subscriptionPlans.findFirst({
			where: (plans, { eq }) => eq(plans.id, plan.id),
		});

		if (!existing) {
			await db.insert(subscriptionPlans).values(plan);
			console.log(`✅ Created plan: ${plan.name}`);
		} else {
			console.log(`ℹ️ Plan already exists: ${plan.name}`);
		}
	}
}

export async function getPlanById(planId: string): Promise<SubscriptionPlan | undefined> {
	return db.query.subscriptionPlans.findFirst({
		where: (plans, { eq }) => eq(plans.id, planId),
	});
}

export async function getAllActivePlans(): Promise<SubscriptionPlan[]> {
	return db.query.subscriptionPlans.findMany({
		where: (plans, { eq }) => eq(plans.isActive, true),
		orderBy: (plans, { asc }) => [asc(plans.priceZar)],
	});
}

export async function getUserPlan(userId: string): Promise<SubscriptionPlan | null> {
	const subscription = await db.query.userSubscriptions.findFirst({
		where: (subs, { eq, and }) => and(eq(subs.userId, userId), eq(subs.status, 'active')),
		// @ts-expect-error - drizzle relations
		relations: { plan: true },
	});

	if (!subscription) return null;
	// @ts-expect-error - drizzle relations
	return subscription.plan;
}
