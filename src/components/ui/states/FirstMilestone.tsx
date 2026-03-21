'use client';

import { ChampionIcon, LockIcon, Medal01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface LockedAchievement {
	id: string;
	name: string;
	points: number;
}

interface FirstMilestoneProps {
	lockedAchievements?: LockedAchievement[];
}

const DEFAULT_LOCKED_ACHIEVEMENTS: LockedAchievement[] = [];

export function FirstMilestone({
	lockedAchievements = DEFAULT_LOCKED_ACHIEVEMENTS,
}: FirstMilestoneProps) {
	const router = useRouter();

	const defaultLocked = [
		{ id: '1', name: 'Quiz Starter', points: 50 },
		{ id: '2', name: 'Week Warrior', points: 100 },
		{ id: '3', name: 'Subject Master', points: 200 },
	];

	const displayAchievements = lockedAchievements.length > 0 ? lockedAchievements : defaultLocked;

	return (
		<m.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
			<Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200/50">
				<div className="flex items-center justify-between mb-4">
					<h3 className="font-bold text-lg">Unlock Your First Achievement</h3>
					<HugeiconsIcon icon={ChampionIcon} className="w-5 h-5 text-brand-amber" />
				</div>
				<div className="space-y-3 mb-6">
					{displayAchievements.map((achievement) => (
						<div
							key={achievement.id}
							className="flex items-center gap-3 p-3 rounded-xl bg-white/50 dark:bg-black/20"
						>
							<div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center relative">
								<HugeiconsIcon icon={Medal01Icon} className="w-5 h-5 text-muted-foreground/50" />
								<div className="absolute -top-1 -right-1">
									<HugeiconsIcon icon={LockIcon} className="w-3 h-3 text-muted-foreground" />
								</div>
							</div>
							<div className="flex-1">
								<p className="font-medium text-sm">{achievement.name}</p>
								<p className="text-xs text-muted-foreground">{achievement.points} points</p>
							</div>
						</div>
					))}
				</div>
				<Button className="w-full" onClick={() => router.push('/subjects')}>
					Start Earning Badges
				</Button>
			</Card>
		</m.div>
	);
}
