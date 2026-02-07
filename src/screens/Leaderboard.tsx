'use client';

import { Flame, Award } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

// Mock data for different categories
const leaderboardData = {
	school: {
		topThree: [
			{
				rank: 2,
				name: 'Sipho N.',
				points: 2350,
				avatar:
					'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=200',
			},
			{
				rank: 1,
				name: 'Thabo M.',
				points: 2840,
				avatar:
					'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
				isUser: true,
			},
			{
				rank: 3,
				name: 'Lerato K.',
				points: 2100,
				avatar:
					'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200',
			},
		],
		others: [
			{
				rank: 4,
				name: 'Jessica V.',
				school: 'Parktown Girls',
				points: 1950,
				avatar:
					'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200',
			},
			{
				rank: 5,
				name: 'Michael B.',
				school: "St John's College",
				points: 1820,
				avatar:
					'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
			},
			{
				rank: 6,
				name: 'Nandi Z.',
				school: 'Roedean School',
				points: 1780,
				avatar:
					'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=200',
			},
			{
				rank: 7,
				name: 'Kevin P.',
				school: 'Hilton College',
				points: 1650,
				avatar:
					'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
			},
		],
	},
	provincial: {
		topThree: [
			{
				rank: 2,
				name: 'Ayanda M.',
				points: 4200,
				avatar:
					'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
			},
			{
				rank: 1,
				name: 'Pieter S.',
				points: 4850,
				avatar:
					'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200',
			},
			{
				rank: 3,
				name: 'Zanele T.',
				points: 4100,
				avatar:
					'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
			},
		],
		others: [
			{
				rank: 4,
				name: 'Daniel R.',
				school: 'Grey College',
				points: 3950,
				avatar:
					'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200',
			},
			{
				rank: 5,
				name: 'Sarah W.',
				school: 'Herschel Girls',
				points: 3820,
				avatar:
					'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
			},
		],
	},
	national: {
		topThree: [
			{
				rank: 2,
				name: 'Lunga D.',
				points: 8350,
				avatar:
					'https://images.unsplash.com/photo-1504257404792-c2196bc5794e?auto=format&fit=crop&q=80&w=200',
			},
			{
				rank: 1,
				name: 'Grace A.',
				points: 9200,
				avatar:
					'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=200',
			},
			{
				rank: 3,
				name: 'Johan B.',
				points: 8100,
				avatar:
					'https://images.unsplash.com/photo-1492562080023-ab3dbdf9bbbd?auto=format&fit=crop&q=80&w=200',
			},
		],
		others: [
			{
				rank: 4,
				name: 'Amara O.',
				school: 'Crawford College',
				points: 7950,
				avatar:
					'https://images.unsplash.com/photo-1523824921871-d6f1a3215111?auto=format&fit=crop&q=80&w=200',
			},
			{
				rank: 42,
				name: 'Thabo M. (You)',
				school: "St John's College",
				points: 1250,
				avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Thabo',
				isUser: true,
			},
		],
	},
};

