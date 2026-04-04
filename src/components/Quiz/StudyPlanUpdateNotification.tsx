'use client';

import {
	BookOpen02Icon,
	SparklesIcon,
	Target02Icon,
	TrendingDown,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { AnimatePresence, m } from 'framer-motion';
import { memo, useState } from 'react';
import { Button } from '@/components/ui/button';
import type { WeakTopic } from '@/lib/quiz-grader';

interface DifficultyAdjustment {
	topic: string;
	newDifficulty: 'easier' | 'harder' | 'same';
	reason: string;
}

interface StudyPlanUpdateNotificationProps {
	weakTopics: WeakTopic[];
	adjustment: {
		topicsPrioritized: string[];
		difficultyAdjustments: DifficultyAdjustment[];
		focusAreasUpdated: boolean;
		sessionsReordered: boolean;
	};
	onDismiss?: () => void;
	onViewPlan?: () => void;
}

export const StudyPlanUpdateNotification = memo(function StudyPlanUpdateNotification({
	weakTopics,
	adjustment,
	onDismiss,
	onViewPlan,
}: StudyPlanUpdateNotificationProps) {
	const [isExpanded, setIsExpanded] = useState(false);

	if (weakTopics.length === 0) return null;

	const getStruggleColor = (level: string) => {
		switch (level) {
			case 'high':
				return 'text-destructive bg-destructive/10';
			case 'medium':
				return 'text-warning bg-warning/10';
			default:
				return 'text-primary bg-primary/10';
		}
	};

	const getDifficultyIcon = (newDifficulty: string) => {
		switch (newDifficulty) {
			case 'easier':
				return <HugeiconsIcon icon={TrendingDown} className="w-4 h-4 text-primary" />;
			case 'harder':
				return <HugeiconsIcon icon={SparklesIcon} className="w-4 h-4 text-success" />;
			default:
				return <HugeiconsIcon icon={Target02Icon} className="w-4 h-4 text-muted-foreground" />;
		}
	};

	return (
		<AnimatePresence>
			<m.div
				initial={{ opacity: 0, y: 20, scale: 0.95 }}
				animate={{ opacity: 1, y: 0, scale: 1 }}
				exit={{ opacity: 0, y: -20, scale: 0.95 }}
				className="bg-card border border-border rounded-2xl shadow-lg overflow-hidden"
			>
				{/* Header */}
				<div className="p-4 bg-primary/5 border-b border-border">
					<div className="flex items-start gap-3">
						<div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
							<HugeiconsIcon icon={BookOpen02Icon} className="w-5 h-5 text-primary" />
						</div>
						<div className="flex-1 min-w-0">
							<h3 className="font-semibold text-foreground text-sm">Study Plan Updated</h3>
							<p className="text-xs text-muted-foreground mt-0.5">
								{weakTopics.length} topic{weakTopics.length > 1 ? 's' : ''} flagged for extra
								practice
							</p>
						</div>
						<Button variant="ghost" size="sm" onClick={onDismiss} className="shrink-0">
							Dismiss
						</Button>
					</div>
				</div>

				{/* Weak Topics Summary */}
				<div className="p-4 space-y-3">
					<div className="space-y-2">
						{weakTopics.slice(0, 3).map((topic) => (
							<div
								key={topic.topic}
								className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50"
							>
								<div className="flex items-center gap-2 min-w-0">
									<span className="text-sm font-medium text-foreground truncate">
										{topic.topic}
									</span>
									<span
										className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStruggleColor(topic.struggleLevel)}`}
									>
										{topic.struggleLevel}
									</span>
								</div>
								<span className="text-sm font-mono text-muted-foreground shrink-0 ml-2">
									{Math.round(topic.accuracy * 100)}%
								</span>
							</div>
						))}
						{weakTopics.length > 3 && (
							<p className="text-xs text-muted-foreground text-center py-1">
								+{weakTopics.length - 3} more topic{weakTopics.length - 3 > 1 ? 's' : ''}
							</p>
						)}
					</div>

					{/* Expand/Collapse for details */}
					{isExpanded && (
						<m.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: 'auto' }}
							className="space-y-3 pt-3 border-t border-border"
						>
							{/* Difficulty Adjustments */}
							{adjustment.difficultyAdjustments.length > 0 && (
								<div className="space-y-2">
									<p className="text-xs font-medium text-muted-foreground">
										Recommended Adjustments
									</p>
									{adjustment.difficultyAdjustments
										.filter((d) => d.newDifficulty !== 'same')
										.slice(0, 3)
										.map((adj) => (
											<div
												key={adj.topic}
												className="flex items-center gap-2 text-sm text-foreground"
											>
												{getDifficultyIcon(adj.newDifficulty)}
												<span className="truncate">{adj.topic}</span>
												<span className="text-xs text-muted-foreground">→ {adj.newDifficulty}</span>
											</div>
										))}
								</div>
							)}

							{/* Changes Made */}
							<div className="flex flex-wrap gap-2">
								{adjustment.focusAreasUpdated && (
									<span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
										Focus areas updated
									</span>
								)}
								{adjustment.sessionsReordered && (
									<span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
										Sessions reordered
									</span>
								)}
							</div>
						</m.div>
					)}

					{/* Action Buttons */}
					<div className="flex items-center gap-2 pt-2">
						<Button
							variant="outline"
							size="sm"
							className="flex-1"
							onClick={() => setIsExpanded(!isExpanded)}
						>
							{isExpanded ? 'Show Less' : 'Show Details'}
						</Button>
						<Button variant="default" size="sm" className="flex-1" onClick={onViewPlan}>
							View Study Plan
						</Button>
					</div>
				</div>
			</m.div>
		</AnimatePresence>
	);
});
