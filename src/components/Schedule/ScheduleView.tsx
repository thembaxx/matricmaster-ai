'use client';

import { motion as m } from 'motion/react';
import { TaskBlock } from '@/components/Schedule/TaskBlock';
import { ViewToggle } from '@/components/Schedule/ViewToggle';
import { ProgressRing } from '@/components/Timer/ProgressRing';
import { TaskChecklist } from '@/components/Timer/TaskChecklist';
import { TimerControls } from '@/components/Timer/TimerControls';
import { Card } from '@/components/ui/card';
import { useSchedule } from '@/stores/useScheduleStore';
import { SUBJECTS } from '@/types/schedule';

export function ScheduleView() {
	const {
		tasks,
		currentTask,
		view,
		timeRemaining,
		setView,
		completeTask,
		removeTask,
		setCurrentTask,
	} = useSchedule();

	const pendingTasks = tasks.filter((t) => !t.completed);
	const completedTasks = tasks.filter((t) => t.completed);
	const subject = currentTask ? SUBJECTS[currentTask.subject] : null;

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	};

	return (
		<div className="min-h-screen bg-gradient-to-b from-background to-background/80 pb-40">
			<div className="p-4 pt-8">
				<header className="mb-6">
					<h1 className="text-2xl font-bold text-foreground mb-2">Today's Schedule</h1>
					<p className="text-muted-foreground">{pendingTasks.length} tasks remaining</p>
				</header>

				<ViewToggle view={view} onChange={setView} />

				{view === 'active' ? (
					<m.div
						key="active-view"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="mt-6"
					>
						{currentTask ? (
							<Card className="p-6 shadow-lg border-border/50">
								<div className="text-center mb-8">
									{subject && (
										<div
											className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${subject.bgColor}/20 ${subject.color} mb-4`}
										>
											<span className="text-2xl">{subject.emoji}</span>
											<span className="font-medium">{subject.name}</span>
										</div>
									)}
									<h2 className="text-xl font-semibold text-foreground mb-2">
										{currentTask.title}
									</h2>
									<p className="text-muted-foreground">{currentTask.duration} minutes</p>
								</div>

								<div className="flex justify-center mb-8">
									<ProgressRing
										progress={
											((currentTask.duration * 60 - timeRemaining) / (currentTask.duration * 60)) *
											100
										}
										size={200}
										strokeWidth={12}
									>
										<div className="text-center">
											<span className="text-4xl font-bold text-foreground">
												{formatTime(timeRemaining)}
											</span>
											<p className="text-sm text-muted-foreground mt-1">remaining</p>
										</div>
									</ProgressRing>
								</div>

								<TimerControls />

								{currentTask.steps.length > 0 && (
									<div className="mt-8">
										<h3 className="text-sm font-medium text-muted-foreground mb-4">Steps</h3>
										<TaskChecklist task={currentTask} />
									</div>
								)}
							</Card>
						) : (
							<div className="text-center py-12">
								<div className="text-6xl mb-4">🎉</div>
								<h2 className="text-xl font-semibold text-foreground mb-2">All done for today!</h2>
								<p className="text-muted-foreground">Great work! Come back tomorrow for more.</p>
							</div>
						)}

						{pendingTasks.length > 1 && (
							<div className="mt-8">
								<h3 className="text-sm font-medium text-muted-foreground mb-4">Up Next</h3>
								<div className="flex flex-col gap-3">
									{pendingTasks.slice(1, 4).map((task) => (
										<TaskBlock
											key={task.id}
											task={task}
											isActive={false}
											onClick={() => setCurrentTask(task)}
											onComplete={() => completeTask(task.id)}
											onRemove={() => removeTask(task.id)}
										/>
									))}
								</div>
							</div>
						)}
					</m.div>
				) : (
					<m.div
						key="timeline-view"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="mt-6"
					>
						<div className="flex flex-col gap-3">
							{pendingTasks.length > 0 ? (
								pendingTasks.map((task) => (
									<TaskBlock
										key={task.id}
										task={task}
										isActive={currentTask?.id === task.id}
										onClick={() => setCurrentTask(task)}
										onComplete={() => completeTask(task.id)}
										onRemove={() => removeTask(task.id)}
										showTime
									/>
								))
							) : (
								<div className="text-center py-12">
									<div className="text-6xl mb-4">🎉</div>
									<h2 className="text-xl font-semibold text-foreground">No tasks scheduled</h2>
								</div>
							)}
						</div>

						{completedTasks.length > 0 && (
							<div className="mt-8">
								<h3 className="text-sm font-medium text-muted-foreground mb-4">
									Completed ({completedTasks.length})
								</h3>
								<div className="space-y-3 opacity-60">
									{completedTasks.map((task) => (
										<TaskBlock key={task.id} task={task} isActive={false} completed />
									))}
								</div>
							</div>
						)}
					</m.div>
				)}
			</div>
		</div>
	);
}
