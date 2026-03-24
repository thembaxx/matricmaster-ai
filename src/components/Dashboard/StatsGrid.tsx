'use client';

import { AtomIcon, BookOpen01Icon, CalculatorIcon } from '@hugeicons/core-free-icons';
import { m } from 'framer-motion';
import type { StudyTask } from './TaskCardV2';

export const DEMO_TASKS: Record<string, StudyTask[]> = {
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

interface StatsGridProps {
	streak: number;
	accuracy: number;
	totalMarks: number;
	questionsAttempted: number;
}

export function StatsGrid({ streak, accuracy, totalMarks, questionsAttempted }: StatsGridProps) {
	return (
		<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
			<m.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.1 }}
				className="p-6 bg-card rounded-2xl border border-border/50 shadow-tiimo"
			>
				<div className="text-3xl font-black text-tiimo-yellow">{streak}</div>
				<div className="text-xs font-bold text-muted-foreground  tracking-wider mt-1">
					Day Streak
				</div>
			</m.div>

			<m.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.15 }}
				className="p-6 bg-card rounded-2xl border border-border/50 shadow-tiimo"
			>
				<div className="text-3xl font-black text-tiimo-lavender">{accuracy}%</div>
				<div className="text-xs font-bold text-muted-foreground  tracking-wider mt-1">Accuracy</div>
			</m.div>

			<m.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.2 }}
				className="p-6 bg-card rounded-2xl border border-border/50 shadow-tiimo"
			>
				<div className="text-3xl font-black text-tiimo-green">{totalMarks}</div>
				<div className="text-xs font-bold text-muted-foreground  tracking-wider mt-1">
					Total Marks
				</div>
			</m.div>

			<m.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.25 }}
				className="p-6 bg-card rounded-2xl border border-border/50 shadow-tiimo"
			>
				<div className="text-3xl font-black text-tiimo-blue">{questionsAttempted}</div>
				<div className="text-xs font-bold text-muted-foreground  tracking-wider mt-1">
					Questions
				</div>
			</m.div>
		</div>
	);
}
