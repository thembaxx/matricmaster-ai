'use client';

import { FireIcon as Fire, Medal02Icon as Medal, ChampionIcon as TrophyIcon, Time02Icon as Clock } from 'hugeicons-react';
import { m } from 'framer-motion';
import { memo, useEffect, useMemo, useState } from 'react';
import { useSession } from '@/lib/auth-client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getLeaderboard, getUserRank } from '@/lib/db/leaderboard-actions';
import { getUserStreak } from '@/lib/db/progress-actions';
import { formatPoints } from '@/lib/leaderboard-utils';

interface LeaderboardEntry {
	rank: number;
	userId: string;
	userName: string;
	userImage: string | null;
	totalPoints: number;
	questionsCompleted: number;
	accuracyPercentage: number;
}

interface UserRankData {
	rank: number;
	totalPoints: number;
	questionsCompleted: number;
	accuracyPercentage: number;
	percentile: number;
}

const Podium = memo(function Podium({ data }: { data: LeaderboardEntry[] }) {
	const r2 = data.find((p) => p.rank === 2);
	const r1 = data.find((p) => p.rank === 1);
	const r3 = data.find((p) => p.rank === 3);

	return (
		<div className="flex items-end justify-center gap-6 md:gap-16 pt-24 pb-16 lg:pt-32 lg:pb-24">
			{/* 2nd Place */}
			<div className="flex flex-col items-center flex-1 sm:flex-none">
				<div className="relative mb-6 group cursor-pointer">
					<Avatar className="w-20 h-20 sm:w-32 sm:h-32 border-4 border-tiimo-blue/20 relative z-10 transition-transform group-hover:scale-110 shadow-xl rounded-[2.5rem]">
						<AvatarImage src={r2?.userImage || undefined} className="object-cover" />
						<AvatarFallback className="bg-tiimo-blue/10 text-tiimo-blue font-black text-2xl">
							{r2?.userName?.[0] || '?'}
						</AvatarFallback>
					</Avatar>
					<div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-12 h-12 bg-tiimo-blue rounded-2xl flex items-center justify-center text-white text-lg font-black border-4 border-white dark:border-zinc-950 z-20 shadow-lg">
						2
					</div>
				</div>
				<div className="text-center space-y-1">
					<p className="text-md md:text-lg font-black text-foreground tracking-tight">
						{r2?.userName || 'TBD'}
					</p>
					<p className="text-xs font-black text-tiimo-blue uppercase tracking-widest">
						{r2 ? formatPoints(r2.totalPoints) : '0'} KP
					</p>
				</div>
				<div className="w-24 h-28 md:w-32 md:h-36 bg-tiimo-blue/5 mt-8 rounded-t-[2.5rem] border-x-4 border-t-4 border-tiimo-blue/10" />
			</div>

			{/* 1st Place */}
			<div className="flex flex-col items-center flex-1 sm:flex-none">
				<div className="relative mb-8 group cursor-pointer">
					<m.div
						animate={{ y: [0, -12, 0], rotate: [0, 10, -10, 0] }}
						transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
						className="absolute -top-12 sm:-top-16 left-1/2 -translate-x-1/2"
					>
						<TrophyIcon size={48} className="text-tiimo-orange fill-tiimo-orange/20 stroke-[3px]" />
					</m.div>
					<Avatar className="w-28 h-28 sm:w-44 sm:h-44 border-8 border-tiimo-orange relative z-10 transition-transform group-hover:scale-110 shadow-[0_30px_70px_rgba(249,115,22,0.3)] rounded-[3rem]">
						<AvatarImage src={r1?.userImage || undefined} className="object-cover" />
						<AvatarFallback className="bg-tiimo-orange/10 text-tiimo-orange font-black text-4xl">
							{r1?.userName?.[0] || '?'}
						</AvatarFallback>
					</Avatar>
					<div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-16 h-16 bg-tiimo-orange rounded-[1.25rem] flex items-center justify-center text-white text-3xl font-black border-4 border-white dark:border-zinc-950 z-20 shadow-2xl">
						1
					</div>
				</div>
				<div className="text-center space-y-1">
					<p className="text-2xl md:text-4xl font-black text-foreground tracking-tighter">
						{r1?.userName || 'TBD'}
					</p>
					<div className="flex items-center justify-center gap-3">
						<Fire size={24} className="text-tiimo-orange fill-tiimo-orange/20 stroke-[3px]" />
						<p className="text-lg md:text-xl font-black text-tiimo-orange uppercase tracking-widest">
							{r1 ? formatPoints(r1.totalPoints) : '0'} KP
						</p>
					</div>
				</div>
				<div className="w-36 h-48 md:w-48 md:h-64 bg-tiimo-orange/10 mt-10 rounded-t-[3.5rem] border-x-4 border-t-4 border-tiimo-orange/20 shadow-inner" />
			</div>

			{/* 3rd Place */}
			<div className="flex flex-col items-center flex-1 sm:flex-none">
				<div className="relative mb-6 group cursor-pointer">
					<Avatar className="w-20 h-20 sm:w-32 sm:h-32 border-4 border-tiimo-pink/20 relative z-10 transition-transform group-hover:scale-110 shadow-xl rounded-[2.5rem]">
						<AvatarImage src={r3?.userImage || undefined} className="object-cover" />
						<AvatarFallback className="bg-tiimo-pink/10 text-tiimo-pink font-black text-2xl">
							{r3?.userName?.[0] || '?'}
						</AvatarFallback>
					</Avatar>
					<div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-12 h-12 bg-tiimo-pink rounded-2xl flex items-center justify-center text-white text-lg font-black border-4 border-white dark:border-zinc-950 z-20 shadow-lg">
						3
					</div>
				</div>
				<div className="text-center space-y-1">
					<p className="text-md md:text-lg font-black text-foreground tracking-tight">
						{r3?.userName || 'TBD'}
					</p>
					<p className="text-xs font-black text-tiimo-pink uppercase tracking-widest">
						{r3 ? formatPoints(r3.totalPoints) : '0'} KP
					</p>
				</div>
				<div className="w-24 h-20 md:w-32 md:h-28 bg-tiimo-pink/5 mt-8 rounded-t-[2.5rem] border-x-4 border-t-4 border-tiimo-pink/10" />
			</div>
		</div>
	);
});

