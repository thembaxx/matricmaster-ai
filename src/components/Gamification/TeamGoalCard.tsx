'use client';

import { m } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { TeamGoalData } from '@/services/teamGoals';

function getTimeRemaining(endDate: Date): string {
	const diff = endDate.getTime() - Date.now();
	if (diff <= 0) return 'Ended';
	const days = Math.floor(diff / (1000 * 60 * 60 * 24));
	const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
	if (days > 0) return `${days}d ${hours}h`;
	return `${hours}h`;
}

interface TeamGoalCardProps {
	goal: TeamGoalData;
	onJoin?: () => void;
	onClaim?: () => void;
	isJoined?: boolean;
}

export function TeamGoalCard({ goal }: TeamGoalCardProps) {
	const progress = Math.min(100, (goal.current / goal.target) * 100);
	const isCompleted = goal.current >= goal.target;
	const isActive = goal.status === 'active';

	return (
		<m.div key={goal.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
			<Card
				className={cn('rounded-2xl relative overflow-hidden', isCompleted && 'border-success/30')}
			>
				{isCompleted && <div className="absolute top-0 left-0 w-full h-1 bg-success" />}
				<CardHeader className="pb-2">
					<div className="flex items-start justify-between">
						<CardTitle className="text-base font-black tracking-tight">{goal.title}</CardTitle>
						<Badge className="text-[9px] font-bold">+{goal.xpReward} XP</Badge>
					</div>
					<p className="text-xs text-muted-foreground">{goal.description}</p>
				</CardHeader>
				<CardContent className="space-y-4">
					<div>
						<div className="flex justify-between text-xs mb-1.5">
							<span className="font-bold text-muted-foreground">
								{goal.current}/{goal.target} {goal.goalType}
							</span>
							<span className="font-bold">{Math.round(progress)}%</span>
						</div>
						<Progress
							value={progress}
							className="h-2"
							style={
								{
									'--progress-background': isCompleted
										? 'hsl(var(--success))'
										: 'hsl(var(--primary))',
								} as React.CSSProperties
							}
						/>
					</div>

					<div className="flex items-center justify-between">
						<div className="flex items-center gap-1">
							{goal.members.slice(0, 5).map(
								(m): React.ReactNode => (
									<Avatar
										key={m.userId}
										className="w-6 h-6 border-2 border-background -ml-1 first:ml-0"
									>
										<AvatarImage src={m.image || undefined} />
										<AvatarFallback className="text-[8px] font-bold">{m.name?.[0]}</AvatarFallback>
									</Avatar>
								)
							)}
							<span className="text-[10px] font-bold text-muted-foreground ml-1">
								{goal.memberCount} members
							</span>
						</div>
						<span className="text-[10px] font-bold text-muted-foreground">
							{isActive ? getTimeRemaining(new Date(goal.endDate)) : 'Ended'}
						</span>
					</div>
				</CardContent>
			</Card>
		</m.div>
	);
}
