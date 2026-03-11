'use client';

import { AnimatePresence, m } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import { FocusContent } from '@/components/Layout/FocusContent';
import { TimelineSidebar } from '@/components/Layout/TimelineSidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { UserProgressSummary } from '@/lib/db/progress-actions';
import { cn } from '@/lib/utils';

export interface DashboardInitialStreak {
	currentStreak: number;
	bestStreak: number;
	lastActivityDate: string | null;
}

interface DashboardProps {
	initialProgress?: UserProgressSummary | null;
	initialStreak?: DashboardInitialStreak | null;
	initialAchievements?: {
		unlocked: unknown[];
		available: unknown;
	} | null;
	session?: unknown | null;
}

// Study Task interface
interface StudyTask {
	id: string;
	title: string;
	subject: string;
	emoji: string;
	duration: string;
	priority: 'high' | 'medium' | 'low';
	completed: boolean;
}

// Demo tasks by priority
const DEMO_TASKS: Record<string, StudyTask[]> = {
	high: [
		{
			id: '1',
			title: 'Calculus derivatives',
			subject: 'Mathematics',
			emoji: '🧮',
			duration: '45 min',
			priority: 'high',
			completed: false,
		},
		{
			id: '2',
			title: 'Circuit analysis',
			subject: 'Physics',
			emoji: '⚛️',
			duration: '30 min',
			priority: 'high',
			completed: false,
		},
	],
	medium: [
		{
			id: '3',
			title: 'Essay planning',
			subject: 'English',
			emoji: '📖',
			duration: '60 min',
			priority: 'medium',
			completed: false,
		},
		{
			id: '4',
			title: 'Cell structures review',
			subject: 'Life Sciences',
			emoji: '🧬',
			duration: '45 min',
			priority: 'medium',
			completed: true,
		},
	],
	low: [
		{
			id: '5',
			title: 'Map skills practice',
			subject: 'Geography',
			emoji: '🌍',
			duration: '20 min',
			priority: 'low',
			completed: false,
		},
	],
};

const SUBJECTS = [
	{ id: 'math', name: 'Mathematics', emoji: '🧮', color: 'bg-subject-math-soft text-subject-math' },
	{
		id: 'physics',
		name: 'Physics',
		emoji: '⚛️',
		color: 'bg-subject-physics-soft text-subject-physics',
	},
	{
		id: 'life',
		name: 'Life Sciences',
		emoji: '🧬',
		color: 'bg-subject-life-soft text-subject-life',
	},
	{
		id: 'accounting',
		name: 'Accounting',
		emoji: '💰',
		color: 'bg-subject-accounting-soft text-subject-accounting',
	},
	{
		id: 'english',
		name: 'English',
		emoji: '📖',
		color: 'bg-subject-english-soft text-subject-english',
	},
];

