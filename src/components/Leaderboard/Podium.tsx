import { ChampionIcon, FireIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import { memo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatPoints } from '@/lib/leaderboard-utils';

export interface LeaderboardEntry {
	rank: number;
	userId: string;
	userName: string;
	userImage: string | null;
	totalPoints: number;
	questionsCompleted: number;
	accuracyPercentage: number;
}

export const Podium = memo(function Podium({ data }: { data: LeaderboardEntry[] }) {
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
