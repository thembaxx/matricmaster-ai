'use client';

import { CheckmarkCircleIcon, TargetIcon, UserGroupIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, m } from 'framer-motion';
import { useState } from 'react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { getTeamGoals, joinTeamGoal } from '@/services/teamGoals';

function getTimeRemaining(endDate: Date): string {
	const now = new Date();
	const diff = endDate.getTime() - now.getTime();
	if (diff <= 0) return 'Ended';
	const days = Math.floor(diff / (1000 * 60 * 60 * 24));
	const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
	if (days > 0) return `${days}d ${hours}h left`;
	return `${hours}h left`;
}

export function TeamGoals({ className }: { className?: string }) {
	const queryClient = useQueryClient();
	const [expandedGoal, setExpandedGoal] = useState<string | null>(null);

	const { data: goals, isLoading } = useQuery({
		queryKey: ['team-goals'],
		queryFn: () => getTeamGoals(),
		staleTime: 30_000,
	});

	const joinMutation = useMutation({
		mutationFn: (goalId: string) => joinTeamGoal(goalId),
		onSuccess: () => {
			toast.success('Joined team goal!', {
				icon: <HugeiconsIcon icon={UserGroupIcon} className="w-4 h-4" />,
			});
			queryClient.invalidateQueries({ queryKey: ['team-goals'] });
		},
		onError: (error: Error) => {
			toast.error(error.message || 'Failed to join');
		},
	});

	if (isLoading) {
		return (
			<Card className={cn('rounded-2xl', className)}>
				<CardHeader>
					<div className="h-6 w-32 bg-muted animate-pulse rounded-lg" />
				</CardHeader>
				<CardContent className="space-y-4">
					{[1, 2].map((item) => (
						<div
							key={`team-goals-skeleton-${item}`}
							className="h-32 bg-muted animate-pulse rounded-xl"
						/>
					))}
				</CardContent>
			</Card>
		);
	}

	if (!goals || goals.length === 0) return null;

	const activeGoals = goals.filter((g) => g.isActive);

	return (
		<Card className={cn('rounded-2xl', className)}>
			<CardHeader className="pb-3">
				<div className="flex items-center justify-between">
					<CardTitle className="text-lg font-black tracking-tight flex items-center gap-2">
						<div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
							<HugeiconsIcon icon={TargetIcon} className="w-4 h-4 text-primary" />
						</div>
						Team Goals
					</CardTitle>
					<Badge variant="secondary" className="text-[10px] font-bold">
						{activeGoals.length} active
					</Badge>
				</div>
			</CardHeader>

			<CardContent className="space-y-3">
				<AnimatePresence>
					{activeGoals.map((goal, idx) => {
						const progressPercent = Math.min(100, (goal.current / goal.target) * 100);
						const isCompleted = goal.current >= goal.target;
						const isExpanded = expandedGoal === goal.id;

						return (
							<m.div
								key={goal.id}
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: idx * 0.1 }}
								className={cn(
									'p-4 rounded-xl border-2 transition-all cursor-pointer',
									isCompleted
										? 'bg-success/5 border-success/30'
										: 'bg-card border-border hover:border-primary/20'
								)}
								onClick={() => setExpandedGoal(isExpanded ? null : goal.id)}
								onKeyDown={(e) => {
									if (e.key === 'Enter' || e.key === ' ') {
										setExpandedGoal(isExpanded ? null : goal.id);
									}
								}}
								role="button"
								tabIndex={0}
							>
								<div className="flex items-start justify-between mb-3">
									<div className="flex-1">
										<div className="flex items-center gap-2 mb-1">
											<h4 className="font-bold text-sm">{goal.title}</h4>
											{isCompleted && (
												<HugeiconsIcon
													icon={CheckmarkCircleIcon}
													className="w-4 h-4 text-success"
												/>
											)}
										</div>
										<p className="text-xs text-muted-foreground line-clamp-2">{goal.description}</p>
									</div>
									<Badge variant="secondary" className="text-[9px] font-bold shrink-0 ml-2">
										+{goal.xpReward} XP
									</Badge>
								</div>

								<div className="flex items-center gap-3 mb-3">
									<Progress
										value={progressPercent}
										className="h-2 flex-1"
										style={
											{
												'--progress-background': isCompleted
													? 'hsl(var(--success))'
													: 'hsl(var(--primary))',
											} as React.CSSProperties
										}
									/>
									<span className="text-[10px] font-bold text-muted-foreground whitespace-nowrap">
										{goal.current}/{goal.target}
									</span>
								</div>

								<div className="flex items-center justify-between">
									<div className="flex items-center gap-1">
										{goal.members.slice(0, 5).map((member) => (
											<Avatar
												key={member.userId}
												className="w-6 h-6 border-2 border-background -ml-1 first:ml-0"
											>
												<AvatarImage src={member.image || undefined} />
												<AvatarFallback className="text-[8px] font-bold">
													{member.name?.[0] || '?'}
												</AvatarFallback>
											</Avatar>
										))}
										{goal.memberCount > 5 && (
											<span className="text-[10px] font-bold text-muted-foreground ml-1">
												+{goal.memberCount - 5}
											</span>
										)}
									</div>

									<div className="flex items-center gap-2">
										<span className="text-[10px] text-muted-foreground font-medium">
											{getTimeRemaining(goal.endDate)}
										</span>
										{!goal.hasJoined && (
											<Button
												size="sm"
												variant="outline"
												onClick={(e) => {
													e.stopPropagation();
													joinMutation.mutate(goal.id);
												}}
												disabled={joinMutation.isPending || goal.memberCount >= goal.maxMembers}
												className="h-7 rounded-lg text-[10px] font-bold"
											>
												<HugeiconsIcon icon={UserGroupIcon} className="w-3 h-3 mr-1" />
												Join
											</Button>
										)}
										{goal.hasJoined && (
											<Badge
												variant="secondary"
												className="text-[9px] font-bold bg-primary/10 text-primary"
											>
												Joined
											</Badge>
										)}
									</div>
								</div>

								{isExpanded && (
									<m.div
										initial={{ height: 0, opacity: 0 }}
										animate={{ height: 'auto', opacity: 1 }}
										exit={{ height: 0, opacity: 0 }}
										className="mt-3 pt-3 border-t border-border"
									>
										<p className="text-[10px] font-bold text-muted-foreground  tracking-wider mb-2">
											Leaderboard
										</p>
										<div className="space-y-2">
											{goal.members
												.sort((a, b) => b.contribution - a.contribution)
												.map((member, i) => (
													<div key={member.userId} className="flex items-center gap-2">
														<span className="w-4 text-[10px] font-bold text-muted-foreground">
															{i + 1}
														</span>
														<Avatar className="w-5 h-5">
															<AvatarImage src={member.image || undefined} />
															<AvatarFallback className="text-[8px]">
																{member.name?.[0]}
															</AvatarFallback>
														</Avatar>
														<span className="text-xs font-medium flex-1 truncate">
															{member.name}
														</span>
														<span className="text-[10px] font-bold text-primary">
															{member.contribution}
														</span>
													</div>
												))}
										</div>
									</m.div>
								)}
							</m.div>
						);
					})}
				</AnimatePresence>
			</CardContent>
		</Card>
	);
}
