'use client';

import {
	AtomIcon,
	BookOpen01Icon,
	CalculatorIcon,
	File01Icon,
	GridIcon,
	Layers01Icon,
	SparklesIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ActivityFeed } from '@/components/Dashboard/ActivityFeed';
import { DashboardHeader } from '@/components/Dashboard/DashboardHeaderV2';
import { SubjectGrid } from '@/components/Dashboard/SubjectGridV2';
import { type StudyTask, TaskCard } from '@/components/Dashboard/TaskCardV2';
import { TaskSection } from '@/components/Dashboard/TaskSectionV2';
import { WeeklyChallenge } from '@/components/Dashboard/WeeklyChallenge';
import { XpHeader } from '@/components/Gamification/XpHeader';
import { FocusContent } from '@/components/Layout/FocusContent';
import { TimelineSidebar } from '@/components/Layout/TimelineSidebar';
import { ACHIEVEMENTS } from '@/constants/achievements';
import type { UserAchievement } from '@/lib/db/achievement-actions';
import type { UserProgressSummary } from '@/lib/db/progress-actions';

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

export default function Dashboard({
	initialProgress,
	initialStreak,
	initialAchievements,
	session,
}: DashboardProps) {
	const router = useRouter();
	const [tasks, setTasks] = useState<Record<string, StudyTask[]>>(DEMO_TASKS);
	const [expanded, setExpanded] = useState<Record<string, boolean>>({ high: true, medium: true });

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
	const today = new Date().toLocaleDateString('en-US', {
		weekday: 'long',
		month: 'long',
		day: 'numeric',
	});

	return (
		<div className="min-h-screen bg-background flex">
			<TimelineSidebar />
			<FocusContent>
				<div className="mx-auto px-4 sm:px-6 lg:px-8 pb-8">
					<DashboardHeader
						today={today}
						completedCount={completedCount}
						totalCount={totalCount}
						initialXp={progress.totalMarksEarned}
					/>

					<div className="h-[calc(100vh-320px)] sm:h-full no-scrollbar">
						<div className="space-y-10 pb-32">
							{/* Welcome & Stats Row */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div className="space-y-6">
									<div className="space-y-1">
										<h2 className="text-base font-semibold tracking-tight">
											Hello, {session?.user?.name?.split(' ')[0] || 'Scholar'}!
										</h2>
										<p className="text-xs text-tiimo-gray-muted">Let's crush your goals today.</p>
									</div>
									<XpHeader
										variant="full"
										initialAchievements={achievements}
										initialStreak={{ currentStreak: streak.currentStreak }}
									/>
								</div>
								<WeeklyChallenge initialProgress={progress} />
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

							<SubjectGrid />

							<section className="space-y-4">
								<h2 className="text-xl font-semibold text-foreground">Start Studying</h2>
								<div className="grid grid-cols-2 gap-4">
									<button
										type="button"
										onClick={() => router.push('/quiz')}
										className="p-5 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-3xl text-left transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-violet-600/20"
									>
										<div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-3">
											<HugeiconsIcon icon={SparklesIcon} className="w-5 h-5 text-white" />
										</div>
										<h3 className="text-white font-bold">Quiz</h3>
										<p className="text-white/70 text-xs mt-1">Test your knowledge</p>
									</button>
									<button
										type="button"
										onClick={() => router.push('/snap-and-solve')}
										className="p-5 bg-card border border-border rounded-3xl text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
									>
										<div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/20 rounded-xl flex items-center justify-center mb-3">
											<HugeiconsIcon icon={CalculatorIcon} className="w-5 h-5 text-amber-600" />
										</div>
										<h3 className="text-foreground font-bold">Snap & Solve</h3>
										<p className="text-muted-foreground text-xs mt-1">Photo math solver</p>
									</button>
									<button
										type="button"
										onClick={() => router.push('/flashcards')}
										className="p-5 bg-card border border-border rounded-3xl text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
									>
										<div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center mb-3">
											<HugeiconsIcon icon={Layers01Icon} className="w-5 h-5 text-blue-600" />
										</div>
										<h3 className="text-foreground font-bold">Flashcards</h3>
										<p className="text-muted-foreground text-xs mt-1">Quick review</p>
									</button>
									<button
										type="button"
										onClick={() => router.push('/past-papers')}
										className="p-5 bg-card border border-border rounded-3xl text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
									>
										<div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center mb-3">
											<HugeiconsIcon icon={File01Icon} className="w-5 h-5 text-green-600" />
										</div>
										<h3 className="text-foreground font-bold">Past Papers</h3>
										<p className="text-muted-foreground text-xs mt-1">Exam practice</p>
									</button>
									<button
										type="button"
										onClick={() => router.push('/curriculum-map')}
										className="p-5 bg-card border border-border rounded-3xl text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
									>
										<div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-xl flex items-center justify-center mb-3">
											<HugeiconsIcon icon={GridIcon} className="w-5 h-5 text-purple-600" />
										</div>
										<h3 className="text-foreground font-bold">Curriculum</h3>
										<p className="text-muted-foreground text-xs mt-1">Browse topics</p>
									</button>
									<button
										type="button"
										onClick={() => router.push('/study-companion')}
										className="p-5 bg-card border border-border rounded-3xl text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
									>
										<div className="w-10 h-10 bg-rose-100 dark:bg-rose-900/20 rounded-xl flex items-center justify-center mb-3">
											<HugeiconsIcon icon={BookOpen01Icon} className="w-5 h-5 text-rose-600" />
										</div>
										<h3 className="text-foreground font-bold">AI Tutor</h3>
										<p className="text-muted-foreground text-xs mt-1">Ask anything</p>
									</button>
								</div>
							</section>

							<section className="space-y-4">
								<h2 className="text-xl font-semibold text-foreground">Recommended for You</h2>
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
									].map((item, i) => (
										<button
											key={i}
											type="button"
											onClick={() => router.push(item.href)}
											className="w-full p-4 bg-card border border-border rounded-2xl text-left transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center gap-4"
										>
											<div
												className={`w-10 h-10 ${item.color} rounded-xl flex items-center justify-center shrink-0`}
											>
												<HugeiconsIcon icon={item.icon} className="w-5 h-5" />
											</div>
											<div>
												<h3 className="font-bold text-foreground">{item.title}</h3>
												<p className="text-xs text-muted-foreground">{item.desc}</p>
											</div>
										</button>
									))}
								</div>
							</section>

							<section>
								<h2 className="text-xl font-semibold text-foreground mb-6">Recent activity</h2>
								<ActivityFeed />
							</section>
						</div>
					</div>
				</div>
			</FocusContent>
		</div>
	);
}
