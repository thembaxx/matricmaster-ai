'use client';

import { FireIcon, ShieldIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { m } from 'framer-motion';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getStreakInfo, useStreakFreeze as streakFreezeAction } from '@/lib/db/streak-actions';
import { cn } from '@/lib/utils';

export function StreakShield({ className }: { className?: string }) {
	const queryClient = useQueryClient();

	const { data: streakInfo, isLoading } = useQuery({
		queryKey: ['streak-info'],
		queryFn: () => getStreakInfo(),
		staleTime: 30_000,
	});

	const useFreezeMutation = useMutation({
		mutationFn: () => streakFreezeAction(),
		onSuccess: (result) => {
			if (result.success) {
				toast.success('Streak shield activated!', {
					description: 'Your streak is protected for today.',
					icon: <HugeiconsIcon icon={ShieldIcon} className="w-4 h-4 text-blue-500" />,
				});
				queryClient.invalidateQueries({ queryKey: ['streak-info'] });
			} else {
				toast.error(result.message);
			}
		},
	});

	if (isLoading) {
		return (
			<Card className={cn('rounded-2xl', className)}>
				<CardContent className="p-6">
					<Skeleton className="h-20 rounded-xl" />
				</CardContent>
			</Card>
		);
	}

	if (!streakInfo) return null;

	const { currentStreak, bestStreak, streakFreezes, canUseFreeze } = streakInfo;

	const shieldCount = Math.min(streakFreezes, 2);

	return (
		<Card className={cn('rounded-2xl relative overflow-hidden', className)}>
			<div
				className={cn(
					'absolute top-0 left-0 w-full h-1',
					currentStreak > 0
						? 'bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500'
						: 'bg-muted'
				)}
			/>
			<CardHeader className="pb-2">
				<CardTitle className="text-lg font-black tracking-tight flex items-center gap-2">
					<div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center">
						<HugeiconsIcon icon={FireIcon} className="w-4 h-4 text-orange-500" />
					</div>
					Streak Shield
				</CardTitle>
			</CardHeader>

			<CardContent className="space-y-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<div className="relative">
							<m.div
								animate={currentStreak > 0 ? { scale: [1, 1.1, 1] } : {}}
								transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
								className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20"
							>
								<HugeiconsIcon icon={FireIcon} className="w-8 h-8 text-white" />
							</m.div>
							{shieldCount > 0 && (
								<m.div
									initial={{ scale: 0.95, opacity: 0 }}
									animate={{ scale: 1 }}
									className="absolute -top-2 -right-2"
								>
									<div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center shadow-lg border-2 border-background">
										<HugeiconsIcon icon={ShieldIcon} className="w-3.5 h-3.5 text-white" />
									</div>
								</m.div>
							)}
						</div>

						<div>
							<div className="flex items-baseline gap-1">
								<span className="text-3xl font-black text-orange-500 tabular-nums">
									{currentStreak}
								</span>
								<span className="text-sm font-bold text-muted-foreground">day streak</span>
							</div>
							<p className="text-xs text-muted-foreground">
								Best: <span className="font-bold tabular-nums">{bestStreak}</span> days
							</p>
						</div>
					</div>

					<div className="flex flex-col items-end gap-1">
						<Badge
							variant="secondary"
							className="text-[10px] font-bold bg-blue-500/10 text-blue-500 border-blue-500/20"
						>
							<HugeiconsIcon icon={ShieldIcon} className="w-3 h-3 mr-1" />
							{streakFreezes} shield{streakFreezes !== 1 ? 's' : ''}
						</Badge>
						{streakFreezes > 0 && streakFreezes < 3 && (
							<p className="text-[9px] text-muted-foreground">Earn 1 every 7-day streak</p>
						)}
					</div>
				</div>

				{shieldCount > 0 && (
					<div className="flex items-center gap-2">
						{Array.from({ length: 2 }).map((_, i) => (
							<div
								key={`shield-${i}`}
								className={cn(
									'flex-1 h-10 rounded-xl flex items-center justify-center gap-2 border-2 transition-all',
									i < shieldCount
										? 'bg-blue-500/10 border-blue-500/30 text-blue-500'
										: 'bg-muted/50 border-dashed border-muted-foreground/20 text-muted-foreground/30'
								)}
							>
								<HugeiconsIcon
									icon={ShieldIcon}
									className={cn('w-4 h-4', i < shieldCount ? '' : 'opacity-30')}
								/>
								<span className="text-xs font-bold">{i < shieldCount ? 'Ready' : 'Locked'}</span>
							</div>
						))}
					</div>
				)}

				{canUseFreeze && (
					<Button
						variant="outline"
						size="sm"
						onClick={() => useFreezeMutation.mutate()}
						disabled={useFreezeMutation.isPending}
						className="w-full rounded-xl font-bold text-xs border-blue-500/30 text-blue-500 hover:bg-blue-500/10 hover:text-blue-600"
					>
						<HugeiconsIcon icon={ShieldIcon} className="w-4 h-4 mr-2" />
						Use Shield to Protect Streak
					</Button>
				)}

				{currentStreak === 0 && (
					<p className="text-xs text-center text-muted-foreground py-2">
						Start studying today to build your streak!
					</p>
				)}
			</CardContent>
		</Card>
	);
}
