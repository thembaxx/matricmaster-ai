'use client';

import {
	Brain,
	ChevronRight,
	Clock,
	Loader2,
	Target,
	TrendingDown,
	TrendingUp,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { LearningStats, TopicPerformance } from '@/lib/adaptive-learning';

interface TopicMasteryCardProps {
	className?: string;
}

export function TopicMasteryCard({ className }: TopicMasteryCardProps) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(true);
	const [stats, setStats] = useState<LearningStats | null>(null);

	// biome-ignore lint/correctness/useExhaustiveDependencies: loadStats runs once on mount
	useEffect(() => {
		loadStats();
	}, []);

	const loadStats = async () => {
		setIsLoading(true);
		try {
			const response = await fetch('/api/quiz/analytics');
			if (response.ok) {
				const data = await response.json();
				setStats(data);
			}
		} catch (error) {
			console.error('Failed to load analytics:', error);
		} finally {
			setIsLoading(false);
		}
	};

	const getMasteryColor = (accuracy: number) => {
		if (accuracy >= 80) return 'text-green-600';
		if (accuracy >= 50) return 'text-yellow-600';
		return 'text-red-500';
	};

	if (isLoading) {
		return (
			<Card className={className}>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Brain className="h-5 w-5" />
						Topic Progress
					</CardTitle>
				</CardHeader>
				<CardContent className="flex items-center justify-center py-8">
					<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
				</CardContent>
			</Card>
		);
	}

	if (!stats) {
		return null;
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
						<Brain className="h-5 w-5" />
						Topic Progress
					</CardTitle>
				</CardHeader>
				<CardContent className="text-center py-6">
					<Target className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
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
		<Card className={className}>
			<CardHeader className="pb-2">
				<CardTitle className="flex items-center justify-between">
					<span className="flex items-center gap-2">
						<Brain className="h-5 w-5" />
						Topic Progress
					</span>
					<Button variant="ghost" size="sm" onClick={() => router.push('/review')}>
						View All
						<ChevronRight className="ml-1 h-4 w-4" />
					</Button>
				</CardTitle>
			</CardHeader>
			<CardContent>
				<ScrollArea className="h-[280px] pr-2">
					<div className="space-y-4">
						{stats.weakTopics.length > 0 && (
							<div className="space-y-2">
								<div className="flex items-center gap-2 text-sm font-medium">
									<TrendingDown className="h-4 w-4 text-red-500" />
									<span className="text-red-600">Needs Focus</span>
								</div>
								{stats.weakTopics.slice(0, 3).map((topic) => (
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
									<TrendingUp className="h-4 w-4 text-yellow-500" />
									<span className="text-yellow-600">Improving</span>
								</div>
								{stats.improvingTopics.slice(0, 2).map((topic) => (
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
									<Target className="h-4 w-4 text-green-500" />
									<span className="text-green-600">Mastered</span>
								</div>
								{stats.strongTopics.slice(0, 2).map((topic) => (
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
}

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
		<div className={`rounded-lg border p-3 ${borderColors[variant]} ${bgColors[variant]}`}>
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
							<Clock className="h-3 w-3" />
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
