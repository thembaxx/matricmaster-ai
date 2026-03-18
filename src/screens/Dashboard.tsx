'use client';

import {
	AtomIcon,
	BookOpen01Icon,
	CalculatorIcon,
	File01Icon,
	FunctionIcon,
	Layers01Icon,
	SparklesIcon,
	TestTube01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ActivityFeed } from '@/components/Dashboard/ActivityFeed';
import { AdaptiveScheduleBanner } from '@/components/Dashboard/AdaptiveScheduleBanner';
import { AITutorNudge } from '@/components/Dashboard/AITutorNudge';
import { BriefingGreeting } from '@/components/Dashboard/BriefingGreeting';
import { DailyMission } from '@/components/Dashboard/DailyMission';
import { FocusAreasWidget } from '@/components/Dashboard/FocusAreasWidget';
import { GrowthMap } from '@/components/Dashboard/GrowthMap';
import { KnowledgeHeatmap } from '@/components/Dashboard/KnowledgeHeatmap';
import { SubjectGrid } from '@/components/Dashboard/SubjectGridV2';
import { type StudyTask, TaskCard } from '@/components/Dashboard/TaskCardV2';
import { TaskSection } from '@/components/Dashboard/TaskSectionV2';
import { UniversityGoalCard } from '@/components/Dashboard/UniversityGoalCard';
import { WeeklyChallenge } from '@/components/Dashboard/WeeklyChallenge';
import { XpHeader } from '@/components/Gamification/XpHeader';
import { FocusContent } from '@/components/Layout/FocusContent';
import { TimelineSidebar } from '@/components/Layout/TimelineSidebar';
import { BuddyPanel } from '@/components/StudyBuddy/BuddyPanel';
import { MistakeBank } from '@/components/Widgets/MistakeBank';
import { ACHIEVEMENTS } from '@/constants/achievements';
import type { UserAchievement } from '@/lib/db/achievement-actions';
import type { UserProgressSummary } from '@/lib/db/progress-actions';
import type { TimelineTask } from '@/types/timeline';

const MOCK_PROGRESS: UserProgressSummary = {
	totalQuestionsAttempted: 127,
	totalCorrect: 98,
	totalMarksEarned: 2450,
	accuracy: 77,
	streakDays: 12,
	recentSessions: [],
};

const MOCK_STREAK = {
	currentStreak: 12,
	bestStreak: 21,
	lastActivityDate: new Date().toISOString(),
};

const MOCK_ACHIEVEMENTS = {
	unlocked: [
		{
			id: '1',
			achievementId: 'first-quiz',
			title: 'First steps',
			description: 'Complete your first quiz',
			icon: '🎯',
			unlockedAt: new Date(),
		},
		{
			id: '2',
			achievementId: 'streak-7',
			title: 'Week warrior',
			description: 'Maintain a 7-day streak',
			icon: '🔥',
			unlockedAt: new Date(),
		},
		{
			id: '3',
			achievementId: 'perfect-score',
			title: 'Perfectionist',
			description: 'Get 100% on a quiz',
			icon: '⭐',
			unlockedAt: new Date(),
		},
	] as UserAchievement[],
	available: ACHIEVEMENTS,
} as const;

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
	session?: { user: { name?: string | null } } | null;
	learningStats?: {
		weakTopics: Array<{ topic: string; subjectId: number }>;
		needsReview: unknown[];
	} | null;
	topicsNeedingReview?: unknown[] | null;
	briefingData?: BriefingData | null;
	mistakeCount?: number;
}

interface BriefingData {
	apsProgress: {
		currentAps: number;
		targetAps: number;
		pointsThisMonth: number;
		universityTarget?: string;
	};
	weakTopics: Array<{
		topic: string;
		subject: string;
		confidence: number;
	}>;
	streak: {
		currentStreak: number;
		hasStudiedToday: boolean;
	};
	greeting: string;
	motivationalMessage?: string;
	quickTips?: string[];
	hasAiGreeting: boolean;
}

const DEMO_TASKS: Record<string, StudyTask[]> = {
	high: [
		{
			id: '1',
			title: 'Calculus derivatives',
			subject: 'Mathematics',
			icon: CalculatorIcon,
			duration: '45 min',
			priority: 'high',
			completed: false,
			color: 'bg-tiimo-yellow',
		},
		{
			id: '2',
			title: 'Circuit analysis',
			subject: 'Physics',
			icon: AtomIcon,
			duration: '30 min',
			priority: 'high',
			completed: false,
			color: 'bg-tiimo-blue',
		},
	],
	medium: [
		{
			id: '3',
			title: 'Essay planning',
			subject: 'English',
			icon: BookOpen01Icon,
			duration: '60 min',
			priority: 'medium',
			completed: false,
			color: 'bg-tiimo-lavender',
		},
		{
			id: '4',
			title: 'Cell structures review',
			subject: 'Life Sciences',
			icon: AtomIcon,
			duration: '45 min',
			priority: 'medium',
			completed: true,
			color: 'bg-tiimo-green',
		},
	],
};

const DEMO_TIMELINE: TimelineTask[] = [
	{
		id: 't1',
		title: 'Calculus',
		subject: 'Mathematics',
		subjectEmoji: '🧮',
		subjectColor: 'bg-tiimo-yellow',
		startTime: '08:00',
		endTime: '09:00',
		duration: 60,
		completed: true,
		priority: 'high',
	},
	{
		id: 't2',
		title: 'Mechanics',
		subject: 'Physics',
		subjectEmoji: '⚛️',
		subjectColor: 'bg-tiimo-blue',
		startTime: '10:00',
		endTime: '11:00',
		duration: 60,
		completed: false,
		priority: 'high',
	},
	{
		id: 't3',
		title: 'Essay Review',
		subject: 'English',
		subjectEmoji: '📝',
		subjectColor: 'bg-tiimo-lavender',
		startTime: '13:00',
		endTime: '14:00',
		duration: 60,
		completed: false,
		priority: 'medium',
	},
	{
		id: 't4',
		title: 'Cell Biology',
		subject: 'Life Sciences',
		subjectEmoji: '🧬',
		subjectColor: 'bg-tiimo-green',
		startTime: '15:00',
		endTime: '16:00',
		duration: 60,
		completed: false,
		priority: 'medium',
	},
];

