'use client';

import { ChampionIcon, FireIcon, Medal01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import { memo, useEffect, useMemo, useState } from 'react';
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
		<div className="flex items-end justify-center gap-4 md:gap-12 pt-16 pb-12 lg:pt-24 lg:pb-20">
			{/* 2nd Place */}
			<div className="flex flex-col items-center flex-1 sm:flex-none">
				<div className="relative mb-4 group cursor-pointer">
					<div className="absolute inset-0 bg-muted rounded-full blur-2xl opacity-0 group-hover:opacity-40 transition-opacity" />
					<Avatar className="w-16 h-16 sm:w-28 sm:h-28 border-4 border-muted relative z-10 transition-transform group-hover:scale-110 shadow-xl">
						<AvatarImage src={r2?.userImage || undefined} className="object-cover" />
						<AvatarFallback className="font-black text-xl">
							{r2?.userName?.[0] || '?'}
						</AvatarFallback>
					</Avatar>
					<div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-10 h-10 bg-muted-foreground rounded-full flex items-center justify-center text-primary-foreground text-base font-black border-4 border-background z-20 shadow-lg">
						2
					</div>
				</div>
				<div className="text-center space-y-1">
					<p className="text-sm md:text-base font-black text-foreground tracking-tight">
						{r2?.userName || 'TBD'}
					</p>
					<p className="text-[11px] md:text-xs font-black text-muted-foreground uppercase tracking-widest">
						{r2 ? formatPoints(r2.totalPoints) : '0'} KP
					</p>
				</div>
				<div className="w-20 h-24 md:w-28 md:h-32 bg-linear-to-t from-muted to-transparent mt-6 rounded-t-3xl border-x border-t border-muted opacity-50" />
			</div>

			{/* 1st Place */}
			<div className="flex flex-col items-center flex-1 sm:flex-none">
				<div className="relative mb-6 group cursor-pointer">
					<m.div
						animate={{ y: [0, -8, 0] }}
						transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: [0.16, 1, 0.3, 1] }}
						className="absolute -top-8 sm:-top-10 left-1/2 -translate-x-1/2 text-primary-orange"
					>
						<HugeiconsIcon
							icon={ChampionIcon}
							className="w-8 h-8 sm:w-10 sm:h-10 fill-primary-orange/20"
						/>
					</m.div>
					<div className="absolute -inset-4 bg-primary-orange/20 rounded-full opacity-40 blur-3xl group-hover:opacity-60 transition-opacity" />
					<Avatar className="w-24 h-24 sm:w-40 sm:h-40 border-4 border-primary-orange relative z-10 transition-transform group-hover:scale-110 shadow-2xl">
						<AvatarImage src={r1?.userImage || undefined} className="object-cover" />
						<AvatarFallback className="font-black text-3xl">
							{r1?.userName?.[0] || '?'}
						</AvatarFallback>
					</Avatar>
					<div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-14 h-14 bg-primary-orange rounded-full flex items-center justify-center text-white text-2xl font-black border-4 border-background z-20 shadow-2xl">
						1
					</div>
				</div>
				<div className="text-center space-y-1">
					<p className="text-xl md:text-3xl font-black text-foreground tracking-tighter">
						{r1?.userName || 'TBD'}
					</p>
					<p className="text-sm md:text-base font-black text-primary-orange uppercase tracking-widest flex items-center justify-center gap-2">
						<HugeiconsIcon icon={FireIcon} className="w-4 h-4 fill-primary-orange" />
						{r1 ? formatPoints(r1.totalPoints) : '0'} KP
					</p>
				</div>
				<div className="w-32 h-40 md:w-44 md:h-56 bg-linear-to-t from-primary-orange/10 to-transparent mt-8 rounded-t-[3rem] border-x border-t border-primary-orange/20" />
			</div>

			{/* 3rd Place */}
			<div className="flex flex-col items-center flex-1 sm:flex-none">
				<div className="relative mb-4 group cursor-pointer">
					<div className="absolute inset-0 bg-primary-cyan/20 rounded-full blur-2xl opacity-0 group-hover:opacity-40 transition-opacity" />
					<Avatar className="w-16 h-16 sm:w-28 sm:h-28 border-4 border-primary-cyan/30 relative z-10 transition-transform group-hover:scale-110 shadow-xl">
						<AvatarImage src={r3?.userImage || undefined} className="object-cover" />
						<AvatarFallback className="font-black text-xl">
							{r3?.userName?.[0] || '?'}
						</AvatarFallback>
					</Avatar>
					<div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-10 h-10 bg-primary-cyan rounded-full flex items-center justify-center text-white text-base font-black border-4 border-background z-20 shadow-lg">
						3
					</div>
				</div>
				<div className="text-center space-y-1">
					<p className="text-sm md:text-base font-black text-foreground tracking-tight">
						{r3?.userName || 'TBD'}
					</p>
					<p className="text-[11px] md:text-xs font-black text-primary-cyan uppercase tracking-widest">
						{r3 ? formatPoints(r3.totalPoints) : '0'} KP
					</p>
				</div>
				<div className="w-20 h-16 md:w-28 md:h-24 bg-linear-to-t from-primary-cyan/10 to-transparent mt-6 rounded-t-3xl border-x border-t border-primary-cyan/20 opacity-50" />
			</div>
		</div>
	);
});

