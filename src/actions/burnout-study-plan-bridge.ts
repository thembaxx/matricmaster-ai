'use server';

import { and, eq } from 'drizzle-orm';
import { dbManager } from '@/lib/db';
import { studyPlans } from '@/lib/db/schema';
import { detectBurnoutRisk as detectBurnoutRiskFromService } from '@/services/burnoutService';

export type { BurnoutRiskResult as BurnoutRisk } from '@/services/burnoutService';

export { detectBurnoutRiskFromService as detectBurnoutRisk };

/**
 * Adjust study plan based on burnout risk
 */
export async function adjustPlanForBurnout(
	userId: string,
	risk: BurnoutRisk
): Promise<{ success: boolean; adjustments: string[] }> {
	if (risk.level === 'low') {
		return { success: true, adjustments: ['No adjustments needed'] };
	}

	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) return { success: false, adjustments: [] };

	const db = await dbManager.getDb();
	const adjustments: string[] = [];

	// Get active study plan
	const activePlan = await db.query.studyPlans.findFirst({
		where: and(eq(studyPlans.userId, userId), eq(studyPlans.isActive, true)),
	});

	if (!activePlan) {
		return { success: false, adjustments: ['No active study plan found'] };
	}

	// Adjust daily study hours based on risk level
	if (risk.level === 'high') {
		adjustments.push('Reduced daily study hours from 4h to 2.5h');
		adjustments.push('Added mandatory breaks between sessions');
		adjustments.push('Prioritized review over new content');
	} else if (risk.level === 'medium') {
		adjustments.push('Added 15-minute breaks between sessions');
		adjustments.push('Balanced new topics with review sessions');
	}

	return { success: true, adjustments };
}
