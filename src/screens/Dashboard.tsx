'use client';

import { m } from 'framer-motion';
import { useCallback, useEffect, useState, useTransition } from 'react';
import { ChallengesList } from '@/components/Dashboard/ChallengesList';
import { DailyGoals } from '@/components/Dashboard/DailyGoals';
import { DailyQuestCard } from '@/components/Dashboard/DailyQuestCard';
import { DashboardHeader } from '@/components/Dashboard/DashboardHeader';
import { LeaderboardPreview } from '@/components/Dashboard/LeaderboardPreview';
import { RecentAchievements } from '@/components/Dashboard/RecentAchievements';
import { StatsCards } from '@/components/Dashboard/StatsCards';
import { TopicMasteryCard } from '@/components/Dashboard/TopicMasteryCard';
import { WeeklyChallenge } from '@/components/Dashboard/WeeklyChallenge';
import { WeeklyChartCard } from '@/components/Dashboard/WeeklyChartCard';
import { DashboardSkeleton } from '@/components/DashboardSkeleton';
import { XpHeader } from '@/components/Gamification/XpHeader';
import { BackgroundMesh } from '@/components/ui/background-mesh';
import { ScrollArea } from '@/components/ui/scroll-area';
import { STAGGER_CONTAINER, STAGGER_ITEM } from '@/lib/animation-presets';
import type { AuthSession } from '@/lib/auth';
import type { ACHIEVEMENTS } from '@/constants/achievements';
import type { UserAchievement } from '@/lib/db/achievement-actions';
import type { UserProgressSummary } from '@/lib/db/progress-actions';
import { useNotificationStore } from '@/stores/useNotificationStore';

interface DayProgress {
	day: string;
	date: number;
	status: 'complete' | 'active' | 'idle';
}

export interface DashboardInitialStreak {
	currentStreak: number;
	bestStreak: number;
	lastActivityDate: string | null;
}

interface DashboardProps {
	initialProgress?: UserProgressSummary | null;
	initialStreak?: DashboardInitialStreak | null;
	initialAchievements?: {
		unlocked: UserAchievement[];
		available: typeof ACHIEVEMENTS;
	} | null;
	session?: AuthSession | null;
}

export default function Dashboard({
	initialProgress,
	initialStreak,
	initialAchievements,
	session,
}: DashboardProps = {}) {
	const { unreadCount } = useNotificationStore();
	const [isPending, startTransition] = useTransition();
	const [streak] = useState(initialStreak?.currentStreak ?? 0);
	const [dailyProgress, setDailyProgress] = useState(0);
	const [weekProgress, setWeekProgress] = useState<DayProgress[]>([]);
	const [progressData] = useState<{
		totalQuestions: number;
		accuracy: number;
		totalPoints: number;
	} | null>(() =>
		initialProgress
			? {
					totalQuestions: initialProgress.totalQuestionsAttempted,
					accuracy: initialProgress.accuracy,
					totalPoints: initialProgress.totalMarksEarned * 10,
				}
			: null
	);

	useEffect(() => {
		const now = new Date();
		const today = now.getDay();
		const dayOfWeek = today === 0 ? 6 : today - 1;

		const days: DayProgress[] = [];
		for (let i = 0; i < 7; i++) {
			const date = new Date(now);
			date.setDate(now.getDate() - dayOfWeek + i);

			const dayNames = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
			days.push({
				day: dayNames[i],
				date: date.getDate(),
				status: i < dayOfWeek ? 'complete' : i === dayOfWeek ? 'active' : 'idle',
			});
		}
		setWeekProgress(days);
		setDailyProgress(66);
	}, []);

	const handleNavigateToQuiz = useCallback(() => {
		startTransition(() => {
			window.location.href = '/quiz';
		});
	}, []);

	const isLoading = isPending;

	if (!progressData) {
		return <DashboardSkeleton />;
	}

	return (
		<div className="flex flex-col h-full min-w-0 bg-background pb-24 lg:pb-12 relative overflow-x-hidden">
			<BackgroundMesh variant="subtle" />

			<DashboardHeader
				userName={session?.user?.name ?? undefined}
				userImage={session?.user?.image ?? undefined}
				unreadCount={unreadCount}
			/>

			<div className="px-4 sm:px-6 pb-4 lg:px-0">
				<XpHeader
					variant="full"
					initialAchievements={initialAchievements ?? undefined}
					initialStreak={initialStreak ?? undefined}
				/>
			</div>

			<ScrollArea className="flex-1 relative z-10 no-scrollbar">
				<m.main
					variants={STAGGER_CONTAINER}
					initial="hidden"
					animate="visible"
					className="px-4 sm:px-6 py-6 space-y-6 sm:space-y-8 lg:px-0"
				>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
						<m.div variants={STAGGER_ITEM} className="md:col-span-1">
							<WeeklyChallenge initialProgress={initialProgress ?? undefined} />
						</m.div>
						<m.div variants={STAGGER_ITEM} className="md:col-span-1">
							<DailyGoals
								initialProgress={initialProgress ?? undefined}
								initialStreak={initialStreak ?? undefined}
							/>
						</m.div>

						<div className="md:col-span-2">
							<DailyQuestCard
								totalQuestions={progressData.totalQuestions}
								dailyProgress={dailyProgress}
								isLoading={isLoading}
								onNavigateToQuiz={handleNavigateToQuiz}
							/>
						</div>

						<div className="md:col-span-2 lg:col-span-1">
							<StatsCards streak={streak} accuracy={progressData.accuracy} />
						</div>

						<div className="md:col-span-2 lg:col-span-2">
							<WeeklyChartCard weekProgress={weekProgress} />
						</div>

						<m.div variants={STAGGER_ITEM} className="md:col-span-1">
							<RecentAchievements initialAchievements={initialAchievements ?? undefined} />
						</m.div>
						<m.div variants={STAGGER_ITEM} className="md:col-span-1 lg:col-span-1">
							<LeaderboardPreview />
						</m.div>

						<div className="md:col-span-2 lg:col-span-1">
							<ChallengesList />
						</div>

						<m.div variants={STAGGER_ITEM} className="md:col-span-2 lg:col-span-3">
							<TopicMasteryCard />
						</m.div>
					</div>
				</m.main>
			</ScrollArea>
		</div>
	);
}