const RankingList = memo(function RankingList({ data }: { data: LeaderboardEntry[] }) {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-1">
			{data.map((student) => (
				<div
					key={student.userId}
					className="flex items-center gap-4 sm:gap-6 px-4 sm:px-8 py-4 sm:py-5 hover:bg-muted/50 transition-all group cursor-pointer rounded-3xl"
				>
					<span className="w-6 sm:w-8 text-muted-foreground font-black text-sm sm:text-base text-center group-hover:text-primary transition-colors">
						{student.rank}
					</span>
					<Avatar className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border-2 border-border shadow-sm group-hover:scale-105 transition-transform">
						<AvatarImage src={student.userImage || undefined} className="object-cover" />
						<AvatarFallback className="font-black">{student.userName?.[0]}</AvatarFallback>
					</Avatar>
					<div className="flex-1 min-w-0">
						<h4 className="font-black text-sm sm:text-base text-foreground truncate tracking-tight">
							{student.userName}
						</h4>
						<p className="text-[10px] sm:text-[11px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1 sm:gap-2">
							<HugeiconsIcon icon={Medal01Icon} className="w-3 h-3.5 sm:w-3.5 sm:h-3.5" />
							{student.questionsCompleted} questions
						</p>
					</div>
					<div className="text-right">
						<p className="text-base sm:text-lg font-black text-primary-orange tracking-tighter">
							{formatPoints(student.totalPoints)} <span className="text-[10px]">KP</span>
						</p>
						<div className="flex items-center justify-end gap-1 mt-0.5">
							<div className="w-1 h-1 rounded-full bg-accent-lime" />
							<p className="text-[8px] sm:text-[9px] font-black text-accent-lime uppercase tracking-widest">
								{student.accuracyPercentage}% accuracy
							</p>
						</div>
					</div>
				</div>
			))}
		</div>
	);
});

import { LeaderboardSkeleton } from '@/components/LeaderboardSkeleton';

