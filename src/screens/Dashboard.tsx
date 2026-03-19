'use client';

import { useQuery } from '@tanstack/react-query';
import { m } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { AdaptiveScheduleBanner } from '@/components/Dashboard/AdaptiveScheduleBanner';
import { AITutorNudge } from '@/components/Dashboard/AITutorNudge';
import { BriefingGreeting } from '@/components/Dashboard/BriefingGreeting';
import { DailyMission } from '@/components/Dashboard/DailyMission';
import { FocusAreasWidget } from '@/components/Dashboard/FocusAreasWidget';
import { RecommendedSection } from '@/components/Dashboard/RecommendedSection';
import { DEMO_TASKS } from '@/components/Dashboard/StatsGrid';
import { SubjectGrid } from '@/components/Dashboard/SubjectGridV2';
import { type StudyTask, TaskCard } from '@/components/Dashboard/TaskCardV2';
import { TaskSection } from '@/components/Dashboard/TaskSectionV2';
import { UniversityGoalCard } from '@/components/Dashboard/UniversityGoalCard';
import { XpHeader } from '@/components/Gamification/XpHeader';
import { FocusContent } from '@/components/Layout/FocusContent';
import { TimelineSidebar } from '@/components/Layout/TimelineSidebar';
import { MistakeBank } from '@/components/Widgets/MistakeBank';
import type { ACHIEVEMENTS } from '@/constants/achievements';
import {
	type BriefingData,
	type DashboardInitialStreak,
	DEMO_TIMELINE,
	MOCK_ACHIEVEMENTS,
	MOCK_STREAK,
} from '@/constants/mock-dashboard';
import type { UserAchievement } from '@/lib/db/achievement-actions';
import { useDashboardProgress } from '@/stores/useProgressStore';

const GrowthMap = dynamic(
	() => import('@/components/Dashboard/GrowthMap').then((mod) => ({ default: mod.GrowthMap })),
	{ ssr: false, loading: () => <div className="h-64 animate-pulse bg-muted rounded-lg" /> }
);

const BuddyPanel = dynamic(
	() => import('@/components/StudyBuddy/BuddyPanel').then((mod) => ({ default: mod.BuddyPanel })),
	{ ssr: false, loading: () => <div className="h-48 animate-pulse bg-muted rounded-lg" /> }
);

const KnowledgeHeatmap = dynamic(
	() =>
		import('@/components/Dashboard/KnowledgeHeatmap').then((mod) => ({
			default: mod.KnowledgeHeatmap,
		})),
	{ ssr: false, loading: () => <div className="h-64 animate-pulse bg-muted rounded-lg" /> }
);

const ActivityFeed = dynamic(
	() =>
		import('@/components/Dashboard/ActivityFeed').then((mod) => ({
			default: mod.ActivityFeed,
		})),
	{ ssr: false, loading: () => <div className="h-48 animate-pulse bg-muted rounded-lg" /> }
);

const WeeklyChallenge = dynamic(
	() =>
		import('@/components/Dashboard/WeeklyChallenge').then((mod) => ({
			default: mod.WeeklyChallenge,
		})),
	{ ssr: false, loading: () => <div className="h-48 animate-pulse bg-muted rounded-lg" /> }
);

interface DashboardProps {
	initialStreak?: DashboardInitialStreak | null;
	initialAchievements?: {
		unlocked: UserAchievement[];
		available: typeof ACHIEVEMENTS;
	} | null;
	session?: { user: { name?: string | null } } | null;
	briefingData?: BriefingData | null;
	mistakeCount?: number;
}