export default function Leaderboard() {
	const Podium = ({ data }: { data: typeof leaderboardData.school.topThree }) => {
		const r2 = data.find((p) => p.rank === 2);
		const r1 = data.find((p) => p.rank === 1);
		const r3 = data.find((p) => p.rank === 3);

		return (
			<div className="flex items-end justify-center gap-2 sm:gap-6 pt-12 pb-8">
				{/* Rank 2 */}
				<div className="flex flex-col items-center">
					<div className="relative mb-3 group cursor-pointer">
						<div className="absolute inset-0 bg-zinc-200 dark:bg-zinc-800 rounded-full blur-md opacity-0 group-hover:opacity-40 transition-opacity" />
						<Avatar className="w-20 h-20 border-2 border-zinc-200 dark:border-zinc-800 relative z-10 transition-transform group-hover:scale-105">
							<AvatarImage src={r2?.avatar} className="object-cover" />
							<AvatarFallback>{r2?.name[0]}</AvatarFallback>
						</Avatar>
						<div className="absolute -bottom-2 translate-x-[24px] right-1/2 w-7 h-7 bg-zinc-400 rounded-full flex items-center justify-center text-white text-[10px] font-black border-2 border-white dark:border-zinc-950 z-20">
							2
						</div>
					</div>
					<div className="text-center space-y-0.5">
						<p className="text-sm font-black text-zinc-900 dark:text-white">{r2?.name}</p>
						<p className="text-[10px] font-black text-[#efb036] uppercase">
							{r2?.points.toLocaleString()} KP
						</p>
					</div>
					<div className="w-20 h-24 bg-gradient-to-t from-zinc-100/80 to-transparent dark:from-zinc-900/40 mt-4 rounded-t-3xl border-x border-t border-zinc-100/50 dark:border-zinc-800/50" />
				</div>

				{/* Rank 1 */}
				<div className="flex flex-col items-center">
					<div className="relative mb-4 group cursor-pointer">
						<div className="absolute -top-6 left-1/2 -translate-x-1/2 text-orange-500 animate-bounce">
							<Award className="w-8 h-8 fill-orange-500" />
						</div>
						<div className="absolute inset-[-4px] bg-gradient-to-b from-orange-400 to-yellow-300 rounded-full opacity-30 blur-sm" />
						<Avatar className="w-28 h-28 border-[4px] border-[#efb036] relative z-10 transition-transform group-hover:scale-105">
							<AvatarImage src={r1?.avatar} className="object-cover" />
							<AvatarFallback>{r1?.name[0]}</AvatarFallback>
						</Avatar>
						<div className="absolute -bottom-3 translate-x-[32px] right-1/2 w-10 h-10 bg-[#efb036] rounded-full flex items-center justify-center text-zinc-950 text-base font-black border-[3px] border-white dark:border-zinc-950 z-20 shadow-xl">
							1
						</div>
					</div>
					<div className="text-center space-y-1">
						<p className="text-lg font-black text-zinc-900 dark:text-white tracking-tight">
							{r1?.name}
						</p>
						<p className="text-xs font-black text-[#efb036] uppercase flex items-center justify-center gap-1">
							<Flame className="w-3 h-3 fill-current" />
							{r1?.points.toLocaleString()} KP
						</p>
					</div>
					<div className="w-24 h-32 bg-gradient-to-t from-orange-50/50 to-transparent dark:from-[#efb036]/5 mt-4 rounded-t-[2.5rem] border-x border-t border-orange-100/50 dark:border-orange-900/20" />
				</div>

				{/* Rank 3 */}
				<div className="flex flex-col items-center">
					<div className="relative mb-3 group cursor-pointer">
						<div className="absolute inset-0 bg-orange-100 dark:bg-orange-900/20 rounded-full blur-md opacity-0 group-hover:opacity-40 transition-opacity" />
						<Avatar className="w-20 h-20 border-2 border-orange-200 dark:border-orange-800 relative z-10 transition-transform group-hover:scale-105">
							<AvatarImage src={r3?.avatar} className="object-cover" />
							<AvatarFallback>{r3?.name[0]}</AvatarFallback>
						</Avatar>
						<div className="absolute -bottom-2 translate-x-[24px] right-1/2 w-7 h-7 bg-orange-400 rounded-full flex items-center justify-center text-white text-[10px] font-black border-2 border-white dark:border-zinc-950 z-20">
							3
						</div>
					</div>
					<div className="text-center space-y-0.5">
						<p className="text-sm font-black text-zinc-900 dark:text-white">{r3?.name}</p>
						<p className="text-[10px] font-black text-[#efb036] uppercase">
							{r3?.points.toLocaleString()} KP
						</p>
					</div>
					<div className="w-20 h-20 bg-gradient-to-t from-orange-50/50 to-transparent dark:from-orange-900/10 mt-4 rounded-t-3xl border-x border-t border-orange-100/50 dark:border-zinc-800/50" />
				</div>
			</div>
		);
	};

	const RankingList = ({ data }: { data: typeof leaderboardData.school.others }) => (
		<div className="space-y-1">
			{data.map((student) => (
				<div
					key={student.name}
					className="flex items-center gap-4 px-6 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors group cursor-pointer"
				>
					<span className="w-6 text-zinc-400 font-bold text-sm text-center">{student.rank}</span>
					<Avatar className="w-12 h-12 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
						<AvatarImage src={student.avatar} className="object-cover" />
					</Avatar>
					<div className="flex-1 min-w-0">
						<h4 className="font-extrabold text-sm text-zinc-900 dark:text-white truncate">
							{student.name}
						</h4>
						<p className="text-[11px] font-bold text-zinc-400 uppercase tracking-tight flex items-center gap-1">
							<Award className="w-3 h-3" />
							{student.school}
						</p>
					</div>
					<div className="text-right">
						<p className="text-sm font-black text-[#efb036]">
							{student.points.toLocaleString()} KP
						</p>
					</div>
				</div>
			))}
		</div>
	);

	return (
		<div className="flex flex-col h-full bg-[#fcfdfd] dark:bg-[#0a0f18] font-inter pb-28">
			{/* Header */}
			<header className="px-6 pt-12 pb-6 shrink-0 bg-white dark:bg-[#0a0f18]">
				<Tabs defaultValue="school" className="w-full">
					<TabsList className="w-full h-14 p-1.5 bg-zinc-100/50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
						<TabsTrigger
							value="school"
							className="flex-1 rounded-xl font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-950 data-[state=active]:shadow-sm text-zinc-500 data-[state=active]:text-zinc-900 dark:data-[state=active]:text-white"
						>
							School
						</TabsTrigger>
						<TabsTrigger
							value="provincial"
							className="flex-1 rounded-xl font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-950 data-[state=active]:shadow-sm text-zinc-500 data-[state=active]:text-zinc-900 dark:data-[state=active]:text-white"
						>
							Provincial
						</TabsTrigger>
						<TabsTrigger
							value="national"
							className="flex-1 rounded-xl font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-950 data-[state=active]:shadow-sm text-zinc-500 data-[state=active]:text-zinc-900 dark:data-[state=active]:text-white"
						>
							National
						</TabsTrigger>
					</TabsList>

					<ScrollArea className="mt-8 no-scrollbar">
						<TabsContent value="school" className="mt-0">
							<Podium data={leaderboardData.school.topThree} />
							<div className="bg-white dark:bg-zinc-950/50 rounded-t-[3rem] border-t border-zinc-50 dark:border-zinc-800 shadow-2xl shadow-zinc-200/50 pt-2">
								<RankingList data={leaderboardData.school.others} />
							</div>
						</TabsContent>
						<TabsContent value="provincial" className="mt-0">
							<Podium data={leaderboardData.provincial.topThree} />
							<div className="bg-white dark:bg-zinc-950/50 rounded-t-[3rem] border-t border-zinc-50 dark:border-zinc-800 shadow-2xl shadow-zinc-200/50 pt-2">
								<RankingList data={leaderboardData.provincial.others} />
							</div>
						</TabsContent>
						<TabsContent value="national" className="mt-0">
							<Podium data={leaderboardData.national.topThree} />
							<div className="bg-white dark:bg-zinc-950/50 rounded-t-[3rem] border-t border-zinc-50 dark:border-zinc-800 shadow-2xl shadow-zinc-200/50 pt-2">
								<RankingList data={leaderboardData.national.others} />
							</div>
						</TabsContent>
					</ScrollArea>
				</Tabs>
			</header>

			{/* Your Rank Footer */}
			<div className="p-6 z-40 bg-gradient-to-t from-white via-white dark:from-[#0a0f18] dark:via-[#0a0f18] to-transparent shrink-0">
				<div className="max-w-2xl mx-auto">
					<Card className="p-4 bg-zinc-900 dark:bg-zinc-950 border-zinc-800 dark:border-zinc-800 shadow-2xl rounded-3xl relative overflow-hidden group">
						<div className="absolute top-0 left-0 w-1 h-full bg-[#efb036]" />
						<div className="flex items-center gap-4 relative z-10">
							<span className="text-xl font-black text-[#efb036] w-8">42</span>
							<div className="relative">
								<Avatar className="w-12 h-12 border-2 border-[#efb036] p-0.5 rounded-xl">
									<AvatarImage
										src="https://api.dicebear.com/7.x/avataaars/svg?seed=Thabo"
										className="object-cover"
									/>
									<AvatarFallback>TM</AvatarFallback>
								</Avatar>
								<div className="absolute -bottom-1.5 -right-1.5 bg-[#efb036] text-zinc-950 text-[8px] font-black px-1.5 py-0.5 rounded-full border border-zinc-900 border-white dark:border-zinc-950">
									YOU
								</div>
							</div>
							<div className="flex-1 min-w-0">
								<h4 className="font-extrabold text-sm text-white truncate">Your Rank</h4>
								<p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
									<Flame className="w-3 h-3 text-orange-500 fill-orange-500" />
									Streak: 5
								</p>
							</div>
							<div className="text-right">
								<p className="text-lg font-black text-[#efb036] flex items-center justify-end gap-1">
									1,250 <span className="text-[10px]">KP</span>
								</p>
								<p className="text-[9px] font-bold text-zinc-500 uppercase">Top 15%</p>
							</div>
						</div>
					</Card>
				</div>
			</div>
		</div>
	);
}
