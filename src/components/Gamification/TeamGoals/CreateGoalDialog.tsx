'use client';

import { PlusSignIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { createTeamGoal } from '@/services/teamGoals';

export function CreateGoalDialog() {
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
							placeholder="Optional description"
							className="rounded-xl"
						/>
					</div>
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label className="text-xs font-bold">Goal Type</Label>
							<Select value={goalType} onValueChange={setGoalType}>
								<SelectTrigger className="rounded-xl">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="questions">Questions</SelectItem>
									<SelectItem value="hours">Hours</SelectItem>
									<SelectItem value="streak">Streak Days</SelectItem>
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
					<div className="grid grid-cols-2 gap-4">
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
						className="w-full rounded-xl font-bold"
					>
						{createMutation.isPending ? 'Creating...' : 'Create Goal'}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
