import { Clock01Icon, FireIcon, Medal01Icon, Target01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Card, CardContent } from '@/components/ui/card';
import type { StudyStats } from './constants';

function formatTime(minutes: number) {
	const hours = Math.floor(minutes / 60);
	const mins = minutes % 60;
	if (hours > 0) return `${hours}h ${mins}m`;
	return `${mins}m`;
}

function getAccuracyColor(accuracy: number): string {
	if (accuracy >= 80) return 'text-green-500';
	if (accuracy >= 60) return 'text-orange-500';
	return 'text-red-500';
}

function getAccuracyBg(accuracy: number): string {
	if (accuracy >= 80) return 'bg-green-500/10';
	if (accuracy >= 60) return 'bg-orange-500/10';
	return 'bg-red-500/10';
}

function getStreakColor(streak: number): string {
	if (streak >= 7) return 'text-orange-500';
	if (streak >= 3) return 'text-amber-500';
	return 'text-muted-foreground';
}

function getStreakBg(streak: number): string {
	if (streak >= 7) return 'bg-orange-500/10';
	if (streak >= 3) return 'bg-amber-500/10';
	return 'bg-muted';
}

export function StatsOverview({ stats }: { stats: StudyStats }) {
	const accuracy =
		stats.quizzesCompleted > 0
			? Math.round((stats.correctAnswers / (stats.quizzesCompleted * 5)) * 100)
			: 0;

	return (
		<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
			<Card className="bg-gradient-to-br from-primary/5 to-primary/0 border-primary/10">
				<CardContent className="p-3 sm:p-4">
					<div className="flex items-start justify-between">
						<div className="p-2 rounded-lg bg-primary/10 shrink-0">
							<HugeiconsIcon icon={Clock01Icon} className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
						</div>
						<div className="flex-1 min-w-0 text-right">
							<p className="label-xs text-muted-foreground tracking-tight">study time</p>
							<p className="text-lg sm:text-xl font-bold font-numeric tabular-nums">
								{formatTime(stats.totalStudyTime).toLowerCase()}
							</p>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card className={`bg-gradient-to-br ${getAccuracyBg(accuracy)} border-0`}>
				<CardContent className="p-3 sm:p-4">
					<div className="flex items-start justify-between">
						<div className={`p-2 rounded-lg ${getAccuracyBg(accuracy)} shrink-0`}>
							<HugeiconsIcon
								icon={Target01Icon}
								className={`w-4 h-4 sm:w-5 sm:h-5 ${getAccuracyColor(accuracy)}`}
							/>
						</div>
						<div className="flex-1 min-w-0 text-right">
							<p className="label-xs text-muted-foreground tracking-tight">accuracy</p>
							<p
								className={`text-lg sm:text-xl font-bold font-numeric tabular-nums ${getAccuracyColor(accuracy)}`}
							>
								{accuracy}%
							</p>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card className={`bg-gradient-to-br ${getStreakBg(stats.streakDays)} border-0`}>
				<CardContent className="p-3 sm:p-4">
					<div className="flex items-start justify-between">
						<div className={`p-2 rounded-lg ${getStreakBg(stats.streakDays)} shrink-0`}>
							<HugeiconsIcon
								icon={FireIcon}
								className={`w-4 h-4 sm:w-5 sm:h-5 ${getStreakColor(stats.streakDays)}`}
							/>
						</div>
						<div className="flex-1 min-w-0 text-right">
							<p className="label-xs text-muted-foreground tracking-tight">streak</p>
							<p
								className={`text-lg sm:text-xl font-bold font-numeric tabular-nums ${getStreakColor(stats.streakDays)}`}
							>
								{stats.streakDays}d
							</p>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card className="bg-gradient-to-br from-purple-500/5 to-purple-500/0 border-purple-500/10">
				<CardContent className="p-3 sm:p-4">
					<div className="flex items-start justify-between">
						<div className="p-2 rounded-lg bg-purple-500/10 shrink-0">
							<HugeiconsIcon icon={Medal01Icon} className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
						</div>
						<div className="flex-1 min-w-0 text-right">
							<p className="label-xs text-muted-foreground tracking-tight">level</p>
							<p className="text-lg sm:text-xl font-bold font-numeric tabular-nums">
								{stats.level}
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
