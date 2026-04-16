'use client';

import { BookOpen01Icon, BrainIcon, SparklesIcon, Target02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useQuery } from '@tanstack/react-query';
import { m } from 'framer-motion';
import Link from 'next/link';
import { memo } from 'react';
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

const priorityAccent: Record<string, string> = {
	high: '#3b82f6',
	medium: '#f59e0b',
	low: '#64748b',
};

export const CrossFeatureRecommendations = memo(function CrossFeatureRecommendations() {
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
		<Card className="relative overflow-hidden border border-border/30">
			<div className="absolute -top-8 -right-8 w-20 h-20 bg-primary/10 rounded-full blur-[40px]" />

			<CardHeader className="pb-3">
				<CardTitle className="text-base font-semibold flex items-center gap-2.5">
					<div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
						<HugeiconsIcon icon={SparklesIcon} className="h-4 w-4 text-primary" />
					</div>
					suggested actions
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3">
				{data.slice(0, 3).map((rec, index) => {
					const Icon = iconMap[rec.type] || Target02Icon;
					const accent = priorityAccent[rec.priority];
					return (
						<m.div
							key={rec.type}
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: index * 0.1 }}
							className={cn('p-4 rounded-xl', priorityStyles[rec.priority])}
						>
							<div className="flex items-start gap-3">
								<div
									className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
									style={{ backgroundColor: `${accent}15` }}
								>
									<HugeiconsIcon icon={Icon} className="h-4 w-4" style={{ color: accent }} />
								</div>
								<div className="flex-1 min-w-0">
									<p className="text-sm font-semibold text-foreground">{rec.title}</p>
									<p className="text-xs text-muted-foreground mt-1 leading-relaxed">
										{rec.description}
									</p>
									<div className="flex items-center gap-3 mt-3">
										<Button
											asChild
											size="sm"
											variant="secondary"
											className="h-7 text-xs font-medium"
										>
											<Link href={rec.actionUrl}>start</Link>
										</Button>
										<span className="text-[11px] font-medium" style={{ color: accent }}>
											{rec.estimatedImpact}
										</span>
									</div>
								</div>
							</div>
						</m.div>
					);
				})}
			</CardContent>
		</Card>
	);
});
