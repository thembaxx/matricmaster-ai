'use client';

import { m } from 'framer-motion';
import { useEffect, useState, useTransition } from 'react';
import useSWRMutation from 'swr/mutation';
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
import { useNotificationContextSafe } from '@/components/Notifications/NotificationListener';
import { BackgroundMesh } from '@/components/ui/background-mesh';
import { ScrollArea } from '@/components/ui/scroll-area';
import { STAGGER_CONTAINER, STAGGER_ITEM } from '@/lib/animation-presets';
import { useSession } from '@/lib/auth-client';
import type { UserProgressSummary } from '@/lib/db/progress-actions';

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
}

async function initDatabase() {
	const response = await fetch('/api/db/init', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
	});
	return response.json();
}

export default function Dashboard({ initialProgress, initialStreak }: DashboardProps = {}) {
	const { data: session, isPending: isSessionLoading } = useSession();
	const { unreadCount } = useNotificationContextSafe();
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

	const { trigger: triggerDbInit } = useSWRMutation('/api/db/init', () => initDatabase(), {
		revalidate: false,
		populateCache: false,
	});

	useEffect(() => {
		triggerDbInit().catch((err) => console.error('Error initializing database:', err));
	}, [triggerDbInit]);

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

	const handleNavigateToQuiz = () => {
		startTransition(() => {
			window.location.href = '/quiz';
		});
	};

	const isLoading = isSessionLoading || isPending;

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
				<XpHeader variant="full" />
			</div>

			<ScrollArea className="flex-1 relative z-10 no-scrollbar">
				<m.main
					variants={STAGGER_CONTAINER}
					initial="hidden"
					animate="visible"
					className="px-4 sm:px-6 py-6 space-y-6 sm:space-y-8 lg:px-0"
				>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
						<m.div variants={STAGGER_ITEM}>
							<WeeklyChallenge />
						</m.div>
						<m.div variants={STAGGER_ITEM}>
							<DailyGoals />
						</m.div>

						<DailyQuestCard
							totalQuestions={progressData.totalQuestions}
							dailyProgress={dailyProgress}
							isLoading={isLoading}
							onNavigateToQuiz={handleNavigateToQuiz}
						/>

						<StatsCards streak={streak} accuracy={progressData.accuracy} />

						<WeeklyChartCard weekProgress={weekProgress} />

						<m.div variants={STAGGER_ITEM}>
							<RecentAchievements />
						</m.div>
						<m.div variants={STAGGER_ITEM}>
							<LeaderboardPreview />
						</m.div>

						<ChallengesList />

						<m.div variants={STAGGER_ITEM} className="md:col-span-2 lg:col-span-3">
							<TopicMasteryCard />
						</m.div>
					</div>
				</m.main>
			</ScrollArea>
		</div>
	);
}
