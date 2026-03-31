'use server';

import { getAuth } from '@/lib/auth';
import { detectBurnoutRisk } from './burnout-study-plan-bridge';

interface EnergyBurnoutAssessment {
	energyLevel: 'high' | 'medium' | 'low';
	burnoutRisk: 'low' | 'medium' | 'high';
	combinedRecommendation: string;
	suggestedStudyIntensity: number;
	optimalStudyTimes: string[];
}

/**
 * Combined assessment of energy levels and burnout risk
 * to provide holistic study recommendations
 */
export async function getHolisticAssessment(): Promise<EnergyBurnoutAssessment> {
	const auth = await getAuth();
	const session = await auth.api.getSession();
	if (!session?.user) {
		return {
			energyLevel: 'medium',
			burnoutRisk: 'low',
			combinedRecommendation: 'Sign in to get personalized recommendations',
			suggestedStudyIntensity: 70,
			optimalStudyTimes: ['09:00', '14:00', '19:00'],
		};
	}

	const burnout = await detectBurnoutRisk(session.user.id);

	// Combine burnout risk with default energy patterns
	let energyLevel: 'high' | 'medium' | 'low' = 'medium';
	let suggestedIntensity = 70;

	if (burnout.level === 'high') {
		energyLevel = 'low';
		suggestedIntensity = 40;
	} else if (burnout.level === 'medium') {
		energyLevel = 'medium';
		suggestedIntensity = 60;
	} else {
		energyLevel = 'high';
		suggestedIntensity = 85;
	}

	// Generate combined recommendation
	const combinedRecommendation = generateCombinedRecommendation(
		energyLevel,
		burnout.level,
		burnout.factors
	);

	return {
		energyLevel,
		burnoutRisk: burnout.level,
		combinedRecommendation,
		suggestedStudyIntensity: suggestedIntensity,
		optimalStudyTimes: ['09:00', '14:00', '19:00'],
	};
}

function generateCombinedRecommendation(
	_energy: string,
	burnout: string,
	factors: string[]
): string {
	if (burnout === 'high') {
		return 'Your study patterns suggest high burnout risk. Focus on shorter, more frequent sessions with plenty of breaks. Consider reviewing easier material to rebuild confidence.';
	}

	if (burnout === 'medium') {
		return "You're showing some signs of study fatigue. Mix challenging topics with review material and ensure you're taking regular breaks.";
	}

	if (factors.length > 0) {
		return (
			'Your energy levels look good! Maintain your current routine while addressing these areas: ' +
			factors.slice(0, 2).join(', ')
		);
	}

	return "Great energy levels! You're in an optimal state for tackling challenging topics.";
}

export type { EnergyBurnoutAssessment };