export default function Leaderboard() {
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
		return <LeaderboardSkeleton />;
	}

	return (
		<div className="flex flex-col h-full min-w-0 bg-background pb-24 overflow-x-hidden lg:px-8">
			<header className="pt-8 sm:pt-12 pb-6 sm:pb-8 flex flex-col items-center gap-8 sm:gap-12 shrink-0">
				<div className="text-center space-y-2 px-4">
					<h1 className="text-3xl sm:text-4xl lg:text-7xl font-black text-foreground tracking-tighter uppercase">
						Global Rankings
					</h1>
					<p className="text-muted-foreground font-bold text-sm sm:text-lg lg:text-lg">
						See how you compare with students nationwide
					</p>
				</div>

				<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-4xl px-4">
					<TabsList className="w-full h-12 sm:h-16 p-1.5 sm:p-2 bg-muted/30 backdrop-blur-md rounded-xl sm:rounded-2xl border-2 border-border/50 shadow-inner">
						<TabsTrigger
							value="weekly"
							className="flex-1 rounded-lg sm:rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xl transition-all"
						>
							Weekly
						</TabsTrigger>
						<TabsTrigger
							value="monthly"
							className="flex-1 rounded-lg sm:rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xl transition-all"
						>
							Monthly
						</TabsTrigger>
						<TabsTrigger
							value="all_time"
							className="flex-1 rounded-lg sm:rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xl transition-all"
						>
							All Time
						</TabsTrigger>
					</TabsList>
				</Tabs>
			</header>

			<ScrollArea className="flex-1 no-scrollbar">
				<div className="max-w-6xl mx-auto w-full pb-32">
					{leaderboardData.length === 0 ? (
						<div className="text-center py-32 space-y-4 opacity-50">
							<HugeiconsIcon
								icon={Medal01Icon}
								className="w-16 h-16 mx-auto text-muted-foreground"
							/>
							<p className="text-xl font-bold">The arena is empty... for now.</p>
						</div>
					) : (
						<div className="space-y-12">
							<Podium data={topThree} />

							<div className="grid grid-cols-1 gap-8">
								<div className="bg-card/20 backdrop-blur-sm rounded-[2.5rem] border-2 border-border/50 shadow-sm p-2 overflow-hidden mx-4 lg:mx-0">
									<RankingList data={others} />
								</div>
							</div>
						</div>
					)}
				</div>
			</ScrollArea>

			{userRank && (
				<div className="fixed bottom-32 left-1/2 -translate-x-1/2 w-[92%] max-w-4xl z-50 lg:bottom-12">
					<Card className="p-4 sm:p-6 premium-glass text-foreground border-none shadow-2xl rounded-2xl sm:rounded-[2.5rem] relative overflow-hidden group">
						<div className="absolute top-0 left-0 w-2 h-full bg-primary-orange animate-pulse" />
						<div className="flex items-center gap-3 sm:gap-6 relative z-10">
							<span className="text-2xl sm:text-3xl font-black text-primary-orange w-8 sm:w-12 text-center tracking-tighter">
								{userRank.rank}
							</span>
							<div className="relative">
								<Avatar className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-primary-orange/30 p-1 rounded-xl sm:rounded-2xl bg-muted/20">
									<AvatarImage src="" className="object-cover" />
									<AvatarFallback className="font-black text-sm sm:text-base text-foreground">
										ME
									</AvatarFallback>
								</Avatar>
								<div className="absolute -bottom-1.5 sm:-bottom-2 -right-1.5 sm:-right-2 bg-primary-orange text-white text-[8px] sm:text-[9px] font-black px-2 sm:px-3 py-0.5 sm:py-1 rounded-full border-2 sm:border-4 border-background uppercase tracking-tighter shadow-lg">
									You
								</div>
							</div>
							<div className="flex-1 min-w-0">
								<h3 className="font-black text-sm sm:text-lg text-white truncate tracking-tight">
									Your Global Rank
								</h3>
								<p className="text-[10px] sm:text-[11px] font-black text-white/60 uppercase tracking-widest flex items-center gap-1 sm:gap-2">
									<HugeiconsIcon
										icon={FireIcon}
										className="w-3 h-3 sm:w-4 sm:h-4 text-primary-orange fill-primary-orange"
									/>
									{userStreak?.currentStreak || 0} Day Streak
								</p>
							</div>
							<div className="text-right">
								<p className="text-xl sm:text-2xl font-black text-primary-orange tracking-tighter flex items-center justify-end gap-1">
									{formatPoints(userRank.totalPoints)} <span className="text-xs uppercase">KP</span>
								</p>
								<p className="text-[9px] sm:text-[10px] font-black text-white/60 uppercase tracking-widest">
									Top {100 - userRank.percentile}% of Students
								</p>
							</div>
						</div>
					</Card>
				</div>
			)}
		</div>
	);
}
