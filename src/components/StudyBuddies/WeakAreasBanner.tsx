'use client';

import { SparklesIcon, Target02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface WeakArea {
	subject: string;
	topic: string;
	confidence: number;
}

interface WeakAreasBannerProps {
	onSelectSubject: (subject: string) => void;
}

export function WeakAreasBanner({ onSelectSubject }: WeakAreasBannerProps) {
	const { data: weakAreas, isLoading } = useQuery({
		queryKey: ['weak-areas-topics'],
		queryFn: async () => {
			const res = await fetch('/api/progress/weak-topics');
			if (!res.ok) return [];
			const data = await res.json();
			return (data.topics ?? []) as WeakArea[];
		},
		select: (data) => data.slice(0, 5),
		staleTime: 5 * 60 * 1000,
	});

	if (isLoading || !weakAreas || weakAreas.length === 0) return null;

	const uniqueSubjects = [...new Set(weakAreas.map((w) => w.subject))];

	return (
		<div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-primary/5 border border-amber-500/20">
			<div className="flex items-start gap-3">
				<div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/10 shrink-0">
					<HugeiconsIcon icon={SparklesIcon} className="h-4 w-4 text-amber-600" />
				</div>
				<div className="flex-1 min-w-0">
					<p className="text-sm font-medium">find buddies who can help</p>
					<p className="text-xs text-muted-foreground mt-0.5">
						Connect with peers strong in your weak areas
					</p>
					<div className="flex flex-wrap gap-2 mt-3">
						{uniqueSubjects.map((subject) => {
							const weakTopics = weakAreas.filter((w) => w.subject === subject);
							const avgConfidence =
								weakTopics.reduce((sum, w) => sum + w.confidence, 0) / weakTopics.length;
							return (
								<Button
									key={subject}
									variant="outline"
									size="sm"
									className={cn(
										'h-7 text-xs gap-1.5',
										avgConfidence < 0.4 && 'border-red-500/50 text-red-600'
									)}
									onClick={() => onSelectSubject(subject)}
								>
									<HugeiconsIcon icon={Target02Icon} className="h-3 w-3" />
									{subject}
									<span className="text-muted-foreground">{Math.round(avgConfidence * 100)}%</span>
								</Button>
							);
						})}
					</div>
				</div>
			</div>
		</div>
	);
}
