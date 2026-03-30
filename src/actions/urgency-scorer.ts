'use server';

import { getTopicMarkWeight } from '@/content/curriculum/topic-weights';
import { useAiContextStore } from '@/stores/useAiContextStore';
import type { UrgencyScore, UrgencySummary } from '@/types/urgency';
import { getDaysUntilExam } from './exam-countdown-prioritizer';

function getPriority(score: number): 'critical' | 'high' | 'medium' | 'low' {
	if (score >= 80) return 'critical';
	if (score >= 60) return 'high';
	if (score >= 40) return 'medium';
	return 'low';
}

function getRecommendedDays(combinedScore: number, daysUntilExam: number): number {
	if (combinedScore >= 80) return Math.ceil(daysUntilExam * 0.15);
	if (combinedScore >= 60) return Math.ceil(daysUntilExam * 0.2);
	if (combinedScore >= 40) return Math.ceil(daysUntilExam * 0.25);
	return Math.ceil(daysUntilExam * 0.3);
}

function generateReason(
	examUrgency: number,
	weaknessUrgency: number,
	markWeightUrgency: number
): string {
	const reasons: string[] = [];
	if (examUrgency >= 60) reasons.push('exam approaching');
	if (weaknessUrgency >= 50) reasons.push('knowledge gap');
	if (markWeightUrgency >= 20) reasons.push('high mark contribution');
	return reasons.length > 0 ? reasons.join(', ') : 'scheduled review';
}

export async function calculateTopicUrgency(topic: string, subject: string): Promise<UrgencyScore> {
	const daysRemaining = getDaysUntilExam();
	const examUrgency =
		daysRemaining > 180 ? 10 : daysRemaining > 90 ? 30 : daysRemaining > 30 ? 60 : 80;

	const { getWeakTopics } = useAiContextStore.getState?.() ?? { getWeakTopics: () => [] };
	const weakTopics = getWeakTopics() ?? [];
	const topicWeakness = weakTopics.find((w) => w.topic === topic && w.subject === subject);
	const weaknessUrgency = topicWeakness ? topicWeakness.failureRate : 10;

	const markWeight = getTopicMarkWeight(subject, topic);
	const markWeightUrgency = (markWeight / 100) * 100;

	const combinedScore = Math.round(
		examUrgency * 0.4 + weaknessUrgency * 0.4 + markWeightUrgency * 0.2
	);

	return {
		topic,
		subject,
		examUrgency,
		weaknessUrgency,
		markWeightUrgency,
		combinedScore,
		priority: getPriority(combinedScore),
		recommendedDays: getRecommendedDays(combinedScore, daysRemaining),
		reason: generateReason(examUrgency, weaknessUrgency, markWeightUrgency),
	};
}

export async function calculateAllTopicsUrgency(): Promise<UrgencySummary> {
	const { getWeakTopics } = useAiContextStore.getState?.() ?? { getWeakTopics: () => [] };
	const weakTopics = getWeakTopics() ?? [];
	const daysRemaining = getDaysUntilExam();

	const urgencyScores = await Promise.all(
		weakTopics.map((w) => calculateTopicUrgency(w.topic, w.subject))
	);

	const sorted = [...urgencyScores].sort((a, b) => b.combinedScore - a.combinedScore);

	return {
		totalTopics: sorted.length,
		criticalTopics: sorted.filter((s) => s.priority === 'critical'),
		highTopics: sorted.filter((s) => s.priority === 'high'),
		mediumTopics: sorted.filter((s) => s.priority === 'medium'),
		lowTopics: sorted.filter((s) => s.priority === 'low'),
		examDaysRemaining: daysRemaining,
		urgencyLevel:
			sorted.length > 0 && sorted[0].combinedScore >= 80
				? 'critical'
				: sorted.length > 0 && sorted[0].combinedScore >= 60
					? 'high'
					: sorted.length > 0 && sorted[0].combinedScore >= 40
						? 'medium'
						: 'low',
	};
}
