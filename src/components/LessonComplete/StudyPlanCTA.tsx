'use client';

import { BookOpenIcon, SparklesIcon, Tick01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { memo, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useQuizResultStore } from '@/stores/useQuizResultStore';
import { useQuizToStudyPlanStore, type WeakTopic } from '@/stores/useQuizToStudyPlanStore';
import type { TopicStats } from '@/types/quiz';

interface StudyPlanCTAProps {
	onNavigateToStudyPlan: (topics: WeakTopic[]) => void;
}

export const StudyPlanCTA = memo(function StudyPlanCTA({
	onNavigateToStudyPlan,
}: StudyPlanCTAProps) {
	const weakTopics = useQuizToStudyPlanStore((s) => s.weakTopics);
	const hasSyncedFromQuiz = useQuizToStudyPlanStore((s) => s.hasSyncedFromQuiz);
	const quizResult = useQuizResultStore((s) => s.get());
	const [showCTA, setShowCTA] = useState(false);

	useEffect(() => {
		if (weakTopics.length > 0 || hasSyncedFromQuiz) {
			setShowCTA(true);
		} else if (quizResult && weakTopics.length === 0) {
			setShowCTA(true);
		}
	}, [weakTopics, hasSyncedFromQuiz, quizResult]);

	if (!showCTA) return null;

	const quizTopicStats = (quizResult as { topicStats?: TopicStats[] })?.topicStats;
	const topicCount =
		weakTopics.length ||
		quizTopicStats?.filter((t) => t.total > 0 && t.correct / t.total < 0.6).length ||
		0;

	if (topicCount === 0) return null;

	return (
		<div className="w-full max-w-md">
			<div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 space-y-3">
				<div className="flex items-center gap-3">
					<div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
						<HugeiconsIcon icon={BookOpenIcon} className="w-5 h-5 text-primary" />
					</div>
					<div className="flex-1">
						<p className="font-black text-sm text-foreground">
							{topicCount} weak {topicCount === 1 ? 'topic' : 'topics'} detected
						</p>
						<p className="text-xs text-muted-foreground">from your quiz results</p>
					</div>
				</div>
				<Button
					variant="outline"
					className="w-full h-12 rounded-xl font-black text-sm border-primary/30 hover:bg-primary/10 hover:border-primary/50 flex items-center justify-center gap-2"
					onClick={() => {
						const topics: WeakTopic[] =
							weakTopics.length > 0
								? weakTopics
								: ((quizTopicStats
										?.filter((t) => t.total > 0 && t.correct / t.total < 0.6)
										.map((t, i) => ({
											id: `weak-${i}`,
											topic: t.topic,
											subject: quizResult?.subjectName || 'unknown',
											confidence: t.correct / t.total,
											attempts: t.total,
											source: 'quiz' as const,
											addedAt: new Date(),
										})) || []) as WeakTopic[]);

						onNavigateToStudyPlan(topics);
					}}
				>
					<HugeiconsIcon icon={SparklesIcon} className="w-4 h-4" />
					add to study plan
				</Button>
			</div>
		</div>
	);
});

interface WeakTopicBadgeProps {
	topic: string;
	confidence: number;
	onRemove?: () => void;
}

export const WeakTopicBadge = memo(function WeakTopicBadge({
	topic,
	confidence,
	onRemove,
}: WeakTopicBadgeProps) {
	const percentage = Math.round(confidence * 100);
	const isLow = confidence < 0.4;
	const isMedium = confidence >= 0.4 && confidence < 0.6;

	return (
		<div
			className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black ${
				isLow
					? 'bg-destructive/10 text-destructive'
					: isMedium
						? 'bg-orange-500/10 text-orange-500'
						: 'bg-muted text-muted-foreground'
			}`}
		>
			<span>{topic}</span>
			<span className="opacity-70">{percentage}%</span>
			{onRemove && (
				<button onClick={onRemove} className="hover:opacity-70 transition-opacity" type="button">
					<HugeiconsIcon icon={Tick01Icon} className="w-3 h-3" />
				</button>
			)}
		</div>
	);
});
