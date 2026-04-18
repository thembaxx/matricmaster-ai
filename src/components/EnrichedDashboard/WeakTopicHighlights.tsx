'use client';

import { ArrowRight01Icon, Target01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { DURATION, EASING, STAGGER } from '@/lib/animation-presets';
import { cn } from '@/lib/utils';

interface WeakTopic {
	name: string;
	accuracy: number;
	attempted: number;
	suggestedAction: string;
}

interface WeakTopicHighlightsProps {
	topics: WeakTopic[];
}

function getAccuracyGradient(accuracy: number): string {
	if (accuracy < 30) {
		return 'from-destructive/20 to-destructive/5';
	}
	if (accuracy < 50) {
		return 'from-tiimo-orange/20 to-tiimo-orange/5';
	}
	return 'from-muted/20 to-muted/5';
}

function getAccuracyBadgeColor(accuracy: number): string {
	if (accuracy < 30) return 'text-destructive';
	if (accuracy < 50) return 'text-tiimo-orange';
	return 'text-muted-foreground';
}

export function WeakTopicHighlights({ topics }: WeakTopicHighlightsProps) {
	const router = useRouter();
	const prefersReducedMotion =
		typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	if (topics.length === 0) return null;

	const sorted = [...topics].sort((a, b) => a.accuracy - b.accuracy).slice(0, 5);

	const showViewAll = topics.length > 5;

	return (
		<Card>
			<CardHeader className="pb-3">
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2 text-base font-bold">
						<HugeiconsIcon icon={Target01Icon} className="w-5 h-5 text-destructive" />
						Focus Areas
					</CardTitle>
					{showViewAll && (
						<Button
							variant="ghost"
							size="sm"
							onClick={() => router.push('/curriculum-map')}
							className="text-xs"
						>
							View All
							<HugeiconsIcon icon={ArrowRight01Icon} className="w-3 h-3 ml-1" />
						</Button>
					)}
				</div>
			</CardHeader>
			<CardContent>
				<div className="space-y-3">
					{sorted.map((topic, idx) => (
						<m.div
							key={topic.name}
							initial={prefersReducedMotion ? {} : { opacity: 0, x: -8 }}
							animate={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
							transition={{
								delay: idx * STAGGER.SLOW,
								duration: DURATION.quick,
								ease: EASING.easeOut,
							}}
							className={cn(
								'p-4 rounded-xl bg-gradient-to-r border border-border/50',
								getAccuracyGradient(topic.accuracy)
							)}
						>
							<div className="flex items-start justify-between gap-3 mb-2">
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-2">
										<p className="text-sm font-medium truncate">{topic.name}</p>
										<span
											className={cn(
												'text-xs font-numeric font-bold shrink-0',
												getAccuracyBadgeColor(topic.accuracy)
											)}
										>
											{topic.accuracy}%
										</span>
									</div>
									<p className="text-xs text-muted-foreground mt-0.5">
										{topic.attempted} questions attempted
									</p>
								</div>
							</div>

							<div className="flex items-center gap-3">
								<div className="flex-1">
									<Progress
										value={topic.accuracy}
										className={cn(
											'h-1.5',
											topic.accuracy < 30 ? '[&>div]:bg-destructive' : '',
											topic.accuracy >= 30 && topic.accuracy < 50 ? '[&>div]:bg-tiimo-orange' : ''
										)}
									/>
								</div>
								<Button
									size="sm"
									variant="outline"
									className="h-7 text-xs shrink-0 rounded-lg"
									onClick={() => router.push(`/quiz?topic=${encodeURIComponent(topic.name)}`)}
								>
									Practice Now
								</Button>
							</div>

							<p className="text-xs text-muted-foreground mt-2">{topic.suggestedAction}</p>
						</m.div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
