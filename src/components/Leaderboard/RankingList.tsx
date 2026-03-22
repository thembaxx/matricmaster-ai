import { Medal01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { memo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatPoints } from '@/lib/leaderboard-utils';
import type { LeaderboardEntry } from './Podium';

export const RankingList = memo(function RankingList({ data }: { data: LeaderboardEntry[] }) {
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
