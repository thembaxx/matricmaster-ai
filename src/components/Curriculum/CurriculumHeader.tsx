'use client';

import {
	Analytics01Icon as BarChartSquare01Icon,
	FireIcon,
	FlashIcon,
	GridIcon,
	Tick01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import type { CurriculumSubject as Subject } from '@/content';
import { calculateSubjectProgress } from '@/hooks/use-curriculum-progress';
import { cn } from '@/lib/utils';

interface CurriculumHeaderProps {
	subjects: Subject[];
	userXP: number;
	userStreak: number;
	userLevel: number;
}

export function CurriculumHeader({
	subjects,
	userXP,
	userStreak,
	userLevel,
}: CurriculumHeaderProps) {
	const stats = calculateSubjectProgress(subjects);

	return (
		<>
			<div className="flex items-center gap-3 bg-gradient-to-r from-primary/10 to-warning/10 rounded-2xl p-3 mb-3">
				<StatBadge
					icon={FireIcon}
					value={userStreak}
					label="day streak"
					colorClass="text-orange-500"
				/>
				<StatBadge
					icon={FlashIcon}
					value={userXP.toLocaleString()}
					label="XP"
					colorClass="text-warning"
				/>
				<StatBadge
					icon={BarChartSquare01Icon}
					value={`Level ${userLevel}`}
					label=""
					colorClass="text-primary"
				/>
			</div>

			<ProgressStats stats={stats} />
		</>
	);
}

function StatBadge({
	icon: Icon,
	value,
	label,
	colorClass,
}: {
	icon: typeof FireIcon;
	value: string | number;
	label: string;
	colorClass: string;
}) {
	return (
		<div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-zinc-900 rounded-xl shadow-sm">
			<HugeiconsIcon icon={Icon} className={cn('w-4 h-4', colorClass)} />
			<span className="text-sm font-black">{value}</span>
			{label && <span className="text-[10px] text-muted-foreground">{label}</span>}
		</div>
	);
}

interface ProgressStatsProps {
	stats: {
		overallProgress: number;
		masteredTopics: number;
		inProgressTopics: number;
		totalQuestions: number;
	};
}

export function ProgressStats({ stats }: ProgressStatsProps) {
	const { overallProgress, masteredTopics, inProgressTopics, totalQuestions } = stats;

	return (
		<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
			{[
				{
					label: 'Overall',
					value: `${overallProgress}%`,
					icon: BarChartSquare01Icon,
					color: 'text-primary',
				},
				{
					label: 'Mastered',
					value: masteredTopics.toString(),
					icon: Tick01Icon,
					color: 'text-success',
				},
				{
					label: 'In Progress',
					value: inProgressTopics.toString(),
					icon: FireIcon,
					color: 'text-warning',
				},
				{
					label: 'Questions',
					value: totalQuestions.toString(),
					icon: GridIcon,
					color: 'text-info',
				},
			].map((stat, idx) => (
				<m.div
					key={stat.label}
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: idx * 0.1 }}
					className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm rounded-2xl p-4 border border-border/30 shadow-tiimo"
				>
					<div className="flex items-center gap-2 mb-1">
						<HugeiconsIcon icon={stat.icon} className={cn('w-4 h-4', stat.color)} />
						<span className="text-[10px] font-bold text-muted-foreground  tracking-wider">
							{stat.label}
						</span>
					</div>
					<div className="text-2xl font-black text-foreground">{stat.value}</div>
				</m.div>
			))}
		</div>
	);
}
