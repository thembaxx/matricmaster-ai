'use client';

import { AlertCircleIcon, BookOpen01Icon, Tick01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { Topic } from '@/data/curriculum';
import { cn } from '@/lib/utils';

interface TopicCardProps {
	topic: Topic;
	subjectColor: string;
	onClick?: () => void;
}

export function TopicCard({ topic, subjectColor, onClick }: TopicCardProps) {
	const router = useRouter();

	const statusColors = {
		mastered: 'bg-success-soft border-success/20',
		'in-progress':
			topic.progress < 60
				? 'bg-destructive/10 border-destructive/30'
				: 'bg-warning-soft border-warning/20',
		'not-started': 'bg-muted/50 border-border/30',
	};

	const handleClick = () => {
		if (onClick) {
			onClick();
		}
	};

	const isHighMastery = topic.status === 'mastered' && topic.progress >= 90;

	return (
		<Card
			className={cn(
				'p-4 rounded-2xl border-2 transition-all group hover:scale-[1.01] cursor-pointer relative overflow-hidden',
				statusColors[topic.status],
				isHighMastery &&
					'before:absolute before:inset-0 before:rounded-[1.25rem] before:animate-pulse before:bg-success/5 before:border-2 before:border-success/30'
			)}
			onClick={handleClick}
		>
			{isHighMastery && (
				<div className="absolute inset-0 bg-gradient-to-r from-success/0 via-success/5 to-success/0 animate-[shimmer_3s_ease-in-out_infinite] rounded-[1.25rem]" />
			)}
			<div className="flex items-center justify-between gap-4">
				<div className="flex items-center gap-4 flex-1 min-w-0">
					<div
						className={cn(
							'w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2',
							topic.status === 'mastered'
								? subjectColor
								: topic.status === 'in-progress'
									? topic.progress < 60
										? 'bg-destructive/20 border-destructive'
										: 'bg-muted border-primary'
									: 'bg-muted border-muted-foreground/30'
						)}
					>
						{topic.status === 'mastered' && (
							<HugeiconsIcon icon={Tick01Icon} className="w-4 h-4 text-white" />
						)}
						{topic.status === 'in-progress' && (
							<div
								className={cn(
									'w-3 h-3 rounded-full animate-pulse',
									topic.progress < 60 ? 'bg-destructive' : 'bg-primary'
								)}
							/>
						)}
						{topic.status === 'not-started' && (
							<HugeiconsIcon icon={BookOpen01Icon} className="w-4 h-4 text-muted-foreground" />
						)}
					</div>
					<div className="flex-1 min-w-0">
						<div className="flex items-center gap-2">
							<h3 className="font-bold text-sm truncate">{topic.name}</h3>
							{topic.isCustom && (
								<span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full font-medium">
									Custom
								</span>
							)}
							{topic.status === 'in-progress' && topic.progress < 60 && (
								<span className="text-[10px] px-1.5 py-0.5 bg-destructive/10 text-destructive rounded-full font-medium flex items-center gap-1">
									<HugeiconsIcon icon={AlertCircleIcon} className="w-2.5 h-2.5" />
									Weak
								</span>
							)}
						</div>
						{topic.status !== 'not-started' && (
							<div className="flex items-center gap-2 mt-1">
								<Progress value={topic.progress} className="flex-1 h-1.5" />
								<span className="text-[10px] font-bold text-muted-foreground whitespace-nowrap">
									{topic.progress}% · {topic.questionsAttempted} Qs
								</span>
							</div>
						)}
					</div>
				</div>

				<div className="flex items-center gap-2">
					{topic.status === 'mastered' && (
						<div className="flex items-center gap-1 text-warning mr-2">
							<span className="text-warning">★</span>
						</div>
					)}
					{topic.status !== 'not-started' && (
						<Button
							size="sm"
							variant={topic.status === 'mastered' ? 'outline' : 'default'}
							className="rounded-full font-bold text-xs px-4 shrink-0"
							onClick={(e) => {
								e.stopPropagation();
								router.push(`/quiz?topic=${topic.id}`);
							}}
						>
							{topic.status === 'mastered' ? 'Review' : 'Continue'}
						</Button>
					)}
					{topic.status === 'not-started' && (
						<Button
							size="sm"
							variant="outline"
							className="rounded-full font-bold text-xs px-4 shrink-0"
							onClick={(e) => {
								e.stopPropagation();
								if (onClick) onClick();
							}}
						>
							Start
						</Button>
					)}
				</div>
			</div>
		</Card>
	);
}

interface TopicCardAnimatedProps extends TopicCardProps {
	index: number;
}

export function TopicCardAnimated({ topic, subjectColor, onClick, index }: TopicCardAnimatedProps) {
	return (
		<m.div
			initial={{ opacity: 0, x: -20 }}
			animate={{ opacity: 1, x: 0 }}
			transition={{ delay: index * 0.05 }}
		>
			<TopicCard topic={topic} subjectColor={subjectColor} onClick={onClick} />
		</m.div>
	);
}
