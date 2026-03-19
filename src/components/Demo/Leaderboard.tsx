'use client';

import { SafeImage } from '@/components/SafeImage';
import { Card, CardContent } from '@/components/ui/card';
import { DataSection } from '@/components/ui/data-loader';
import { cn } from '@/lib/utils';

interface LeaderboardUser {
	id: string;
	name: string;
	avatar: string;
	points: number;
	rank: number;
}

interface LeaderboardProps {
	leaderboard: LeaderboardUser[];
}

export function Leaderboard({ leaderboard }: LeaderboardProps) {
	return (
		<DataSection title="Weekly Leaderboard" description="Top learners this week">
			<div className="space-y-3">
				{leaderboard.map((user, index) => (
					<Card
						key={user.id}
						className={cn(
							'transition-all',
							index < 3 && 'bg-gradient-to-r from-yellow-500/5 to-transparent border-yellow-500/20'
						)}
					>
						<CardContent className="pt-4">
							<div className="flex items-center gap-4">
								<div
									className={cn(
										'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm',
										user.rank === 1 && 'bg-yellow-500 text-white',
										user.rank === 2 && 'bg-gray-400 text-white',
										user.rank === 3 && 'bg-orange-400 text-white',
										user.rank > 3 && 'bg-muted text-muted-foreground'
									)}
								>
									{user.rank}
								</div>
								<div className="w-10 h-10 rounded-full bg-primary/20 overflow-hidden">
									<SafeImage
										src={user.avatar}
										alt={user.name}
										className="w-full h-full object-cover"
									/>
								</div>
								<div className="flex-1">
									<p className="font-medium">{user.name}</p>
								</div>
								<div className="text-right">
									<p className="font-bold text-primary">{user.points}</p>
									<p className="text-xs text-muted-foreground">points</p>
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</DataSection>
	);
}
