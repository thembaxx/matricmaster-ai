'use server';

import { eq } from 'drizzle-orm';
import { ensureAuthenticated } from './actions';
import { users } from './better-auth-schema';
import { getDb } from './index';

export async function completeOnboardingAction() {
	try {
		const user = await ensureAuthenticated();
		const db = await getDb();

		await db
			.update(users)
			.set({
				hasCompletedOnboarding: true,
				updatedAt: new Date(),
			})
			.where(eq(users.id, user.id));

		return { success: true };
	} catch (error) {
		console.debug('Error completing onboarding:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to complete onboarding',
		};
	}
}