export default function Dashboard(_props: DashboardProps) {
	const [tasks, setTasks] = useState<Record<string, StudyTask[]>>(DEMO_TASKS);
	const [expanded, setExpanded] = useState<Record<string, boolean>>({
		high: true,
		medium: true,
		low: true,
	});

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

	return (
		<div className="min-h-screen bg-background">
			<TimelineSidebar />

			<FocusContent>
				{/* Header */}
				<m.header
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					className="mb-8 tiimo-transition"
				>
					<h1 className="text-4xl font-display font-bold text-foreground mb-2">Wednesday</h1>
					<p className="text-lg text-muted-foreground">
						{completedCount} of {totalCount} tasks completed
					</p>
				</m.header>

				<ScrollArea className="h-[calc(100vh-200px)] no-scrollbar">
					<div className="space-y-8 pb-24">
						{/* Priority Sections */}

						<PrioritySection
							title="High priority"
							count={tasks.high.length}
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
						</PrioritySection>

						<PrioritySection
							title="Medium priority"
							count={tasks.medium.length}
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
						</PrioritySection>

						<PrioritySection
							title="Low priority"
							count={tasks.low.length}
							priority="low"
							expanded={expanded.low}
							onToggle={() => setExpanded((p) => ({ ...p, low: !p.low }))}
						>
							{tasks.low.map((task, index) => (
								<TaskCard
									key={task.id}
									task={task}
									index={index}
									onToggle={() => toggleTask(task.id, 'low')}
								/>
							))}
						</PrioritySection>

						{/* Subjects Grid */}
						<section>
							<h2 className="text-lg font-semibold text-foreground mb-4">Your subjects</h2>
							<div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
								{SUBJECTS.map((subject, index) => (
									<m.div
										key={subject.id}
										initial={{ opacity: 0, scale: 0.9 }}
										animate={{ opacity: 1, scale: 1 }}
										transition={{ delay: index * 0.1 }}
										whileHover={{ scale: 1.02 }}
										whileTap={{ scale: 0.98 }}
									>
										<Link
											href={`/subjects/${subject.id}`}
											className={cn(
												'block p-6 rounded-2xl transition-all tiimo-card hover:shadow-md hover:border-primary/20',
												subject.color.replace('bg-', 'bg-').replace('-soft', '-soft')
											)}
										>
											<span className="tiimo-icon-2xl mb-4 block">{subject.emoji}</span>
											<span className="font-semibold text-lg">{subject.name}</span>
										</Link>
									</m.div>
								))}
							</div>
						</section>
					</div>
				</ScrollArea>
			</FocusContent>
		</div>
	);
}

// Priority Section Component
function PrioritySection({
	title,
	count,
	priority,
	expanded,
	onToggle,
	children,
}: {
	title: string;
	count: number;
	priority: 'high' | 'medium' | 'low';
	expanded: boolean;
	onToggle: () => void;
	children: React.ReactNode;
}) {
	return (
		<section>
			<button
				type="button"
				onClick={onToggle}
				className="flex items-center gap-3 mb-4 w-full text-left tiimo-card rounded-xl p-4 hover:shadow-sm transition-all"
			>
				<span
					className={cn(
						'px-3 py-2 rounded-full text-xs font-semibold uppercase',
						priority === 'high'
							? 'bg-priority-high-soft text-priority-high'
							: priority === 'medium'
								? 'bg-priority-medium-soft text-priority-medium'
								: 'bg-priority-low-soft text-priority-low'
					)}
				>
					{title} ({count})
				</span>
				<span className="text-muted-foreground text-sm tiimo-transition">
					{expanded ? '▼' : '▶'}
				</span>
			</button>

			<AnimatePresence>
				{expanded && (
					<m.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: 'auto' }}
						exit={{ opacity: 0, height: 0 }}
						className="space-y-3"
					>
						{children}
					</m.div>
				)}
			</AnimatePresence>
		</section>
	);
}

// Task Card Component
function TaskCard({
	task,
	index,
	onToggle,
}: {
	task: StudyTask;
	index: number;
	onToggle: () => void;
}) {
	return (
		<m.div
			initial={{ opacity: 0, x: -20 }}
			animate={{ opacity: 1, x: 0 }}
			transition={{ delay: index * 0.1 }}
			className={cn(
				'tiimo-task-card hover:shadow-md hover:border-primary/20 transition-all',
				task.completed && 'opacity-70'
			)}
		>
			{/* Huge Checkbox */}
			<button type="button" onClick={onToggle} className="tiimo-checkbox">
				{task.completed && (
					<m.svg
						className="w-4 h-4"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						strokeWidth={2}
					>
						<path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
					</m.svg>
				)}
			</button>

			{/* Task Info */}
			<div className="flex-1 min-w-0 space-y-1">
				<p
					className={cn(
						'font-semibold text-foreground',
						task.completed && 'line-through text-muted-foreground'
					)}
				>
					{task.title}
				</p>
				<p className="text-sm text-muted-foreground">
					{task.subject} • {task.duration}
				</p>
			</div>

			{/* Emoji */}
			<div className="tiimo-icon-xl bg-background/50 text-foreground/80 rounded-full flex items-center justify-center">
				{task.emoji}
			</div>
		</m.div>
	);
}
