'use client';

import { Award, Flame } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

function Podium({ data }: { data: LeaderboardEntry[] }) {
	const r2 = data.find((p) => p.rank === 2);
	const r1 = data.find((p) => p.rank === 1);
	const r3 = data.find((p) => p.rank === 3);

	return (
		<div className="flex items-end justify-center gap-2 sm:gap-6 pt-12 pb-8">
			<div className="flex flex-col items-center">
				<div className="relative mb-3 group cursor-pointer">
					<div className="absolute inset-0 bg-muted rounded-full blur-md opacity-0 group-hover:opacity-40 transition-opacity" />
					<Avatar className="w-20 h-20 border-2 border-border relative z-10 transition-transform group-hover:scale-105">
						<AvatarImage src={r2?.userImage || undefined} className="object-cover" />
						<AvatarFallback>{r2?.userName?.[0] || '?'}</AvatarFallback>
					</Avatar>
					<div className="absolute -bottom-2 translate-x-6 right-1/2 w-7 h-7 bg-muted-foreground rounded-full flex items-center justify-center text-background text-[10px] font-black border-2 border-background z-20">
						2
					</div>
				</div>
				<div className="text-center space-y-0.5">
					<p className="text-sm font-black text-foreground">{r2?.userName || 'TBD'}</p>
					<p className="text-[10px] font-black text-[#efb036] uppercase">
						{r2 ? formatPoints(r2.totalPoints) : '0'} KP
					</p>
				</div>
				<div className="w-16 h-20 bg-linear-to-t from-muted to-muted/30 mt-2 rounded-t-lg" />
			</div>

			<div className="flex flex-col items-center">
				<div className="relative mb-4 group cursor-pointer">
					<div className="absolute -top-6 left-1/2 -translate-x-1/2 text-orange-500 animate-bounce">
						<Award className="w-8 h-8 fill-orange-500" />
					</div>
					<div className="absolute -inset-1 bg-linear-to-b from-orange-400 to-yellow-300 rounded-full opacity-30 blur-sm" />
					<Avatar className="w-20 h-28 bg-linear-to-t from-yellow-200/20 to-yellow-50/10 mt-2 rounded-t-xl relative z-10 transition-transform group-hover:scale-105">
						<AvatarImage src={r1?.userImage || undefined} className="object-cover" />
						<AvatarFallback>{r1?.userName?.[0] || '?'}</AvatarFallback>
					</Avatar>
					<div className="absolute -bottom-3 translate-x-8 right-1/2 w-10 h-10 bg-[#efb036] rounded-full flex items-center justify-center text-zinc-950 text-base font-black border-[3px] border-background z-20 shadow-xl">
						1
					</div>
				</div>
				<div className="text-center space-y-1">
					<p className="text-lg font-black text-foreground tracking-tight">
						{r1?.userName || 'TBD'}
					</p>
					<p className="text-xs font-black text-[#efb036] uppercase flex items-center justify-center gap-1">
						<Flame className="w-3 h-3 fill-current" />
						{r1 ? formatPoints(r1.totalPoints) : '0'} KP
					</p>
				</div>
				<div className="w-24 h-32 bg-linear-to-t from-orange-50/10 to-transparent mt-4 rounded-t-[2.5rem] border-x border-t border-orange-100/20" />
			</div>

			<div className="flex flex-col items-center">
				<div className="relative mb-3 group cursor-pointer">
					<div className="absolute inset-0 bg-orange-100/20 rounded-full blur-md opacity-0 group-hover:opacity-40 transition-opacity" />
					<Avatar className="w-20 h-20 border-2 border-orange-200/30 relative z-10 transition-transform group-hover:scale-105">
						<AvatarImage src={r3?.userImage || undefined} className="object-cover" />
						<AvatarFallback>{r3?.userName?.[0] || '?'}</AvatarFallback>
					</Avatar>
					<div className="absolute -bottom-2 translate-x-6 right-1/2 w-7 h-7 bg-orange-400 rounded-full flex items-center justify-center text-white text-[10px] font-black border-2 border-background z-20">
						3
					</div>
				</div>
				<div className="text-center space-y-0.5">
					<p className="text-sm font-black text-foreground">{r3?.userName || 'TBD'}</p>
					<p className="text-[10px] font-black text-[#efb036] uppercase">
						{r3 ? formatPoints(r3.totalPoints) : '0'} KP
					</p>
				</div>
				<div className="w-16 h-16 bg-linear-to-t from-orange-200/20 to-orange-100/10 mt-2 rounded-t-lg" />
			</div>
		</div>
	);
}

function RankingList({ data }: { data: LeaderboardEntry[] }) {
	return (
		<div className="space-y-1">
			{data.map((student) => (
				<div
					key={student.userId}
					className="flex items-center gap-4 px-6 py-4 hover:bg-muted/50 transition-colors group cursor-pointer"
				>
					<span className="w-6 text-muted-foreground font-bold text-sm text-center">
						{student.rank}
					</span>
					<Avatar className="w-12 h-12 rounded-2xl border border-border shadow-sm">
						<AvatarImage src={student.userImage || undefined} className="object-cover" />
					</Avatar>
					<div className="flex-1 min-w-0">
						<h4 className="font-extrabold text-sm text-foreground truncate">{student.userName}</h4>
						<p className="text-[11px] font-bold text-muted-foreground uppercase tracking-tight flex items-center gap-1">
							<Award className="w-3 h-3" />
							{student.questionsCompleted} questions
						</p>
					</div>
					<div className="text-right">
						<p className="text-sm font-black text-[#efb036]">
							{formatPoints(student.totalPoints)} KP
						</p>
					</div>
				</div>
			))}
		</div>
	);
}

