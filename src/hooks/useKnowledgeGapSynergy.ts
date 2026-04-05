'use client';

import { useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { useAiContextStore } from '@/stores/useAiContextStore';
import { useSmartSchedulerStore } from '@/stores/useSmartSchedulerStore';
import type { StudyBlock } from '@/types/smart-scheduler';

interface KnowledgeGap {
	topic: string;
	subject: string;
	failureRate: number;
	questionId?: string;
	score?: number;
	totalQuestions?: number;
}

interface KnowledgeGapSynergyConfig {
	autoGenerateFlashcards: boolean;
	autoScheduleReview: boolean;
	autoTriggerTutor: boolean;
	reviewSessionDuration: number;
	reviewSessionCount: number;
}

export function useKnowledgeGapSynergy(config?: Partial<KnowledgeGapSynergyConfig>) {
	const { addActivity, getWeakTopics } = useAiContextStore();

	const { saveBlock } = useSmartSchedulerStore();

	const defaultConfig = useMemo<KnowledgeGapSynergyConfig>(
		() => ({
			autoGenerateFlashcards: true,
			autoScheduleReview: true,
			autoTriggerTutor: false,
			reviewSessionDuration: 30,
			reviewSessionCount: 3,
			...config,
		}),
		[config]
	);

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const generateFlashcardsForGaps = useCallback(
		async (gaps: KnowledgeGap[]) => {
			try {
				const response = await fetch('/api/learning-loop/generate-flashcards', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						topics: gaps.slice(0, defaultConfig.reviewSessionCount).map((g) => ({
							topic: g.topic,
							subject: g.subject,
						})),
					}),
				});

				const data = await response.json();

				if (data.success && data.cardsCreated > 0) {
					toast.success(`Created ${data.cardsCreated} flashcards from your knowledge gaps!`, {
						action: {
							label: 'Review',
							onClick: () => {
								window.location.href = '/flashcards';
							},
						},
					});
				}
			} catch (error) {
				console.debug('Failed to generate flashcards:', error);
			}
		},
		[defaultConfig]
	);

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const scheduleReviewSessions = useCallback(
		async (gaps: KnowledgeGap[]) => {
			const tomorrow = new Date();
			tomorrow.setDate(tomorrow.getDate() + 1);
			tomorrow.setHours(9, 0, 0, 0);

			const sessions: Partial<StudyBlock>[] = gaps
				.slice(0, defaultConfig.reviewSessionCount)
				.map((gap, index) => ({
					subject: gap.subject,
					topic: `Review: ${gap.topic}`,
					date: tomorrow,
					startTime: `${String(9 + index * 2).padStart(2, '0')}:00`,
					endTime: `${String(9 + index * 2 + 1).padStart(2, '0')}:00`,
					duration: defaultConfig.reviewSessionDuration,
					type: 'review' as const,
					isCompleted: false,
					isAISuggested: true,
				}));

			for (const session of sessions) {
				await saveBlock(session);
			}

			if (sessions.length > 0) {
				toast.success(`Scheduled ${sessions.length} review sessions for tomorrow!`, {
					action: {
						label: 'View',
						onClick: () => {
							window.location.href = '/study-path';
						},
					},
				});
			}
		},
		[saveBlock, defaultConfig]
	);

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const analyzeQuizResults = useCallback(
		async (
			questions: { id: string; topic?: string; subject?: string; isCorrect: boolean }[],
			_quizScore: { correct: number; total: number }
		) => {
			const topicStats: Record<string, { failed: number; total: number; subject: string }> = {};

			for (const q of questions) {
				const topic = q.topic || 'General';
				const subject = q.subject || 'General';
				const key = `${subject}-${topic}`;

				if (!topicStats[key]) {
					topicStats[key] = { failed: 0, total: 0, subject };
				}

				topicStats[key].total++;
				if (!q.isCorrect) {
					topicStats[key].failed++;
				}
			}

			const gaps: KnowledgeGap[] = Object.entries(topicStats)
				.map(([key, stats]) => {
					const [, topic] = key.split('-');
					const failureRate = (stats.failed / stats.total) * 100;
					return {
						topic,
						subject: stats.subject,
						failureRate,
						questionId: questions.find((q) => (q.topic || 'General') === topic && !q.isCorrect)?.id,
						score: Math.round(((stats.total - stats.failed) / stats.total) * 100),
						totalQuestions: stats.total,
					};
				})
				.filter((g) => g.failureRate > 0)
				.sort((a, b) => b.failureRate - a.failureRate);

			const poorPerforming = gaps.filter((g) => g.failureRate >= 50);

			if (poorPerforming.length > 0 && defaultConfig.autoGenerateFlashcards) {
				generateFlashcardsForGaps(poorPerforming);
			}

			if (poorPerforming.length > 0 && defaultConfig.autoScheduleReview) {
				scheduleReviewSessions(poorPerforming);
			}

			if (
				poorPerforming.length > 0 &&
				defaultConfig.autoTriggerTutor &&
				poorPerforming.length > 0
			) {
				const topGap = poorPerforming[0];
				addActivity({
					type: 'quiz',
					subject: topGap.subject,
					topic: topGap.topic,
					outcome: 'failed',
					score: topGap.score,
					description: `Quiz completed with ${topGap.failureRate}% failure rate in ${topGap.topic}`,
				});
			}

			return gaps;
		},
		[addActivity, defaultConfig, generateFlashcardsForGaps, scheduleReviewSessions]
	);

	const triggerTutorForGap = useCallback(
		(gap: KnowledgeGap) => {
			addActivity({
				type: 'quiz',
				subject: gap.subject,
				topic: gap.topic,
				outcome: 'failed',
				score: gap.score,
				description: `Requested tutoring for ${gap.topic}`,
			});

			return `/ai-tutor?topic=${encodeURIComponent(gap.topic)}&subject=${encodeURIComponent(gap.subject)}&context=knowledge-gap`;
		},
		[addActivity]
	);

	const getRecommendedFocus = useCallback(() => {
		const weakTopics = getWeakTopics();
		return weakTopics.slice(0, 5).map((wt) => ({
			topic: wt.topic,
			subject: wt.subject,
			priority: wt.failureRate > 70 ? 'high' : wt.failureRate > 50 ? 'medium' : 'low',
			recommendation:
				wt.failureRate > 70
					? 'Urgent review needed'
					: wt.failureRate > 50
						? 'Schedule review session'
						: 'Practice more questions',
		}));
	}, [getWeakTopics]);

	return {
		analyzeQuizResults,
		generateFlashcardsForGaps,
		scheduleReviewSessions,
		triggerTutorForGap,
		getRecommendedFocus,
	};
}
