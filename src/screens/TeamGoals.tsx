'use client';

import { PlusSignIcon, TargetIcon, UserGroupIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { m } from 'framer-motion';
import { useState } from 'react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
	claimTeamGoalReward,
	createTeamGoal,
	getTeamGoals,
	joinTeamGoal,
} from '@/services/teamGoals';

function getTimeRemaining(endDate: Date): string {
	const diff = endDate.getTime() - Date.now();
	if (diff <= 0) return 'Ended';
	const days = Math.floor(diff / (1000 * 60 * 60 * 24));
	const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
	if (days > 0) return `${days}d ${hours}h`;
	return `${hours}h`;
}

function CreateGoalDialog() {
	const queryClient = useQueryClient();
	const [open, setOpen] = useState(false);
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [goalType, setGoalType] = useState('questions');
	const [target, setTarget] = useState('100');
	const [xpReward, setXpReward] = useState('100');
	const [durationDays, setDurationDays] = useState('7');

	const createMutation = useMutation({
		mutationFn: async () => {
			const endDate = new Date();
			endDate.setDate(endDate.getDate() + Number.parseInt(durationDays, 10));
			return createTeamGoal('', {
				title,
				description,
				goalType,
				target: Number.parseInt(target, 10),
				xpReward: Number.parseInt(xpReward, 10),
				endDate,
			});
		},
		onSuccess: () => {
			toast.success('Team goal created!');
			queryClient.invalidateQueries({ queryKey: ['team-goals'] });
			setOpen(false);
			setTitle('');
			setDescription('');
		},
		onError: () => toast.error('Failed to create goal'),
	});

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button className="rounded-xl font-bold gap-2">
					<HugeiconsIcon icon={PlusSignIcon} className="w-4 h-4" />
					Create Goal
				</Button>
			</DialogTrigger>
			<DialogContent className="rounded-2xl max-w-md">
				<DialogHeader>
					<DialogTitle className="font-black tracking-tight">Create Team Goal</DialogTitle>
				</DialogHeader>
				<div className="space-y-4 pt-2">
					<div className="space-y-2">
						<Label className="text-xs font-bold">Title</Label>
						<Input
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder="e.g., Master Trigonometry"
							className="rounded-xl"
						/>
					</div>
					<div className="space-y-2">
						<Label className="text-xs font-bold">Description</Label>
						<Input
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="What's this goal about?"
							className="rounded-xl"
						/>
					</div>
					<div className="grid grid-cols-2 gap-3">
						<div className="space-y-2">
							<Label className="text-xs font-bold">Type</Label>
							<Select value={goalType} onValueChange={setGoalType}>
								<SelectTrigger className="rounded-xl">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="questions">Questions</SelectItem>
									<SelectItem value="quizzes">Quizzes</SelectItem>
									<SelectItem value="minutes">Study Minutes</SelectItem>
									<SelectItem value="flashcards">Flashcards</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label className="text-xs font-bold">Target</Label>
							<Input
								type="number"
								value={target}
								onChange={(e) => setTarget(e.target.value)}
								className="rounded-xl"
							/>
						</div>
					</div>
					<div className="grid grid-cols-2 gap-3">
						<div className="space-y-2">
							<Label className="text-xs font-bold">XP Reward</Label>
							<Input
								type="number"
								value={xpReward}
								onChange={(e) => setXpReward(e.target.value)}
								className="rounded-xl"
							/>
						</div>
						<div className="space-y-2">
							<Label className="text-xs font-bold">Duration (days)</Label>
							<Input
								type="number"
								value={durationDays}
								onChange={(e) => setDurationDays(e.target.value)}
								className="rounded-xl"
							/>
						</div>
					</div>
					<Button
						onClick={() => createMutation.mutate()}
						disabled={!title || createMutation.isPending}
						className="w-full rounded-xl font-bold h-11"
					>
						Create Team Goal
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}

