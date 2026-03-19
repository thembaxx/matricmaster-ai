import { Medal01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { BuddyLeaderboard } from './constants';

export function FocusLeaderboard({ leaderboard }: { leaderboard: BuddyLeaderboard[] }) {
	return (
		<Card className="rounded-[2.5rem] overflow-hidden bg-card border-border/50 shadow-tiimo">
			<CardHeader className="pb-3">
				<CardTitle className="flex items-center gap-2 text-sm">
					<HugeiconsIcon icon={Medal01Icon} className="w-4 h-4 text-yellow-500" />
					Weekly Leaderboard
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{leaderboard.map((buddy, index) => (
					<div
						key={buddy.userId}
						className={cn(
							'flex items-center gap-3 p-2 rounded-xl',
							index === 0 && 'bg-yellow-500/10'
						)}
					>
						<div
							className={cn(
								'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black',
								index === 0
									? 'bg-yellow-500 text-white'
									: index === 1
										? 'bg-gray-400 text-white'
										: index === 2
											? 'bg-amber-600 text-white'
											: 'bg-muted text-muted-foreground'
							)}
						>
							{index + 1}
						</div>
						<div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-black text-primary text-sm">
							{buddy.avatar}
						</div>
						<div className="flex-1 min-w-0">
							<p className="font-bold text-sm truncate">{buddy.name}</p>
							<Progress
								value={(buddy.focusMinutes / leaderboard[0].focusMinutes) * 100}
								className="h-1.5"
							/>
						</div>
						<p className="text-sm font-black text-primary">{buddy.focusMinutes}m</p>
					</div>
				))}
			</CardContent>
		</Card>
	);
}
