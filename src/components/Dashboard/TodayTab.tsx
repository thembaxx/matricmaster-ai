import { DailyMission } from '@/components/Dashboard/DailyMission';
import { UniversityGoalCard } from '@/components/Dashboard/UniversityGoalCard';
import { NSCCountdownCard } from '@/components/ExamTimer/NSCCountdownCard';
import { XpHeader } from '@/components/Gamification/XpHeader';
import type { ACHIEVEMENTS } from '@/content';
import type { DashboardInitialStreak } from '@/content/mock/dashboard';
import type { UserAchievement } from '@/lib/db/achievement-actions';

interface TodayTabProps {
	achievements: {
		unlocked: UserAchievement[];
		available: typeof ACHIEVEMENTS;
	};
	streak: DashboardInitialStreak;
}

export function TodayTab(_props: TodayTabProps) {
	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
			<DailyMission />
			<div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
				<UniversityGoalCard />
				<NSCCountdownCard />
			</div>
		</div>
	);
}

export function TodayTabHeader({ achievements, streak }: TodayTabProps) {
	return (
		<XpHeader
			variant="full"
			initialAchievements={achievements}
			initialStreak={{ currentStreak: streak.currentStreak }}
		/>
	);
}
