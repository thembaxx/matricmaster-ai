'use client';

import { AtomIcon, BookOpen01Icon, CalculatorIcon } from '@hugeicons/core-free-icons';
import { m } from 'framer-motion';
import { Card } from '@/components/ui/card';
import type { StudyTask } from './TaskCardV2';

export const DEMO_TASKS: Record<string, StudyTask[]> = {
	high: [
		{
			id: '1',
			title: 'calculus derivatives',
			subject: 'mathematics',
			icon: CalculatorIcon,
			duration: '45 min',
			priority: 'high',
			completed: false,
			color: 'bg-tiimo-yellow',
		},
		{
			id: '2',
			title: 'circuit analysis',
			subject: 'physics',
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
			title: 'essay planning',
			subject: 'english',
			icon: BookOpen01Icon,
			duration: '60 min',
			priority: 'medium',
			completed: false,
			color: 'bg-tiimo-lavender',
		},
		{
			id: '4',
			title: 'cell structures review',
			subject: 'life sciences',
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
			>
				<Card className="p-6 border-border/50 shadow-tiimo">
					<div className="text-3xl font-black text-tiimo-yellow font-numeric">{streak}</div>
					<div className="label-xs font-bold text-muted-foreground tracking-tight mt-1">
						day streak
					</div>
				</Card>
			</m.div>

			<m.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.15 }}
			>
				<Card className="p-6 border-border/50 shadow-tiimo">
					<div className="text-3xl font-black text-tiimo-lavender font-numeric">{accuracy}%</div>
					<div className="label-xs font-bold text-muted-foreground tracking-tight mt-1">
						accuracy
					</div>
				</Card>
			</m.div>

			<m.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.2 }}
			>
				<Card className="p-6 border-border/50 shadow-tiimo">
					<div className="text-3xl font-black text-tiimo-green font-numeric">{totalMarks}</div>
					<div className="label-xs font-bold text-muted-foreground tracking-tight mt-1">
						total marks
					</div>
				</Card>
			</m.div>

			<m.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.25 }}
			>
				<Card className="p-6 border-border/50 shadow-tiimo">
					<div className="text-3xl font-black text-tiimo-blue font-numeric">
						{questionsAttempted}
					</div>
					<div className="label-xs font-bold text-muted-foreground tracking-tight mt-1">
						questions
					</div>
				</Card>
			</m.div>
		</div>
	);
}