export default function Dashboard({
	initialProgress,
	initialStreak,
	initialAchievements,
	session,
	briefingData,
	mistakeCount,
}: DashboardProps) {
	const router = useRouter();
	const [tasks, setTasks] = useState<Record<string, StudyTask[]>>(DEMO_TASKS);
	const [expanded, setExpanded] = useState<Record<string, boolean>>({ high: true, medium: true });
	const [weaknessData, setWeaknessData] = useState<
		{ topic: string; mistakeCount: number; subject: string }[]
	>([]);
	const [scheduleChanges, setScheduleChanges] = useState<{
		rescheduledGoals: number;
		extraPracticeAdded: number;
	} | null>(null);

	useEffect(() => {
		fetch('/api/growth-map')
			.then((res) => res.json())
			.then((data) => {
				if (Array.isArray(data)) {
					setWeaknessData(data);
				}
			})
			.catch(console.error);
	}, []);

	useEffect(() => {
		fetch('/api/adaptive-schedule', { method: 'POST' })
			.then((res) => res.json())
			.then((data) => {
				if (data.rescheduledGoals > 0 || data.extraPracticeAdded > 0) {
					setScheduleChanges(data);
				}
			})
			.catch(console.error);
	}, []);

	const progress = initialProgress ?? MOCK_PROGRESS;
	const streak = initialStreak ?? MOCK_STREAK;
	const achievements = initialAchievements ?? MOCK_ACHIEVEMENTS;

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
		progress.recentSessions?.[0]?.topic || progress.recentSessions?.[0]?.subjectId?.toString();

	return (
		<div className="min-h-screen bg-background flex">
			<TimelineSidebar />
			<FocusContent>
				<div className="mx-auto px-4 sm:px-6 lg:px-8 pb-40">
					<BriefingGreeting
						userName={session?.user?.name}
						completedCount={completedCount}
						totalCount={totalCount}
						streakDays={streak.currentStreak}
						suggestedSubject={suggestedSubject}
						timelineTasks={DEMO_TIMELINE}
						flashcardsDue={12}
						weakTopicsCount={3}
						recentAccuracy={77}
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
							{/* Welcome & Stats Row */}
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

							{/* Gamification Row */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<XpHeader
									variant="full"
									initialAchievements={achievements}
									initialStreak={{ currentStreak: streak.currentStreak }}
								/>
								<WeeklyChallenge initialProgress={progress} />
							</div>

							{/* Task List */}
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

							<section className="space-y-6">
								<m.h2
									initial={{ opacity: 0, x: -20 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ delay: 0.6 }}
									className="text-xl font-semibold text-foreground"
								>
									Recommended for You
								</m.h2>
								<div className="space-y-3">
									{[
										{
											title: 'Weak Topics Practice',
											desc: 'Focus on areas needing improvement',
											icon: SparklesIcon,
											color: 'bg-red-100 dark:bg-red-900/20 text-red-600',
											href: '/review',
										},
										{
											title: 'Past Papers',
											desc: 'Practice with exam questions',
											icon: File01Icon,
											color: 'bg-green-100 dark:bg-green-900/20 text-green-600',
											href: '/past-papers',
										},
										{
											title: 'Flashcards Review',
											desc: 'Quick recall practice',
											icon: Layers01Icon,
											color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600',
											href: '/flashcards',
										},
										{
											title: 'Science Lab',
											desc: 'Interactive physics simulations',
											icon: TestTube01Icon,
											color: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600',
											href: '/science-lab/circuits',
										},
										{
											title: 'Math Graphing',
											desc: 'Plot functions & explore graphs',
											icon: FunctionIcon,
											color: 'bg-orange-100 dark:bg-orange-900/20 text-orange-600',
											href: '/math/graph',
										},
										{
											title: 'Setwork Library',
											desc: 'Literature study guides & quizzes',
											icon: BookOpen01Icon,
											color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600',
											href: '/setwork-library',
										},
									].map((item, i) => (
										<m.button
											key={i}
											type="button"
											initial={{ opacity: 0, x: -20 }}
											animate={{ opacity: 1, x: 0 }}
											transition={{ delay: 0.65 + i * 0.08 }}
											whileHover={{ x: 4 }}
											whileTap={{ scale: 0.99 }}
											onClick={() => router.push(item.href)}
											className="w-full p-4 bg-card border border-border rounded-2xl text-left transition-all flex items-center gap-4 group hover:border-primary/30 hover:shadow-md"
										>
											<div
												className={`w-10 h-10 ${item.color} rounded-xl flex items-center justify-center shrink-0`}
											>
												<HugeiconsIcon icon={item.icon} className="w-5 h-5" />
											</div>
											<div className="flex-1">
												<h3 className="font-bold text-foreground">{item.title}</h3>
												<p className="text-xs text-muted-foreground">{item.desc}</p>
											</div>
											<div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
												<svg
													width="12"
													height="12"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													strokeWidth="2"
													className="text-muted-foreground"
													role="img"
													aria-label="Navigate"
												>
													<path d="M5 12h14M12 5l7 7-7 7" />
												</svg>
											</div>
										</m.button>
									))}
								</div>
							</section>

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
