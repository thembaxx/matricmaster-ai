'use client';

import { ArrowRight01Icon, Medal01Icon, StarIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useQuery } from '@tanstack/react-query';
import { motion as m } from 'motion/react';
import { memo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
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

const RANK_COLORS: Record<number, string> = {
	1: 'bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-lg shadow-amber-500/20',
	2: 'bg-gradient-to-br from-slate-300 to-slate-400 text-slate-800 shadow-lg shadow-slate-400/20',
	3: 'bg-gradient-to-br from-orange-400 to-orange-500 text-white shadow-lg shadow-orange-500/20',
};

export const LeaderboardPreview = memo(function LeaderboardPreview() {
	const { data: session } = useSession();

	const {
		data: leaderboardData,
		isPending,
		error,
		refetch,
	} = useQuery({
		queryKey: ['leaderboard', 'weekly'],
		queryFn: async () => {
			if (!session?.user?.id) return { entries: [], userRank: null };
			const [leaderboard, rankData] = await Promise.all([
				getLeaderboard('weekly', 10),
				getUserRank('weekly'),
			]);

			const topEntries: LeaderboardEntry[] = leaderboard.slice(0, 3).map((entry) => ({
				userId: entry.userId,
				rank: entry.rank,
				name: entry.userName,
				image: entry.userImage || undefined,
				totalPoints: entry.totalPoints,
				isCurrentUser: entry.userId === session.user.id,
			}));

			if (rankData && rankData.rank > 3) {
				const userEntry = leaderboard.find((e) => e.userId === session.user.id);
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

			return { entries: topEntries, userRank: rankData?.rank || null };
		},
		enabled: !!session?.user?.id,
		staleTime: 60 * 1000,
	});

	const entries = leaderboardData?.entries ?? [];
	const userRank = leaderboardData?.userRank ?? null;

	const handleRetry = () => {
		refetch();
	};

	if (isPending) {
		return (
			<Card className="p-6 border border-border/30 rounded-2xl h-full bg-gradient-to-br from-card via-card to-primary/5">
				<div className="space-y-4">
					<Skeleton className="h-5 w-32" />
					{[1, 2, 3].map((item) => (
						<div key={`leaderboard-preview-skeleton-${item}`} className="flex items-center gap-3">
							<Skeleton className="w-8 h-8 rounded-full" />
							<Skeleton className="w-10 h-10 rounded-full" />
							<div className="flex-1 space-y-2">
								<Skeleton className="h-4 w-24" />
								<Skeleton className="h-3 w-12" />
							</div>
						</div>
					))}
				</div>
			</Card>
		);
	}

	if (error) {
		return (
			<Card className="p-6 border border-border/30 rounded-2xl h-full">
				<div className="flex items-center justify-between mb-4">
					<div className="flex items-center gap-2">
						<HugeiconsIcon icon={StarIcon} className="w-5 h-5 text-amber-500" />
						<h3 className="text-lg font-bold text-foreground">Leaderboard</h3>
					</div>
				</div>
				<div className="flex flex-col items-center justify-center py-8 text-center">
					<p className="text-sm text-destructive mb-3">Unable to load leaderboard</p>
					<Button variant="outline" size="sm" onClick={handleRetry}>
						Try Again
					</Button>
				</div>
			</Card>
		);
	}

	return (
		<Card className="relative overflow-hidden p-6 border border-border/30 rounded-2xl h-full bg-gradient-to-br from-card via-card to-primary/5">
			<div className="absolute -top-12 -right-12 w-24 h-24 bg-amber-500/10 rounded-full blur-[40px]" />
			<div className="absolute -bottom-12 -left-12 w-24 h-24 bg-primary/10 rounded-full blur-[40px]" />

			<div className="relative flex items-center justify-between mb-5">
				<div className="flex items-center gap-3">
					<div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
						<HugeiconsIcon icon={StarIcon} className="w-5 h-5 text-amber-500" />
					</div>
					<h3 className="text-lg font-bold text-foreground">Leaderboard</h3>
				</div>
				{userRank && (
					<Badge variant="secondary" className="text-xs font-semibold px-2.5 py-1">
						#{userRank}
					</Badge>
				)}
			</div>

			{entries.length === 0 ? (
				<div className="flex flex-col items-center justify-center py-8 text-center">
					<p className="text-sm text-muted-foreground font-medium">
						be the first on the leaderboard!
					</p>
				</div>
			) : (
				<div className="space-y-2.5">
					{entries.map((entry, index) => (
						<m.div
							key={entry.userId + entry.rank}
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: index * 0.1 }}
							className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
								entry.isCurrentUser
									? 'bg-primary/10 border border-primary/20'
									: 'bg-card/50 hover:bg-card/80'
							}`}
						>
							<div
								className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
									RANK_COLORS[entry.rank] || 'bg-muted text-muted-foreground'
								}`}
							>
								{entry.rank <= 3 ? (
									<HugeiconsIcon icon={Medal01Icon} className="w-4 h-4" />
								) : (
									entry.rank
								)}
							</div>
							<Avatar className="w-9 h-9">
								<AvatarImage src={entry.image} />
								<AvatarFallback className="bg-gradient-to-br from-violet-400 to-purple-600 text-white text-xs font-bold">
									{entry.name.charAt(0)}
								</AvatarFallback>
							</Avatar>
							<div className="flex-1 min-w-0">
								<p className="text-sm font-semibold text-foreground truncate">{entry.name}</p>
								<p className="text-xs text-muted-foreground font-numeric tabular-nums">
									{entry.totalPoints.toLocaleString()} pts
								</p>
							</div>
						</m.div>
					))}
				</div>
			)}

			<m.button
				whileHover={{ scale: 1.02 }}
				whileTap={{ scale: 0.98 }}
				type="button"
				className="relative w-full mt-4 py-3 px-4 rounded-xl bg-secondary/50 hover:bg-secondary text-sm font-semibold text-muted-foreground hover:text-foreground transition-all duration-200 flex items-center justify-center gap-2"
			>
				view full leaderboard
				<HugeiconsIcon icon={ArrowRight01Icon} className="w-4 h-4" />
			</m.button>
		</Card>
	);
});
