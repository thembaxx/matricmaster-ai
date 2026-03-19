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

export function StatsOverview({ stats }: { stats: StudyStats }) {
	return (
		<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
			<Card>
				<CardContent className="p-4">
					<div className="flex items-center gap-3">
						<div className="p-2 rounded-lg bg-primary/10">
							<HugeiconsIcon icon={Clock01Icon} className="w-5 h-5 text-primary" />
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Study Time</p>
							<p className="text-xl font-bold">{formatTime(stats.totalStudyTime)}</p>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardContent className="p-4">
					<div className="flex items-center gap-3">
						<div className="p-2 rounded-lg bg-green-500/10">
							<HugeiconsIcon icon={Target01Icon} className="w-5 h-5 text-green-500" />
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Accuracy</p>
							<p className="text-xl font-bold">
								{Math.round((stats.correctAnswers / (stats.quizzesCompleted * 5)) * 100)}%
							</p>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardContent className="p-4">
					<div className="flex items-center gap-3">
						<div className="p-2 rounded-lg bg-orange-500/10">
							<HugeiconsIcon icon={FireIcon} className="w-5 h-5 text-orange-500" />
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Streak</p>
							<p className="text-xl font-bold">{stats.streakDays} days</p>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardContent className="p-4">
					<div className="flex items-center gap-3">
						<div className="p-2 rounded-lg bg-purple-500/10">
							<HugeiconsIcon icon={Medal01Icon} className="w-5 h-5 text-purple-500" />
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Level</p>
							<p className="text-xl font-bold">{stats.level}</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
