'use client';

import { AtomIcon, BookOpen01Icon, CalculatorIcon, FireIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import type React from 'react';
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

type StatIcon = typeof FireIcon;

const STAT_CONFIG = [
	{
		value: 'streak',
		label: 'day streak',
		icon: FireIcon as StatIcon,
		color: 'text-tiimo-yellow',
	},
	{
		value: 'accuracy',
		label: 'accuracy',
		icon: BookOpen01Icon as StatIcon,
		color: 'text-tiimo-lavender',
	},
	{
		value: 'totalMarks',
		label: 'total marks',
		icon: CalculatorIcon as StatIcon,
		color: 'text-tiimo-green',
	},
	{
		value: 'questionsAttempted',
		label: 'questions',
		icon: AtomIcon as StatIcon,
		color: 'text-tiimo-blue',
	},
] as const;

export function StatsGrid({ streak, accuracy, totalMarks, questionsAttempted }: StatsGridProps) {
	const values = { streak, accuracy, totalMarks, questionsAttempted };

	return (
		<div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
			{STAT_CONFIG.map((stat, i) => {
				const numValue = values[stat.value as keyof typeof values];
				return (
					<m.div
						key={stat.value}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.1 + i * 0.05 }}
						className="group"
					>
						<Card
							className="relative p-5 border-border/50 shadow-tiimo overflow-hidden border-t-2 rounded-xl group-hover:shadow-tiimo-lg transition-all duration-300"
							style={
								{
									borderTopColor: stat.color.includes('yellow')
										? '#F2C945'
										: stat.color.includes('lavender')
											? '#9F85FF'
											: stat.color.includes('green')
												? '#5CB587'
												: '#48A7DE',
								} as React.CSSProperties
							}
						>
							<div
								className={`absolute top-0 right-0 w-20 h-20 rounded-full blur-[40px] opacity-20 ${stat.color.replace('text-', 'bg-')}`}
							/>
							<div className="relative">
								<div className={`mb-3 ${stat.color}`}>
									<HugeiconsIcon icon={stat.icon} className="h-5 w-5" />
								</div>
								<div
									className={`text-4xl font-black tracking-tighter ${stat.color} font-numeric tabular-nums`}
								>
									{numValue}
								</div>
								<div className="label-xs font-semibold text-muted-foreground tracking-tight mt-1 capitalize">
									{stat.label}
								</div>
							</div>
						</Card>
					</m.div>
				);
			})}
		</div>
	);
}
