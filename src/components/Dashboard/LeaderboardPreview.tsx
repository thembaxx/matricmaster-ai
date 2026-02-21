'use client';

import { motion } from 'framer-motion';
import { ChevronRight, Medal } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useSession } from '@/lib/auth-client';
import { getLeaderboard, getUserRank } from '@/lib/db/leaderboard-actions';

interface LeaderboardEntry {
	userId: string;
	rank: number;
	name: string;
	image?: string;
	totalPoints: number;
	isCurrentUser?: boolean;
}

export function LeaderboardPreview() {
	const { data: session } = useSession();
	const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
	const [userRank, setUserRank] = useState<number | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		async function fetchLeaderboard() {
			if (!session?.user?.id) return;

			try {
				const [leaderboardData, rankData] = await Promise.all([
					getLeaderboard('weekly', 10),
					getUserRank('weekly'),
				]);

				const topEntries: LeaderboardEntry[] = leaderboardData.slice(0, 3).map((entry) => ({
					userId: entry.userId,
					rank: entry.rank,
					name: entry.userName,
					image: entry.userImage || undefined,
					totalPoints: entry.totalPoints,
					isCurrentUser: entry.userId === session.user.id,
				}));

				if (rankData && rankData.rank > 3) {
					const userEntry = leaderboardData.find((e) => e.userId === session.user.id);
					if (userEntry) {
						topEntries.push({
							userId: userEntry.userId,
							rank: rankData.rank,
							name: 'You',
							image: userEntry.userImage || undefined,
							totalPoints: userEntry.totalPoints,
							isCurrentUser: true,
						});
					}
				}

				setEntries(topEntries);
				setUserRank(rankData?.rank || null);
			} catch (error) {
				console.error('[LeaderboardPreview] Error fetching:', error);
			} finally {
				setIsLoading(false);
			}
		}

		fetchLeaderboard();
	}, [session?.user?.id]);

	if (isLoading) {
		return (
			<Card className="p-6 premium-glass border-none rounded-[2.5rem] h-full">
				<div className="animate-pulse space-y-4">
					<div className="h-5 w-32 bg-muted rounded-lg" />
					{[1, 2, 3].map((i) => (
						<div key={i} className="flex items-center gap-3">
							<div className="w-8 h-8 bg-muted rounded-full" />
							<div className="w-10 h-10 bg-muted rounded-full" />
							<div className="flex-1 space-y-2">
								<div className="h-4 w-24 bg-muted rounded" />
								<div className="h-3 w-12 bg-muted rounded" />
							</div>
						</div>
					))}
				</div>
			</Card>
		);
	}

	return (
		<Card className="p-6 premium-glass border-none rounded-[2.5rem] h-full">
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center gap-2">
					<Medal className="w-5 h-5 text-brand-amber" />
					<h3 className="text-lg font-black text-foreground tracking-tight">Leaderboard</h3>
				</div>
				{userRank && (
					<Badge variant="outline" className="text-[10px] font-black uppercase tracking-wider">
						#{userRank}
					</Badge>
				)}
			</div>

			{entries.length === 0 ? (
				<div className="flex flex-col items-center justify-center py-8 text-center">
					<p className="text-sm text-muted-foreground font-medium">
						Be the first on the leaderboard!
					</p>
				</div>
			) : (
				<div className="space-y-3">
					{entries.map((entry, index) => (
						<motion.div
							key={entry.userId + entry.rank}
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: index * 0.1 }}
							className={`flex items-center gap-3 p-3 rounded-2xl transition-colors ${
								entry.isCurrentUser
									? 'bg-brand-amber/10 border border-brand-amber/20'
									: 'bg-card/50 hover:bg-card/80'
							}`}
						>
							<div
								className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shrink-0 ${
									entry.rank === 1
										? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
										: entry.rank === 2
											? 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
											: entry.rank === 3
												? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
												: 'bg-muted text-muted-foreground'
								}`}
							>
								{entry.rank}
							</div>
							<Avatar className="w-10 h-10">
								<AvatarImage src={entry.image} />
								<AvatarFallback>{entry.name.charAt(0)}</AvatarFallback>
							</Avatar>
							<div className="flex-1 min-w-0">
								<p className="text-sm font-bold text-foreground truncate">{entry.name}</p>
								<p className="text-xs text-muted-foreground font-medium">
									{entry.totalPoints.toLocaleString()} pts
								</p>
							</div>
							{entry.rank <= 3 && (
								<span className="text-lg">
									{entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}
								</span>
							)}
						</motion.div>
					))}
				</div>
			)}

			<motion.button
				whileHover={{ scale: 1.02 }}
				whileTap={{ scale: 0.98 }}
				type="button"
				className="w-full mt-4 py-3 px-4 rounded-2xl bg-muted/50 hover:bg-muted text-sm font-bold text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2"
			>
				View Full Leaderboard
				<ChevronRight className="w-4 h-4" />
			</motion.button>
		</Card>
	);
}
