'use client';

import {
	AiBrain01Icon,
	AnalyticsDownIcon,
	AnalyticsUpIcon,
	ChampionIcon,
	ChartBar,
	Clock01Icon,
	Loading03Icon,
	Target01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { LearningStats } from '@/lib/adaptive-learning';

interface QuizAnalyticsModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function QuizAnalyticsModal({ open, onOpenChange }: QuizAnalyticsModalProps) {
	const {
		data: stats,
		isLoading,
		refetch,
	} = useQuery({
		queryKey: ['quiz-analytics'],
		queryFn: async () => {
			const response = await fetch('/api/quiz/analytics');
			if (!response.ok) throw new Error('Failed to load analytics');
			return response.json() as Promise<LearningStats>;
		},
		enabled: open,
	});

	const getAccuracyColor = (accuracy: number) => {
		if (accuracy >= 80) return 'text-green-600';
		if (accuracy >= 50) return 'text-yellow-600';
		return 'text-red-600';
	};

	const getTopicStatus = (topic: { accuracy: number; questionsAttempted: number }) => {
		if (topic.questionsAttempted < 3) return { label: 'New', variant: 'outline' as const };
		if (topic.accuracy >= 80) return { label: 'Mastered', variant: 'default' as const };
		if (topic.accuracy >= 50) return { label: 'Learning', variant: 'secondary' as const };
		return { label: 'Needs Work', variant: 'destructive' as const };
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[85vh]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<HugeiconsIcon icon={ChartBar} className="h-5 w-5" />
						Quiz Analytics
					</DialogTitle>
					<DialogDescription>Your learning progress and topic performance</DialogDescription>
				</DialogHeader>

				{isLoading ? (
					<div className="flex items-center justify-center py-8">
						<HugeiconsIcon
							icon={Loading03Icon}
							className="h-8 w-8 animate-spin text-muted-foreground"
						/>
					</div>
				) : stats ? (
					<ScrollArea className="max-h-[60vh] pr-4">
						<div className="space-y-6">
							<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
								<div className="rounded-lg border p-4 text-center">
									<HugeiconsIcon
										icon={ChampionIcon}
										className="h-6 w-6 mx-auto mb-2 text-yellow-500"
									/>
									<div className="text-2xl font-bold">{stats.totalQuestions}</div>
									<div className="text-xs text-muted-foreground">Questions</div>
								</div>
								<div className="rounded-lg border p-4 text-center">
									<HugeiconsIcon
										icon={Target01Icon}
										className="h-6 w-6 mx-auto mb-2 text-blue-500"
									/>
									<div className={`text-2xl font-bold ${getAccuracyColor(stats.overallAccuracy)}`}>
										{stats.overallAccuracy.toFixed(0)}%
									</div>
									<div className="text-xs text-muted-foreground">Accuracy</div>
								</div>
								<div className="rounded-lg border p-4 text-center">
									<HugeiconsIcon
										icon={AiBrain01Icon}
										className="h-6 w-6 mx-auto mb-2 text-purple-500"
									/>
									<div className="text-2xl font-bold">
										{stats.weakTopics.length +
											stats.strongTopics.length +
											stats.improvingTopics.length}
									</div>
									<div className="text-xs text-muted-foreground">Topics</div>
								</div>
							</div>

							<div className="space-y-2">
								<h4 className="font-medium flex items-center gap-2">
									<HugeiconsIcon icon={AnalyticsUpIcon} className="h-4 w-4 text-green-500" />
									Strong Topics
								</h4>
								{stats.strongTopics.length > 0 ? (
									<div className="space-y-2">
										{stats.strongTopics.slice(0, 5).map((topic) => (
											<div
												key={topic.topic}
												className="flex items-center justify-between rounded-lg border p-3"
											>
												<span className="font-medium">{topic.topic}</span>
												<div className="flex items-center gap-2">
													<Progress value={topic.accuracy} className="w-20 h-2" />
													<Badge variant="default">{topic.accuracy.toFixed(0)}%</Badge>
												</div>
											</div>
										))}
									</div>
								) : (
									<p className="text-sm text-muted-foreground">
										No strong topics yet. Keep practicing!
									</p>
								)}
							</div>

							<div className="space-y-2">
								<h4 className="font-medium flex items-center gap-2">
									<HugeiconsIcon icon={AnalyticsDownIcon} className="h-4 w-4 text-orange-500" />
									Topics to Focus On
								</h4>
								{stats.weakTopics.length > 0 ? (
									<div className="space-y-2">
										{stats.weakTopics.slice(0, 5).map((topic) => {
											const status = getTopicStatus(topic);
											return (
												<div
													key={topic.topic}
													className="flex items-center justify-between rounded-lg border border-orange-500/20 bg-orange-500/5 p-3"
												>
													<div>
														<span className="font-medium">{topic.topic}</span>
														<p className="text-xs text-muted-foreground">
															{topic.questionsAttempted} questions attempted
														</p>
													</div>
													<div className="flex items-center gap-2">
														<Progress value={topic.accuracy} className="w-20 h-2" />
														<Badge variant={status.variant}>{status.label}</Badge>
													</div>
												</div>
											);
										})}
									</div>
								) : (
									<p className="text-sm text-muted-foreground">
										Great job! No weak topics identified.
									</p>
								)}
							</div>

							<div className="space-y-2">
								<h4 className="font-medium flex items-center gap-2">
									<HugeiconsIcon icon={Clock01Icon} className="h-4 w-4 text-blue-500" />
									Recently Improved
								</h4>
								{stats.improvingTopics.length > 0 ? (
									<div className="space-y-2">
										{stats.improvingTopics.slice(0, 3).map((topic) => (
											<div
												key={topic.topic}
												className="flex items-center justify-between rounded-lg border p-3"
											>
												<span className="font-medium">{topic.topic}</span>
												<Badge variant="secondary">{topic.accuracy.toFixed(0)}%</Badge>
											</div>
										))}
									</div>
								) : (
									<p className="text-sm text-muted-foreground">
										Keep practicing to see improvements!
									</p>
								)}
							</div>

							{stats.needsReview.length > 0 && (
								<div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
									<h4 className="font-medium mb-2">Topics to Review</h4>
									<p className="text-sm text-muted-foreground mb-3">
										These topics haven't been practiced much yet:
									</p>
									<div className="flex flex-wrap gap-2">
										{stats.needsReview.slice(0, 5).map((topic) => (
											<Badge key={topic.topic} variant="outline">
												{topic.topic}
											</Badge>
										))}
									</div>
								</div>
							)}
						</div>
					</ScrollArea>
				) : (
					<div className="py-8 text-center text-muted-foreground">
						<p>Unable to load analytics. Please try again.</p>
						<Button variant="outline" className="mt-4" onClick={() => refetch()}>
							Retry
						</Button>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
