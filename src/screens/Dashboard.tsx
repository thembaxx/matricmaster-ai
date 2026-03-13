'use client';

import { AtomIcon, BookOpen01Icon, CalculatorIcon } from '@hugeicons/core-free-icons';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import type { UserProgressSummary } from '@/lib/db/progress-actions';

export interface DashboardInitialStreak {
	currentStreak: number;
	bestStreak: number;
	lastActivityDate: string | null;
}

interface DashboardProps {
	initialProgress?: UserProgressSummary | null;
	initialStreak?: DashboardInitialStreak | null;
	initialAchievements?: {
		unlocked: any[];
		available: any;
	} | null;
	session?: any | null;
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
	const [tasks, setTasks] = useState<Record<string, StudyTask[]>>(DEMO_TASKS);
	const [expanded, setExpanded] = useState<Record<string, boolean>>({ high: true, medium: true });

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
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					<DashboardHeader
						today={today}
						completedCount={completedCount}
						totalCount={totalCount}
						initialXp={initialProgress?.totalMarksEarned || 0}
					/>

					<ScrollArea className="h-[calc(100vh-280px)] no-scrollbar pr-4">
						<div className="space-y-10 pb-32">
							{/* Welcome & Stats Row */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div className="space-y-6">
									<div className="space-y-1">
										<h2 className="text-2xl font-black tracking-tight uppercase">
											Hello, {session?.user?.name?.split(' ')[0] || 'Scholar'}!
										</h2>
										<p className="text-sm font-bold text-tiimo-gray-muted uppercase tracking-widest">
											Let's crush your goals today.
										</p>
									</div>
									<XpHeader
										variant="full"
										initialAchievements={initialAchievements || undefined}
										initialStreak={
											initialStreak ? { currentStreak: initialStreak.currentStreak } : undefined
										}
									/>
								</div>
								<WeeklyChallenge initialProgress={initialProgress || undefined} />
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

							<section>
								<h2 className="text-xl font-black text-foreground tracking-tight mb-6 uppercase">
									Recent Activity
								</h2>
								<ActivityFeed />
							</section>
						</div>
					</ScrollArea>
				</div>
			</FocusContent>
		</div>
	);
}
