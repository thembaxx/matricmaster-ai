'use client';

import {
	AiBrain01Icon,
	AnalyticsDownIcon,
	AnalyticsUpIcon,
	ArrowRight01Icon,
	Clock01Icon,
	Loading03Icon,
	Target01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { LearningStats, TopicPerformance } from '@/lib/adaptive-learning';

interface TopicMasteryCardProps {
	className?: string;
}

export const TopicMasteryCard = memo(function TopicMasteryCard({
	className,
}: TopicMasteryCardProps) {
	const router = useRouter();

	const {
		data: stats,
		isPending,
		error,
		refetch,
	} = useQuery<LearningStats>({
		queryKey: ['quiz-analytics'],
		queryFn: async () => {
			const response = await fetch('/api/quiz/analytics');
			if (!response.ok) throw new Error('Failed to load analytics');
			return response.json();
		},
		staleTime: 5 * 60 * 1000,
	});

	const hasError = !!error;

	const getMasteryColor = (accuracy: number) => {
		if (accuracy >= 80) return 'text-green-600';
		if (accuracy >= 50) return 'text-yellow-600';
		return 'text-red-500';
	};

	if (isPending) {
		return (
			<Card className={className}>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<HugeiconsIcon icon={AiBrain01Icon} className="h-5 w-5" />
						Topic Progress
					</CardTitle>
				</CardHeader>
				<CardContent className="flex items-center justify-center py-8">
					<HugeiconsIcon
						icon={Loading03Icon}
						className="h-6 w-6 animate-spin text-muted-foreground"
					/>
				</CardContent>
			</Card>
		);
	}

	if (hasError || !stats) {
		return (
			<Card className={className}>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<HugeiconsIcon icon={AiBrain01Icon} className="h-5 w-5" />
						Topic Progress
					</CardTitle>
				</CardHeader>
				<CardContent className="text-center py-6">
					<p className="text-sm text-destructive mb-3">Unable to load topic progress</p>
					<Button variant="outline" size="sm" onClick={() => refetch()}>
						Try Again
					</Button>
				</CardContent>
			</Card>
		);
	}

	const hasTopics =
		stats.weakTopics.length > 0 ||
		stats.strongTopics.length > 0 ||
		stats.improvingTopics.length > 0;

	if (!hasTopics) {
		return (
			<Card className={className}>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<HugeiconsIcon icon={AiBrain01Icon} className="h-5 w-5" />
						Topic Progress
					</CardTitle>
				</CardHeader>
				<CardContent className="text-center py-6">
					<HugeiconsIcon
						icon={Target01Icon}
						className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3"
					/>
					<p className="text-sm text-muted-foreground">
						Complete more quizzes to see your topic progress
					</p>
					<Button variant="outline" size="sm" className="mt-4" onClick={() => router.push('/quiz')}>
						Take a Quiz
					</Button>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className={`${className} premium-glass border-none rounded-[2rem] overflow-hidden`}>
			<CardHeader className="pb-2 px-8 pt-8">
				<CardTitle className="flex items-center justify-between">
					<span className="flex items-center gap-2 text-xl font-black text-foreground tracking-tight uppercase">
						<HugeiconsIcon icon={AiBrain01Icon} className="h-5 w-5 text-primary" />
						Topic Progress
					</span>
					<Button variant="ghost" size="sm" onClick={() => router.push('/review')}>
						View All
						<HugeiconsIcon icon={ArrowRight01Icon} className="ml-1 h-4 w-4" />
					</Button>
				</CardTitle>
			</CardHeader>
			<CardContent className="px-8 pb-8">
				<ScrollArea className="h-[320px] pr-4 -mr-4">
					<div className="space-y-4">
						{stats.weakTopics.length > 0 && (
							<div className="space-y-2">
								<div className="flex items-center gap-2 text-sm font-medium">
									<HugeiconsIcon icon={AnalyticsDownIcon} className="h-4 w-4 text-red-500" />
									<span className="text-red-600">Needs Focus</span>
								</div>
								{stats.weakTopics.slice(0, 3).map((topic: TopicPerformance) => (
									<TopicItem
										key={topic.topic}
										topic={topic}
										variant="weak"
										getMasteryColor={getMasteryColor}
									/>
								))}
							</div>
						)}

						{stats.improvingTopics.length > 0 && (
							<div className="space-y-2">
								<div className="flex items-center gap-2 text-sm font-medium">
									<HugeiconsIcon icon={AnalyticsUpIcon} className="h-4 w-4 text-yellow-500" />
									<span className="text-yellow-600">Improving</span>
								</div>
								{stats.improvingTopics.slice(0, 2).map((topic: TopicPerformance) => (
									<TopicItem
										key={topic.topic}
										topic={topic}
										variant="improving"
										getMasteryColor={getMasteryColor}
									/>
								))}
							</div>
						)}

						{stats.strongTopics.length > 0 && (
							<div className="space-y-2">
								<div className="flex items-center gap-2 text-sm font-medium">
									<HugeiconsIcon icon={Target01Icon} className="h-4 w-4 text-green-500" />
									<span className="text-green-600">Mastered</span>
								</div>
								{stats.strongTopics.slice(0, 2).map((topic: TopicPerformance) => (
									<TopicItem
										key={topic.topic}
										topic={topic}
										variant="strong"
										getMasteryColor={getMasteryColor}
									/>
								))}
							</div>
						)}
					</div>
				</ScrollArea>
			</CardContent>
		</Card>
	);
});

interface TopicItemProps {
	topic: TopicPerformance;
	variant: 'weak' | 'improving' | 'strong';
	getMasteryColor: (accuracy: number) => string;
}

function TopicItem({ topic, variant, getMasteryColor }: TopicItemProps) {
	const borderColors = {
		weak: 'border-red-500/20',
		improving: 'border-yellow-500/20',
		strong: 'border-green-500/20',
	};

	const bgColors = {
		weak: 'bg-red-500/5',
		improving: 'bg-yellow-500/5',
		strong: 'bg-green-500/5',
	};

	return (
		<div
			className={`rounded-2xl border p-4 transition-all hover:bg-white/50 dark:hover:bg-black/20 ${borderColors[variant]} ${bgColors[variant]}`}
		>
			<div className="flex items-center justify-between mb-2">
				<span className="text-sm font-medium line-clamp-1">{topic.topic}</span>
				<span className={`text-sm font-bold ${getMasteryColor(topic.accuracy)}`}>
					{topic.accuracy.toFixed(0)}%
				</span>
			</div>
			<Progress value={topic.accuracy} className="h-1.5" />
			<div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
				<span>{topic.questionsAttempted} questions</span>
				{topic.lastPracticed && (
					<>
						<span>•</span>
						<span className="flex items-center gap-1">
							<HugeiconsIcon icon={Clock01Icon} className="h-3 w-3" />
							{formatLastPracticed(topic.lastPracticed)}
						</span>
					</>
				)}
			</div>
		</div>
	);
}

function formatLastPracticed(date: Date | null): string {
	if (!date) return 'Never';
	const now = new Date();
	const diff = now.getTime() - new Date(date).getTime();
	const days = Math.floor(diff / (1000 * 60 * 60 * 24));

	if (days === 0) return 'Today';
	if (days === 1) return 'Yesterday';
	if (days < 7) return `${days} days ago`;
	if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
	return `${Math.floor(days / 30)} months ago`;
}