export default function TeamGoalsScreen() {
	const queryClient = useQueryClient();

	const { data: goals, isLoading } = useQuery({
		queryKey: ['team-goals'],
		queryFn: () => getTeamGoals(),
		staleTime: 30_000,
	});

	const joinMutation = useMutation({
		mutationFn: (goalId: string) => joinTeamGoal(goalId),
		onSuccess: () => {
			toast.success('Joined team goal!');
			queryClient.invalidateQueries({ queryKey: ['team-goals'] });
		},
		onError: (error: Error) => toast.error(error.message),
	});

	const claimMutation = useMutation({
		mutationFn: (goalId: string) => claimTeamGoalReward(goalId),
		onSuccess: (result) => {
			toast.success(`+${result.xp} XP claimed!`);
			queryClient.invalidateQueries({ queryKey: ['team-goals'] });
		},
		onError: (error: Error) => toast.error(error.message),
	});

	const joinedGoals = goals?.filter((g) => g.hasJoined) || [];
	const availableGoals = goals?.filter((g) => !g.hasJoined) || [];

	return (
		<div className="flex flex-col h-full min-w-0 bg-background p-4 sm:pb-32 lg:px-8 overflow-x-hidden">
			<main className="max-w-6xl mx-auto w-full pt-8 sm:pt-12 space-y-8 sm:space-y-12">
				<header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
					<div className="space-y-1">
						<h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tighter">
							Team Goals
						</h1>
						<p className="text-muted-foreground font-bold text-sm">
							Join forces with other students to achieve collective goals
						</p>
					</div>
					<CreateGoalDialog />
				</header>

				{isLoading ? (
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{[1, 2, 3].map((i) => (
							<div key={i} className="h-48 bg-muted animate-pulse rounded-2xl" />
						))}
					</div>
				) : (
					<div className="space-y-8">
						{joinedGoals.length > 0 && (
							<section className="space-y-4">
								<h2 className="text-lg font-black tracking-tight flex items-center gap-2">
									<HugeiconsIcon icon={TargetIcon} className="w-5 h-5 text-primary" />
									Your Goals
								</h2>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									{joinedGoals.map((goal) => {
										const progress = Math.min(100, (goal.current / goal.target) * 100);
										const isCompleted = goal.current >= goal.target;
										const canClaim = isCompleted && !goal.userHasClaimed;

										return (
											<m.div
												key={goal.id}
												initial={{ opacity: 0, y: 10 }}
												animate={{ opacity: 1, y: 0 }}
											>
												<Card
													className={cn(
														'rounded-2xl relative overflow-hidden',
														isCompleted && 'border-success/30'
													)}
												>
													{isCompleted && (
														<div className="absolute top-0 left-0 w-full h-1 bg-success" />
													)}
													<CardHeader className="pb-2">
														<div className="flex items-start justify-between">
															<CardTitle className="text-base font-black tracking-tight">
																{goal.title}
															</CardTitle>
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
																{goal.members.slice(0, 5).map((m) => (
																	<Avatar
																		key={m.userId}
																		className="w-6 h-6 border-2 border-background -ml-1 first:ml-0"
																	>
																		<AvatarImage src={m.image || undefined} />
																		<AvatarFallback className="text-[8px] font-bold">
																			{m.name?.[0]}
																		</AvatarFallback>
																	</Avatar>
																))}
																<span className="text-[10px] font-bold text-muted-foreground ml-1">
																	{goal.memberCount} members
																</span>
															</div>
															<span className="text-[10px] font-bold text-muted-foreground">
																{getTimeRemaining(goal.endDate)}
															</span>
														</div>

														<div className="flex items-center gap-2">
															<div className="flex-1 text-xs">
																<span className="text-muted-foreground">Your contribution: </span>
																<span className="font-bold">{goal.userContribution}</span>
															</div>
															{canClaim && (
																<Button
																	size="sm"
																	onClick={() => claimMutation.mutate(goal.id)}
																	disabled={claimMutation.isPending}
																	className="rounded-lg text-xs font-bold h-8"
																>
																	Claim Reward
																</Button>
															)}
															{goal.userHasClaimed && (
																<Badge
																	variant="secondary"
																	className="text-[9px] font-bold bg-success/10 text-success"
																>
																	Claimed
																</Badge>
															)}
														</div>
													</CardContent>
												</Card>
											</m.div>
										);
									})}
								</div>
							</section>
						)}

						{availableGoals.length > 0 && (
							<section className="space-y-4">
								<h2 className="text-lg font-black tracking-tight flex items-center gap-2">
									<HugeiconsIcon icon={UserGroupIcon} className="w-5 h-5 text-primary" />
									Available Goals
								</h2>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									{availableGoals.map((goal) => {
										const progress = Math.min(100, (goal.current / goal.target) * 100);

										return (
											<m.div
												key={goal.id}
												initial={{ opacity: 0, y: 10 }}
												animate={{ opacity: 1, y: 0 }}
											>
												<Card className="rounded-2xl">
													<CardHeader className="pb-2">
														<div className="flex items-start justify-between">
															<CardTitle className="text-base font-black tracking-tight">
																{goal.title}
															</CardTitle>
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
															<Progress value={progress} className="h-2" />
														</div>

														<div className="flex items-center justify-between">
															<div className="flex items-center gap-1">
																{goal.members.slice(0, 3).map((m) => (
																	<Avatar
																		key={m.userId}
																		className="w-6 h-6 border-2 border-background -ml-1 first:ml-0"
																	>
																		<AvatarImage src={m.image || undefined} />
																		<AvatarFallback className="text-[8px] font-bold">
																			{m.name?.[0]}
																		</AvatarFallback>
																	</Avatar>
																))}
																<span className="text-[10px] font-bold text-muted-foreground ml-1">
																	{goal.memberCount}/{goal.maxMembers}
																</span>
															</div>

															<div className="flex items-center gap-2">
																<span className="text-[10px] font-bold text-muted-foreground">
																	{getTimeRemaining(goal.endDate)}
																</span>
																<Button
																	size="sm"
																	variant="outline"
																	onClick={() => joinMutation.mutate(goal.id)}
																	disabled={
																		joinMutation.isPending || goal.memberCount >= goal.maxMembers
																	}
																	className="rounded-lg text-xs font-bold h-8"
																>
																	Join
																</Button>
															</div>
														</div>
													</CardContent>
												</Card>
											</m.div>
										);
									})}
								</div>
							</section>
						)}

						{goals?.length === 0 && (
							<div className="text-center py-32 space-y-4 opacity-50">
								<HugeiconsIcon
									icon={TargetIcon}
									className="w-16 h-16 mx-auto text-muted-foreground"
								/>
								<p className="text-xl font-bold">No team goals yet</p>
								<p className="text-sm text-muted-foreground">Create one to get started!</p>
							</div>
						)}
					</div>
				)}
			</main>
		</div>
	);
}
