'use client';

import {
	CheckmarkCircle02Icon as CheckCircleIcon,
	Add01Icon as PlusIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { AnimatePresence, motion as m } from 'motion/react';
import { TaskChecklist } from '@/components/Timer/TaskChecklist';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { StudyTask } from '@/types/schedule';

interface TasksPanelProps {
	tasks: StudyTask[];
	activeTaskId: string | null;
	newTaskTitle: string;
	setNewTaskTitle: (value: string) => void;
	handleAddTask: (e: React.FormEvent) => void;
	setActiveTask: (id: string) => void;
}

export function TasksPanel({
	tasks,
	activeTaskId,
	newTaskTitle,
	setNewTaskTitle,
	handleAddTask,
	setActiveTask,
}: TasksPanelProps) {
	return (
		<div className="lg:col-span-5 space-y-6">
			<div className="bg-card border border-border/50 p-8 rounded-[3rem] shadow-sm">
				<h3 className="text-lg font-black  tracking-tight mb-6 flex items-center gap-3">
					<HugeiconsIcon icon={CheckCircleIcon} className="w-6 h-6 text-primary" />
					Tasks for today
				</h3>

				<form onSubmit={handleAddTask} className="flex gap-2 mb-8">
					<input
						type="text"
						value={newTaskTitle}
						onChange={(e) => setNewTaskTitle(e.target.value)}
						placeholder="What are you working on?"
						className="flex-1 bg-muted/50 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary/20 outline-none font-bold text-sm"
					/>
					<Button
						type="submit"
						size="icon"
						className="bg-primary text-primary-foreground p-4 rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-primary/20"
					>
						<HugeiconsIcon icon={PlusIcon} className="w-6 h-6" />
					</Button>
				</form>

				<div className="space-y-4">
					<AnimatePresence mode="popLayout">
						{tasks.length === 0 ? (
							<m.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								className="text-center py-12 text-muted-foreground font-bold  text-[10px] tracking-widest border-2 border-dashed border-border/50 rounded-[2rem]"
							>
								No tasks yet
							</m.div>
						) : (
							tasks.map((task) => (
								<m.div
									key={task.id}
									layout
									initial={{ opacity: 0, scale: 0.95 }}
									animate={{ opacity: 1, scale: 1 }}
									exit={{ opacity: 0, scale: 0.95 }}
									className={cn(
										'p-5 rounded-[2rem] border-2 transition-all cursor-pointer group',
										activeTaskId === task.id
											? 'border-primary bg-primary/5 shadow-tiimo'
											: 'border-transparent bg-muted/30 hover:bg-muted/50'
									)}
									onClick={() => setActiveTask(task.id)}
								>
									<div className="flex items-center justify-between mb-2">
										<span
											className={cn(
												'font-black text-sm  tracking-tight',
												task.completed && 'line-through text-muted-foreground'
											)}
										>
											{task.title}
										</span>
										{activeTaskId === task.id && (
											<div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary text-white text-[8px] font-black  tracking-widest">
												<div className="w-1 h-1 rounded-full bg-white animate-pulse" />
												Active
											</div>
										)}
									</div>

									{activeTaskId === task.id && (
										<div className="mt-4 pt-4 border-t border-primary/10">
											<TaskChecklist task={task} />
										</div>
									)}
								</m.div>
							))
						)}
					</AnimatePresence>
				</div>
			</div>
		</div>
	);
}
