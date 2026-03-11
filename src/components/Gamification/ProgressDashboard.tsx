'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { StreakCounter } from '@/components/ui/StreakCounter';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { LevelInfo } from '@/lib/level-utils';

interface ProgressDashboardProps {
	levelInfo: LevelInfo;
	streak: number;
	subjects: Array<{
		name: string;
		progress: number;
		color: 'violet' | 'cyan' | 'orange' | 'success';
	}>;
	className?: string;
}

export function ProgressDashboard({
	levelInfo,
	streak,
	subjects,
	className,
}: ProgressDashboardProps) {
	return (
		<div className={cn('grid gap-6 md:grid-cols-2 lg:grid-cols-3', className)}>
			{/* Level & Streak Overview */}
			<Card variant="elevated" className="lg:col-span-2">
				<CardHeader className="pb-2">
					<CardTitle className="text-2xl">Your Progress</CardTitle>
				</CardHeader>
				<CardContent className="grid sm:grid-cols-2 gap-8 items-center">
					<div className="flex items-center gap-6">
						<ProgressRing
							value={levelInfo.progressPercent}
							size={120}
							strokeWidth={12}
							variant="violet"
						/>
						<div className="space-y-1">
							<div className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
								Level {levelInfo.level}
							</div>
							<div className="text-2xl font-heading font-bold text-primary-violet">
								{levelInfo.title}
							</div>
							<div className="text-xs text-muted-foreground">
								{levelInfo.xpInCurrentLevel} / {levelInfo.xpForNextLevel} XP to Level {levelInfo.level + 1}
							</div>
						</div>
					</div>
					<div className="flex flex-col gap-4">
						<StreakCounter count={streak} />
						<div className="flex gap-2">
							<Badge variant="violet" icon="✨">
								{levelInfo.currentXp} Total XP
							</Badge>
							<Badge variant="outline">
								Grade 12
							</Badge>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Subject Progress */}
			<Card variant="default">
				<CardHeader className="pb-2">
					<CardTitle>Subject Mastery</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					{subjects.map((subject) => (
						<div key={subject.name} className="flex items-center justify-between gap-4">
							<span className="text-sm font-bold">{subject.name}</span>
							<div className="flex items-center gap-3">
								<div className="w-32 h-2 rounded-full bg-muted overflow-hidden">
									<div
										className={cn(
											'h-full transition-all duration-1000',
											subject.color === 'violet' && 'bg-primary-violet',
											subject.color === 'cyan' && 'bg-primary-cyan',
											subject.color === 'orange' && 'bg-primary-orange',
											subject.color === 'success' && 'bg-success'
										)}
										style={{ width: `${subject.progress}%` }}
									/>
								</div>
								<span className="text-xs font-bold w-8 text-right">
									{subject.progress}%
								</span>
							</div>
						</div>
					))}
				</CardContent>
			</Card>
		</div>
	);
}
