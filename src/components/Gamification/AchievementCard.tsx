'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { AchievementDefinition } from '@/constants/achievements';

interface AchievementCardProps {
	achievement: AchievementDefinition;
	progress: number; // 0 to 100
	unlocked: boolean;
	onClaim?: () => void;
	className?: string;
}

export function AchievementCard({
	achievement,
	progress,
	unlocked,
	onClaim,
	className,
}: AchievementCardProps) {
	return (
		<Card
			variant={unlocked ? 'elevated' : 'default'}
			className={cn(
				'relative overflow-hidden group transition-all duration-500',
				!unlocked && 'opacity-80 grayscale',
				className
			)}
			hoverable
		>
			<CardContent className="p-5 flex flex-col gap-4">
				<div className="flex items-start justify-between">
					<div
						className={cn(
							'w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6',
							unlocked ? 'bg-primary-violet/10' : 'bg-muted'
						)}
					>
						<span role="img" aria-label={achievement.name} className={cn(!unlocked && 'opacity-50')}>
							{unlocked ? achievement.icon : '🔒'}
						</span>
					</div>
					{unlocked && (
						<Badge variant="violet" size="sm" className="animate-pulse">
							Unlocked
						</Badge>
					)}
				</div>

				<div className="space-y-1">
					<h3 className="font-heading font-bold text-lg leading-tight">
						{achievement.name}
					</h3>
					<p className="text-xs text-muted-foreground line-clamp-2">
						{achievement.description}
					</p>
				</div>

				<div className="space-y-2 mt-auto">
					<div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
						<span className="text-muted-foreground">Progress</span>
						<span className={unlocked ? 'text-primary-violet' : 'text-muted-foreground'}>
							{progress}%
						</span>
					</div>
					<Progress
						value={progress}
						variant={unlocked ? 'violet' : 'default'}
						className="h-1.5"
					/>
				</div>
			</CardContent>

			{unlocked && (
				<motion.div
					initial={{ opacity: 0 }}
					whileHover={{ opacity: 1 }}
					className="absolute inset-0 bg-primary-violet/5 pointer-events-none"
				/>
			)}
		</Card>
	);
}