const RankingList = memo(function RankingList({ data }: { data: LeaderboardEntry[] }) {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
			{data.map((student) => (
				<div
					key={student.userId}
					className="flex items-center gap-6 px-8 py-6 hover:bg-muted/10 transition-all group cursor-pointer rounded-[2rem]"
				>
					<div className="w-12 h-12 rounded-2xl bg-muted/10 flex items-center justify-center font-black text-muted-foreground/40 group-hover:bg-primary group-hover:text-white transition-all duration-500">
						{student.rank}
					</div>
					<Avatar className="w-16 h-16 rounded-[1.25rem] border-4 border-white dark:border-zinc-900 shadow-lg group-hover:rotate-6 transition-transform">
						<AvatarImage src={student.userImage || undefined} className="object-cover" />
						<AvatarFallback className="font-black bg-muted/20">{student.userName?.[0]}</AvatarFallback>
					</Avatar>
					<div className="flex-1 min-w-0">
						<h4 className="font-black text-xl text-foreground truncate tracking-tight leading-none mb-2">
							{student.userName}
						</h4>
						<div className="flex items-center gap-4">
							<div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">
								<Medal size={14} className="stroke-[3px]" />
								{student.questionsCompleted} solved
							</div>
							<div className="flex items-center gap-2 text-[10px] font-black text-tiimo-green uppercase tracking-widest">
								<div className="w-1.5 h-1.5 rounded-full bg-tiimo-green" />
								{student.accuracyPercentage}%
							</div>
						</div>
					</div>
					<div className="text-right">
						<p className="text-2xl font-black text-tiimo-orange tracking-tighter leading-none">
							{formatPoints(student.totalPoints)}
						</p>
						<span className="text-[10px] font-black text-tiimo-orange/40 uppercase tracking-[0.2em]">Kudos</span>
					</div>
				</div>
			))}
		</div>
	);
});

