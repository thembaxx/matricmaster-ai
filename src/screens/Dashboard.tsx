'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { AdaptiveScheduleBanner } from '@/components/Dashboard/AdaptiveScheduleBanner';
import { AdaptiveScheduleCard } from '@/components/Dashboard/AdaptiveScheduleCard';
import { AITutorNudge } from '@/components/Dashboard/AITutorNudge';
import { BriefingGreeting } from '@/components/Dashboard/BriefingGreeting';
import { MoreTab } from '@/components/Dashboard/MoreTab';
import { ProgressTab } from '@/components/Dashboard/ProgressTab';
import { DEMO_TASKS } from '@/components/Dashboard/StatsGrid';
import type { StudyTask } from '@/components/Dashboard/TaskCardV2';
import { TasksTab } from '@/components/Dashboard/TasksTab';
import { TodayTab, TodayTabHeader } from '@/components/Dashboard/TodayTab';
import { FocusContent } from '@/components/Layout/FocusContent';
import { TimelineSidebar } from '@/components/Layout/TimelineSidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ACHIEVEMENTS } from '@/content';
import {
	type BriefingData,
	type DashboardInitialStreak,
	DEMO_TIMELINE,
	MOCK_ACHIEVEMENTS,
	MOCK_STREAK,
} from '@/content/mock/dashboard';
import type { UserAchievement } from '@/lib/db/achievement-actions';
import { useDashboardProgress } from '@/stores/useProgressStore';

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

	const { data: growthMapData } = useQuery({
		queryKey: ['growth-map'],
		queryFn: async () => {
			const res = await fetch('/api/growth-map');
			return res.json();
		},
		select: (data) =>
			(data ?? {}) as {
				topics: {
					topic: string;
					mistakes: number;
					subject: string;
					confidence: number | null;
					trend: 'up' | 'down' | 'stable';
					struggleCount: number;
				}[];
				insights: string[];
			},
	});

	const { data: scheduleData } = useQuery({
		queryKey: ['adaptive-schedule'],
		queryFn: async () => {
			const res = await fetch('/api/adaptive-schedule', { method: 'POST' });
			return res.json();
		},
		select: (data) =>
			data?.adjustments?.length > 0
				? (data as {
						adjustments: {
							type: 'reschedule' | 'extra_practice' | 'reminder';
							originalEventId?: string;
							newDate?: string;
							topic?: string;
							subject?: string;
							reason: string;
						}[];
						rescheduledGoals: number;
						extraPracticeAdded: number;
						message: string;
					})
				: null,
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

	const weaknessData = growthMapData?.topics ?? [];
	const growthInsights = growthMapData?.insights ?? [];
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

	const weakTopicNames = weaknessData.map((w) => w.topic);

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

					{scheduleChanges && scheduleChanges.adjustments?.length > 0 && (
						<div className="mb-6">
							<AdaptiveScheduleBanner
								changes={{
									rescheduledGoals: scheduleChanges.rescheduledGoals,
									extraPracticeAdded: scheduleChanges.extraPracticeAdded,
								}}
							/>
						</div>
					)}

					<Tabs defaultValue="today" className="w-full">
						<TabsList className="w-full justify-start mb-8 bg-transparent border-b border-border h-auto p-0 rounded-none">
							<TabsTrigger
								value="today"
								className="rounded-none border-b-2 border-transparent data-[state=active]:border-tiimo-lavender data-[state=active]:bg-transparent px-4 py-3 text-base font-medium"
							>
								today
							</TabsTrigger>
							<TabsTrigger
								value="progress"
								className="rounded-none border-b-2 border-transparent data-[state=active]:border-tiimo-lavender data-[state=active]:bg-transparent px-4 py-3 text-base font-medium"
							>
								progress
							</TabsTrigger>
							<TabsTrigger
								value="tasks"
								className="rounded-none border-b-2 border-transparent data-[state=active]:border-tiimo-lavender data-[state=active]:bg-transparent px-4 py-3 text-base font-medium"
							>
								tasks
							</TabsTrigger>
							<TabsTrigger
								value="more"
								className="rounded-none border-b-2 border-transparent data-[state=active]:border-tiimo-lavender data-[state=active]:bg-transparent px-4 py-3 text-base font-medium"
							>
								more
							</TabsTrigger>
						</TabsList>

						<TabsContent value="today" className="mt-0">
							<TodayTabHeader achievements={achievements} streak={streak} />
							<TodayTab achievements={achievements} streak={streak} />
							{scheduleChanges && scheduleChanges.adjustments?.length > 0 && (
								<div className="mt-6">
									<AdaptiveScheduleCard adjustments={scheduleChanges.adjustments} />
								</div>
							)}
						</TabsContent>

						<TabsContent value="progress" className="mt-0">
							<ProgressTab
								weaknessData={weaknessData}
								growthInsights={growthInsights}
								progress={progress ?? undefined}
								weakTopicNames={weakTopicNames}
							/>
						</TabsContent>

						<TabsContent value="tasks" className="mt-0">
							<TasksTab
								tasks={tasks}
								expanded={expanded}
								onToggleTask={toggleTask}
								onToggleSection={(p) =>
									setExpanded((prev) => ({ ...prev, [p]: !prev[p as keyof typeof prev] }))
								}
								mistakeCount={mistakeCount ?? 0}
							/>
						</TabsContent>

						<TabsContent value="more" className="mt-0">
							<MoreTab />
						</TabsContent>
					</Tabs>
				</div>
			</FocusContent>
		</div>
	);
}