export default function Leaderboard() {
	const [activeTab, setActiveTab] = useState('weekly');
	const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
	const [userRank, setUserRank] = useState<UserRankData | null>(null);
	const [userStreak, setUserStreak] = useState<{ currentStreak: number } | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		async function fetchData() {
			try {
				const [data, rank, streak] = await Promise.all([
					getLeaderboard(activeTab as 'weekly' | 'monthly' | 'all_time', 50),
					getUserRank(activeTab as 'weekly' | 'monthly' | 'all_time'),
					getUserStreak(),
				]);
				setLeaderboardData(data);
				setUserRank(rank);
				setUserStreak(streak);
			} catch (error) {
				console.error('Error fetching leaderboard:', error);
			} finally {
				setIsLoading(false);
			}
		}
		fetchData();
	}, [activeTab]);

	const topThree = leaderboardData.filter((e) => e.rank <= 3);
	const others = leaderboardData.filter((e) => e.rank > 3);

	if (isLoading) {
		return (
			<div className="flex flex-col h-full bg-background font-inter pb-28">
				<div className="flex-1 flex items-center justify-center">
					<div className="animate-pulse flex flex-col items-center gap-4">
						<div className="w-20 h-20 bg-muted rounded-full" />
						<div className="h-4 w-32 bg-muted rounded" />
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-full bg-background font-inter pb-28">
			<header className="px-6 pt-12 pb-6 shrink-0 bg-background">
				<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
					<TabsList className="w-full h-14 p-1.5 bg-muted/50 rounded-2xl border border-border">
						<TabsTrigger
							value="weekly"
							className="flex-1 rounded-xl font-bold data-[state=active]:bg-card data-[state=active]:shadow-sm text-muted-foreground data-[state=active]:text-foreground"
						>
							Weekly
						</TabsTrigger>
						<TabsTrigger
							value="monthly"
							className="flex-1 rounded-xl font-bold data-[state=active]:bg-card data-[state=active]:shadow-sm text-muted-foreground data-[state=active]:text-foreground"
						>
							Monthly
						</TabsTrigger>
						<TabsTrigger
							value="all_time"
							className="flex-1 rounded-xl font-bold data-[state=active]:bg-card data-[state=active]:shadow-sm text-muted-foreground data-[state=active]:text-foreground"
						>
							All Time
						</TabsTrigger>
					</TabsList>
					<ScrollArea className="mt-8 no-scrollbar">
						<TabsContent value={activeTab} className="mt-0">
							{leaderboardData.length === 0 ? (
								<div className="text-center py-12">
									<p className="text-muted-foreground">
										No rankings yet. Complete quizzes to get on the leaderboard!
									</p>
								</div>
							) : (
								<>
									<Podium data={topThree} />
									<div className="bg-card/50 rounded-t-[3rem] border-t border-border shadow-2xl shadow-black/5 pt-2">
										<RankingList data={others} />
									</div>
								</>
							)}
						</TabsContent>
					</ScrollArea>
				</Tabs>
			</header>
			<div className="p-6 z-40 bg-linear-to-t from-background via-background to-transparent shrink-0">
				<div className="max-w-2xl mx-auto">
					<Card className="p-4 bg-foreground text-background border-none shadow-2xl rounded-3xl relative overflow-hidden group">
						<div className="absolute top-0 left-0 w-1 h-full bg-[#efb036]" />
						<div className="flex items-center gap-4 relative z-10">
							<span className="text-xl font-black text-[#efb036] w-8">{userRank?.rank || '-'}</span>
							<div className="relative">
								<Avatar className="w-12 h-12 border-2 border-[#efb036] p-0.5 rounded-xl">
									<AvatarImage
										src="https://api.dicebear.com/7.x/avataaars/svg?seed=user"
										className="object-cover"
									/>
									<AvatarFallback>ME</AvatarFallback>
								</Avatar>
								<div className="absolute -bottom-1.5 -right-1.5 bg-[#efb036] text-zinc-950 text-[8px] font-black px-1.5 py-0.5 rounded-full border border-background">
									YOU
								</div>
							</div>
							<div className="flex-1 min-w-0">
								<h4 className="font-extrabold text-sm text-background truncate">Your Rank</h4>
								<p className="text-[10px] font-bold text-background/60 uppercase tracking-wider flex items-center gap-1.5">
									<Flame className="w-3 h-3 text-orange-500 fill-orange-500" />
									Streak: {userStreak?.currentStreak || 0} days
								</p>
							</div>
							<div className="text-right">
								<p className="text-lg font-black text-[#efb036] flex items-center justify-end gap-1">
									{formatPoints(userRank?.totalPoints || 0)} <span className="text-[10px]">KP</span>
								</p>
								<p className="text-[9px] font-bold text-background/60 uppercase">
									{userRank?.percentile ? `Top ${100 - userRank.percentile}%` : 'No rank yet'}
								</p>
							</div>
						</div>
					</Card>
				</div>
			</div>
		</div>
	);
}