export default function Leaderboard() {
	const { data: session } = useSession();
	const [activeTab, setActiveTab] = useState('weekly');
	const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
	const [userRank, setUserRank] = useState<UserRankData | null>(null);
	const [userStreak, setUserStreak] = useState<{ currentStreak: number } | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	// Bolt: Separate streak fetching into its own effect to avoid redundant database calls on every tab switch
	useEffect(() => {
		async function fetchStreak() {
			try {
				const streak = await getUserStreak();
				setUserStreak(streak);
			} catch (error) {
				console.error('Error fetching user streak:', error);
			}
		}
		fetchStreak();
	}, []);

	useEffect(() => {
		async function fetchData() {
			try {
				setIsLoading(true);
				const [data, rank] = await Promise.all([
					getLeaderboard(activeTab as 'weekly' | 'monthly' | 'all_time', 50),
					getUserRank(activeTab as 'weekly' | 'monthly' | 'all_time'),
				]);
				setLeaderboardData(data);
				setUserRank(rank);
			} catch (error) {
				console.error('Error fetching leaderboard:', error);
			} finally {
				setIsLoading(false);
			}
		}
		fetchData();
	}, [activeTab]);

	// Bolt: Memoize filtered results to avoid O(N) recalculation on every render
	const topThree = useMemo(() => leaderboardData.filter((e) => e.rank <= 3), [leaderboardData]);
	const others = useMemo(() => leaderboardData.filter((e) => e.rank > 3), [leaderboardData]);

	if (isLoading) {
		return (
			<div className="flex flex-col h-full bg-background items-center justify-center py-40">
				<div className="animate-spin rounded-full h-14 w-14 border-4 border-primary border-t-transparent shadow-2xl" />
			</div>
		);
	}

	return (
		<div className="flex flex-col h-full min-w-0 bg-white dark:bg-zinc-950 pb-40 overflow-x-hidden lg:px-12">
			<header className="pt-20 sm:pt-32 pb-12 sm:pb-16 flex flex-col items-center gap-12 sm:gap-16 shrink-0">
				<div className="text-center space-y-4 px-6">
					<h1 className="text-5xl sm:text-7xl lg:text-9xl font-black text-foreground tracking-tighter leading-none">
						Global
					</h1>
					<p className="text-muted-foreground/40 font-black text-lg sm:text-2xl uppercase tracking-[0.3em] leading-none">
						Elite students board
					</p>
				</div>

				<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-4xl px-6">
					<TabsList className="w-full h-20 p-2 bg-muted/10 rounded-[2.5rem] border-none shadow-inner">
						<TabsTrigger
							value="weekly"
							className="flex-1 h-full rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-2xl transition-all duration-500"
						>
							Weekly
						</TabsTrigger>
						<TabsTrigger
							value="monthly"
							className="flex-1 h-full rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-2xl transition-all duration-500"
						>
							Monthly
						</TabsTrigger>
						<TabsTrigger
							value="all_time"
							className="flex-1 h-full rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-2xl transition-all duration-500"
						>
							All Time
						</TabsTrigger>
					</TabsList>
				</Tabs>
			</header>

			<ScrollArea className="flex-1 no-scrollbar px-6">
				<div className="max-w-6xl mx-auto w-full pb-64">
					{leaderboardData.length === 0 ? (
						<div className="text-center py-40 space-y-8">
							<div className="w-32 h-32 bg-muted/10 rounded-[3rem] flex items-center justify-center mx-auto">
								<Medal size={48} className="text-muted-foreground/20 stroke-[3px]" />
							</div>
							<p className="text-2xl font-black text-muted-foreground/30 uppercase tracking-widest">Board is empty</p>
						</div>
					) : (
						<div className="space-y-24">
							<Podium data={topThree} />

							<div className="space-y-12">
								<div className="flex items-center gap-4 px-2">
									<h2 className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.4em]">Ranking results</h2>
									<div className="h-px flex-1 bg-muted/10" />
								</div>
								<div className="bg-card rounded-[3.5rem] border-none shadow-[0_20px_60px_rgba(0,0,0,0.06)] p-6 overflow-hidden">
									<RankingList data={others} />
								</div>
							</div>
						</div>
					)}
				</div>
			</ScrollArea>

			{userRank && (
				<div className="fixed bottom-32 left-1/2 -translate-x-1/2 w-[92%] max-w-4xl z-50 lg:bottom-12">
					<m.div
						initial={{ y: 100, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ type: 'spring', damping: 25, delay: 0.5 }}
					>
						<Card className="p-8 bg-zinc-950 text-white border-none shadow-[0_40px_100px_rgba(0,0,0,0.4)] rounded-[3rem] relative overflow-hidden group">
							<div className="absolute top-0 left-0 w-3 h-full bg-tiimo-orange animate-pulse" />
							<div className="flex items-center gap-8 relative z-10">
								<span className="text-5xl font-black text-tiimo-orange w-16 text-center tracking-tighter">
									{userRank.rank}
								</span>
								<div className="relative">
									<Avatar className="w-20 h-20 border-4 border-tiimo-orange/30 p-1 rounded-[1.5rem] bg-white/5">
										<AvatarImage
											src={session?.user?.image || "https://api.dicebear.com/7.x/avataaars/svg?seed=user"}
											className="object-cover rounded-[1.25rem]"
										/>
										<AvatarFallback className="font-black bg-zinc-900">ME</AvatarFallback>
									</Avatar>
									<div className="absolute -bottom-2 -right-2 bg-tiimo-orange text-white text-[10px] font-black px-4 py-1 rounded-full border-4 border-zinc-950 uppercase tracking-tighter shadow-xl">
										YOU
									</div>
								</div>
								<div className="flex-1 min-w-0 space-y-1">
									<h3 className="font-black text-2xl text-white truncate tracking-tight">
										Your standing
									</h3>
									<div className="flex items-center gap-4">
										<div className="flex items-center gap-2 text-[10px] font-black text-white/40 uppercase tracking-widest">
											<Fire size={14} className="text-tiimo-orange fill-tiimo-orange/20 stroke-[3px]" />
											{userStreak?.currentStreak || 0} Day Streak
										</div>
										<div className="h-1 w-1 rounded-full bg-white/20" />
										<p className="text-[10px] font-black text-tiimo-green uppercase tracking-widest">
											Top {100 - userRank.percentile}%
										</p>
									</div>
								</div>
								<div className="text-right">
									<p className="text-4xl font-black text-tiimo-orange tracking-tighter leading-none mb-1">
										{formatPoints(userRank.totalPoints)}
									</p>
									<span className="text-[10px] font-black text-tiimo-orange/40 uppercase tracking-[0.2em]">Kudos</span>
								</div>
							</div>
						</Card>
					</m.div>
				</div>
			)}
		</div>
	);
}
