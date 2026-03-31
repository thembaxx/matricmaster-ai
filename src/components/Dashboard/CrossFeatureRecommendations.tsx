'use client';

import { BookOpen01Icon, BrainIcon, SparklesIcon, Target02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Recommendation {
	type: string;
	priority: 'high' | 'medium' | 'low';
	title: string;
	description: string;
	actionUrl: string;
	estimatedImpact: string;
}

const iconMap: Record<string, typeof BrainIcon> = {
	flashcard_generation: BookOpen01Icon,
	ai_tutor_session: BrainIcon,
	spaced_review: Target02Icon,
	milestone_progress: SparklesIcon,
};

const priorityStyles: Record<string, string> = {
	high: 'border-l-4 border-l-primary bg-primary/5',
	medium: 'border-l-4 border-l-amber-500 bg-amber-500/5',
	low: 'border-l-4 border-l-muted',
};

export function CrossFeatureRecommendations() {
	const { data, isLoading } = useQuery({
		queryKey: ['cross-feature-recommendations'],
		queryFn: async () => {
			const res = await fetch('/api/recommendations');
			if (!res.ok) return { recommendations: [] };
			return res.json();
		},
		select: (data: { recommendations: Recommendation[] }) => data.recommendations ?? [],
		staleTime: 5 * 60 * 1000,
	});

	if (isLoading || !data || data.length === 0) return null;

	return (
		<Card>
			<CardHeader className="pb-3">
				<CardTitle className="text-base font-medium flex items-center gap-2">
					<HugeiconsIcon icon={SparklesIcon} className="h-4 w-4 text-primary" />
					suggested actions
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3">
				{data.slice(0, 3).map((rec) => {
					const Icon = iconMap[rec.type] || Target02Icon;
					return (
						<div key={rec.type} className={cn('p-3 rounded-lg', priorityStyles[rec.priority])}>
							<div className="flex items-start gap-3">
								<HugeiconsIcon
									icon={Icon}
									className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0"
								/>
								<div className="flex-1 min-w-0">
									<p className="text-sm font-medium">{rec.title}</p>
									<p className="text-xs text-muted-foreground mt-0.5">{rec.description}</p>
									<div className="flex items-center gap-2 mt-2">
										<Button asChild size="sm" variant="secondary" className="h-7 text-xs">
											<Link href={rec.actionUrl}>start</Link>
										</Button>
										<span className="text-[10px] text-primary font-medium">
											{rec.estimatedImpact}
										</span>
									</div>
								</div>
							</div>
						</div>
					);
				})}
			</CardContent>
		</Card>
	);
}
