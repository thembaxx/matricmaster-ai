'use client';

import {
	BookOpen01Icon,
	BrainIcon,
	Calendar02Icon,
	SparklesIcon,
	Target02Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { motion as m } from 'motion/react';
import Link from 'next/link';
import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Recommendation {
	id: string;
	type: 'quiz' | 'flashcard' | 'study-plan' | 'tutoring' | 'past-paper';
	priority: number;
	title: string;
	reason: string;
	actionUrl: string;
	estimatedMinutes: number;
	sourceFeature: string;
}

const typeIconMap: Record<string, typeof BookOpen01Icon> = {
	quiz: Target02Icon,
	flashcard: BookOpen01Icon,
	study_plan: Calendar02Icon,
	tutoring: BrainIcon,
	past_paper: Target02Icon,
};

const sourceFeatureColors: Record<string, string> = {
	'Review Queue': 'bg-rose-500/10 text-rose-500',
	Progress: 'bg-amber-500/10 text-amber-500',
	Flashcards: 'bg-violet-500/10 text-violet-500',
	'Study Planner': 'bg-emerald-500/10 text-emerald-500',
	'AI Tutor': 'bg-blue-500/10 text-blue-500',
};

interface RecommendationsCarouselProps {
	recommendations: Recommendation[];
	isLoading?: boolean;
}

function getTypeIcon(type: string) {
	return typeIconMap[type] || Target02Icon;
}

function getSourceColor(source: string) {
	return sourceFeatureColors[source] || 'bg-muted/50 text-muted-foreground';
}

function getPriorityBadge(index: number) {
	if (index === 0) {
		return (
			<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold">
				<HugeiconsIcon icon={SparklesIcon} className="h-3 w-3" />
				Do this next
			</span>
		);
	}
	return null;
}

export const RecommendationsCarousel = memo(function RecommendationsCarousel({
	recommendations,
	isLoading,
}: RecommendationsCarouselProps) {
	if (isLoading) {
		return (
			<div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
				{[1, 2, 3].map((i) => (
					<Card key={i} className="w-[260px] shrink-0 animate-pulse border-border/30">
						<CardContent className="p-4">
							<div className="h-4 w-20 bg-muted rounded mb-3" />
							<div className="h-5 w-full bg-muted rounded mb-2" />
							<div className="h-3 w-24 bg-muted rounded" />
						</CardContent>
					</Card>
				))}
			</div>
		);
	}

	if (!recommendations || recommendations.length === 0) {
		return null;
	}

	return (
		<div className="relative">
			<div className="flex gap-3 overflow-x-auto pb-2 px-1 scrollbar-hide">
				{recommendations.map((rec, index) => {
					const Icon = getTypeIcon(rec.type);
					const sourceColor = getSourceColor(rec.sourceFeature);
					const priorityBadge = getPriorityBadge(index);

					return (
						<m.div
							key={rec.id}
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: index * 0.05 }}
						>
							<Card className="w-[260px] shrink-0 border border-border/30 hover:border-primary/30 transition-colors">
								<CardContent className="p-4 space-y-3">
									<div className="flex items-center justify-between">
										<div
											className={cn('px-2 py-1 rounded-md text-[10px] font-medium', sourceColor)}
										>
											{rec.sourceFeature}
										</div>
										{priorityBadge}
									</div>

									<div className="flex items-start gap-3">
										<div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
											<HugeiconsIcon icon={Icon} className="h-4 w-4 text-primary" />
										</div>
										<div className="flex-1 min-w-0">
											<p className="text-sm font-semibold text-foreground truncate">{rec.title}</p>
											<p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
												{rec.reason}
											</p>
										</div>
									</div>

									<div className="flex items-center justify-between pt-1">
										<span className="text-[11px] text-muted-foreground">
											{rec.estimatedMinutes} min
										</span>
										<Button
											asChild
											size="sm"
											variant="secondary"
											className="h-7 text-xs font-medium"
										>
											<Link href={rec.actionUrl}>start</Link>
										</Button>
									</div>
								</CardContent>
							</Card>
						</m.div>
					);
				})}
			</div>
		</div>
	);
});
