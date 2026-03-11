'use client';

import { m } from 'framer-motion';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useSchedule } from '@/stores/useScheduleStore';

interface DailyReviewProps {
	isOpen?: boolean;
	onClose?: () => void;
}

const MOODS = [
	{ emoji: '😊', label: 'Great', color: 'bg-success' },
	{ emoji: '🙂', label: 'Good', color: 'bg-primary/20' },
	{ emoji: '😐', label: 'Okay', color: 'bg-warning/20' },
	{ emoji: '😔', label: 'Struggling', color: 'bg-destructive/20' },
];

export function DailyReviewModal({ isOpen = false, onClose }: DailyReviewProps) {
	const { tasks } = useSchedule();
	const [selectedMood, setSelectedMood] = useState<number | null>(null);

	const pendingTasks = tasks.filter((t) => !t.completed);
	const completedTasks = tasks.filter((t) => t.completed);

	if (!isOpen) return null;

	return (
		<m.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className="fixed inset-0 z-50 flex items-end justify-center p-4 bg-black/50"
			onClick={onClose}
		>
			<m.div
				initial={{ y: 100, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				exit={{ y: 100, opacity: 0 }}
				onClick={(e) => e.stopPropagation()}
				className="w-full max-w-md bg-card rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto"
			>
				<div className="flex items-center justify-between mb-6">
					<h2 className="text-xl font-bold">Review Your Day</h2>
					<button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
						<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>

				<div className="mb-6">
					<h3 className="font-medium mb-3">How are you feeling?</h3>
					<div className="grid grid-cols-4 gap-2">
						{MOODS.map((mood, index) => (
							<button
								key={mood.label}
								onClick={() => setSelectedMood(index)}
								className={cn(
									'flex flex-col items-center p-3 rounded-xl transition-all',
									selectedMood === index ? 'ring-2 ring-primary bg-muted' : 'hover:bg-muted'
								)}
							>
								<span className="text-3xl mb-1">{mood.emoji}</span>
								<span className="text-xs text-muted-foreground">{mood.label}</span>
							</button>
						))}
					</div>
				</div>

				<div className="mb-6">
					<h3 className="font-medium mb-3">Today's Summary</h3>
					<div className="space-y-2">
						<div className="flex items-center justify-between p-3 rounded-xl bg-success/10">
							<span className="text-success">Completed</span>
							<span className="font-bold">{completedTasks.length}</span>
						</div>
						<div className="flex items-center justify-between p-3 rounded-xl bg-warning/10">
							<span className="text-warning">Pending</span>
							<span className="font-bold">{pendingTasks.length}</span>
						</div>
					</div>
				</div>

				{pendingTasks.length > 0 && (
					<div className="mb-6">
						<h3 className="font-medium mb-3">Move unfinished tasks?</h3>
						<div className="space-y-2 max-h-40 overflow-y-auto">
							{pendingTasks.map((task) => (
								<label
									key={task.id}
									className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 cursor-pointer"
								>
									<input type="checkbox" className="rounded" defaultChecked />
									<span>{task.title}</span>
								</label>
							))}
						</div>
					</div>
				)}

				<button className="w-full py-3 rounded-xl bg-primary text-white font-medium">
					Save & Finish Day
				</button>
			</m.div>
		</m.div>
	);
}