export default function Dashboard({
	initialStreak,
	initialAchievements,
	session,
	briefingData,
	mistakeCount,
}: DashboardProps) {
	const [tasks, setTasks] = useState<Record<string, StudyTask[]>>(DEMO_TASKS);
	const [expanded, setExpanded] = useState<Record<string, boolean>>({ high: true, medium: true });

	const {
		progress,
		flashcardsDue: storeFlashcardsDue,
		weakTopicsCount: storeWeakTopicsCount,
		accuracy: storeAccuracy,
		streakDays: storeStreakDays,
		refetch,
	} = useDashboardProgress();

	const { data: weaknessData = [] } = useQuery({
		queryKey: ['growth-map'],
		queryFn: async () => {
			const res = await fetch('/api/growth-map');
			return res.json();
		},
		select: (data) =>
			(Array.isArray(data) ? data : []) as {
				topic: string;
				mistakeCount: number;
				subject: string;
			}[],
	});

	const { data: scheduleData } = useQuery({
		queryKey: ['adaptive-schedule'],
		queryFn: async () => {
			const res = await fetch('/api/adaptive-schedule', { method: 'POST' });
			return res.json();
		},
		select: (data) => (data.rescheduledGoals > 0 || data.extraPracticeAdded > 0 ? data : null),
	});

	const { data: flashcardsDueData } = useQuery({
		queryKey: ['flashcards-due'],
		queryFn: async () => {
			const res = await fetch('/api/flashcards/due');
			if (!res.ok) return [];
			return res.json();
		},
		select: (data) => (Array.isArray(data) ? data.length : 0),
	});

	const scheduleChanges = scheduleData ?? null;
	const streak = initialStreak ?? MOCK_STREAK;
	const achievements = initialAchievements ?? MOCK_ACHIEVEMENTS;

	const flashcardsDue = flashcardsDueData ?? storeFlashcardsDue;
	const weakTopicsCount = storeWeakTopicsCount;
	const recentAccuracy = storeAccuracy || 0;

	useEffect(() => {
		if (!progress) {
			refetch();
		}
	}, [progress, refetch]);

	const toggleTask = (taskId: string, priority: string) => {
		setTasks((prev) => ({
			...prev,
			[priority]: prev[priority].map((task) =>
				task.id === taskId ? { ...task, completed: !task.completed } : task
			),
		}));
	};

	const completedCount = Object.values(tasks)
		.flat()
		.filter((t) => t.completed).length;
	const totalCount = Object.values(tasks).flat().length;
	const suggestedSubject =
		progress?.recentSessions?.[0]?.topic ||
		progress?.recentSessions?.[0]?.subjectId?.toString() ||
		progress?.subjectProgress?.[0]?.subjectName?.toLowerCase();

	return (
		<div className="min-h-screen bg-background flex">
			<TimelineSidebar />
			<FocusContent>
				<div className="mx-auto px-4 sm:px-6 lg:px-8 pb-40">
					<BriefingGreeting
						userName={session?.user?.name}
						completedCount={completedCount}
						totalCount={totalCount}
						streakDays={progress?.streakDays ?? streak.currentStreak ?? storeStreakDays}
						suggestedSubject={suggestedSubject}
						timelineTasks={DEMO_TIMELINE}
						flashcardsDue={flashcardsDue}
						weakTopicsCount={weakTopicsCount}
						recentAccuracy={recentAccuracy}
						briefingData={briefingData ?? undefined}
					/>

					<div className="mb-6">
						<AITutorNudge />
					</div>

					{scheduleChanges && (
						<div className="mb-6">
							<AdaptiveScheduleBanner changes={scheduleChanges} />
						</div>
					)}

					<div className="h-full no-scrollbar">
						<m.div layout className="space-y-8 pb-36">
							<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
								<DailyMission />
								<div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
									<UniversityGoalCard />
									<MistakeBank initialCount={mistakeCount ?? 0} />
									<FocusAreasWidget />
								</div>
							</div>

							{weaknessData.length > 0 && (
								<div className="bg-card rounded-xl p-6 border">
									<h3 className="text-lg font-semibold mb-4">Growth Map</h3>
									<p className="text-sm text-muted-foreground mb-4">
										Topics where you need the most practice
									</p>
									<GrowthMap data={weaknessData} />
								</div>
							)}

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<XpHeader
									variant="full"
									initialAchievements={achievements}
									initialStreak={{ currentStreak: streak.currentStreak }}
								/>
								<WeeklyChallenge
									initialProgress={
										progress
											? {
													totalQuestionsAttempted: progress.totalQuestionsAttempted,
													totalCorrect: progress.totalCorrect,
													totalMarksEarned: progress.totalMarksEarned,
													accuracy: progress.accuracy,
													streakDays: progress.streakDays,
													recentSessions: progress.recentSessions,
												}
											: undefined
									}
								/>
							</div>

							<div className="space-y-6">
								<TaskSection
									title="High Priority"
									priority="high"
									expanded={expanded.high}
									onToggle={() => setExpanded((p) => ({ ...p, high: !p.high }))}
								>
									{tasks.high.map((task, index) => (
										<TaskCard
											key={task.id}
											task={task}
											index={index}
											onToggle={() => toggleTask(task.id, 'high')}
										/>
									))}
								</TaskSection>

								<TaskSection
									title="Quick Tasks"
									priority="medium"
									expanded={expanded.medium}
									onToggle={() => setExpanded((p) => ({ ...p, medium: !p.medium }))}
								>
									{tasks.medium.map((task, index) => (
										<TaskCard
											key={task.id}
											task={task}
											index={index}
											onToggle={() => toggleTask(task.id, 'medium')}
										/>
									))}
								</TaskSection>
							</div>

							<m.section
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.55 }}
								className="space-y-6"
							>
								<m.h2
									initial={{ opacity: 0, x: -20 }}
									animate={{ opacity: 1, x: 0 }}
									className="text-xl font-semibold text-foreground"
								>
									Your Subjects
								</m.h2>
								<SubjectGrid />
							</m.section>

							<m.section
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.55 }}
								className="space-y-6"
							>
								<BuddyPanel />
							</m.section>

							<m.section
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.58 }}
								className="space-y-6"
							>
								<KnowledgeHeatmap compact />
							</m.section>

							<RecommendedSection />

							<section className="space-y-6">
								<m.h2
									initial={{ opacity: 0, x: -20 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ delay: 0.75 }}
									className="text-xl font-semibold text-foreground"
								>
									Recent activity
								</m.h2>
								<ActivityFeed />
							</section>
						</m.div>
					</div>
				</div>
			</FocusContent>
		</div>
	);
}
