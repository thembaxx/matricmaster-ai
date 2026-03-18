import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type CachedTask, cacheTasks } from '@/lib/offline/task-cache';
import type { StudyTask } from '@/types/schedule';

interface ScheduleState {
	timeRemaining: number;
	totalTime: number;
	isTimerRunning: boolean;
	mode: 'focus' | 'short-break' | 'long-break';
	tasks: StudyTask[];
	activeTaskId: string | null;
	currentTask: StudyTask | null;
	view: 'active' | 'timeline';

	startTimer: () => void;
	pauseTimer: () => void;
	resetTimer: () => void;
	addTime: (seconds: number) => void;
	setMode: (mode: 'focus' | 'short-break' | 'long-break') => void;
	setTime: (seconds: number) => void;

	addTask: (task: StudyTask) => void;
	removeTask: (taskId: string) => void;
	toggleStep: (taskId: string, stepId: string) => void;
	completeTask: (taskId: string) => void;
	setActiveTask: (taskId: string | null) => void;
	setCurrentTask: (task: StudyTask | null) => void;
	setView: (view: 'active' | 'timeline') => void;
}

const DEFAULT_TIMES = {
	focus: 25 * 60,
	'short-break': 5 * 60,
	'long-break': 15 * 60,
};

export const useSchedule = create<ScheduleState>()(
	persist(
		(set, get) => ({
			timeRemaining: DEFAULT_TIMES.focus,
			totalTime: DEFAULT_TIMES.focus,
			isTimerRunning: false,
			mode: 'focus',
			tasks: [],
			activeTaskId: null,
			currentTask: null,
			view: 'active',

			startTimer: () => set({ isTimerRunning: true }),
			pauseTimer: () => set({ isTimerRunning: false }),

			resetTimer: () => {
				const { mode } = get();
				set({
					timeRemaining: DEFAULT_TIMES[mode],
					totalTime: DEFAULT_TIMES[mode],
					isTimerRunning: false,
				});
			},

			addTime: (seconds) =>
				set((state) => ({
					timeRemaining: Math.max(0, state.timeRemaining + seconds),
				})),

			setMode: (mode) =>
				set({
					mode,
					timeRemaining: DEFAULT_TIMES[mode],
					totalTime: DEFAULT_TIMES[mode],
					isTimerRunning: false,
				}),

			setTime: (seconds) =>
				set({
					timeRemaining: seconds,
					totalTime: seconds,
				}),

			addTask: (task) =>
				set((state) => ({
					tasks: [...state.tasks, task],
				})),

			removeTask: (taskId) =>
				set((state) => ({
					tasks: state.tasks.filter((t) => t.id !== taskId),
					activeTaskId: state.activeTaskId === taskId ? null : state.activeTaskId,
					currentTask: state.currentTask?.id === taskId ? null : state.currentTask,
				})),

			toggleStep: (taskId, stepId) =>
				set((state) => ({
					tasks: state.tasks.map((task) => {
						if (task.id !== taskId) return task;
						const updatedSteps = task.steps.map((step) =>
							step.id === stepId ? { ...step, completed: !step.completed } : step
						);
						const updatedTask = { ...task, steps: updatedSteps };
						return updatedTask;
					}),
					// Also update currentTask if it's the one being modified
					currentTask:
						state.currentTask?.id === taskId
							? {
									...state.currentTask,
									steps: state.currentTask.steps.map((step) =>
										step.id === stepId ? { ...step, completed: !step.completed } : step
									),
								}
							: state.currentTask,
				})),

			completeTask: async (taskId) => {
				const { tasks } = get();
				const completedTask = tasks.find((t) => t.id === taskId);

				set((state) => ({
					tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, completed: true } : t)),
					currentTask:
						state.currentTask?.id === taskId
							? { ...state.currentTask, completed: true }
							: state.currentTask,
				}));

				if (completedTask) {
					const upcomingTasks = tasks.filter((t) => !t.completed && t.id !== taskId).slice(0, 3);

					const tasksToCache: CachedTask[] = upcomingTasks.map((t) => ({
						id: t.id,
						title: t.title,
						description: t.notes || '',
						subject: t.subject,
						topic: '',
						type: 'lesson' as const,
						completed: false,
						cachedAt: Date.now(),
					}));

					if (tasksToCache.length > 0) {
						await cacheTasks(tasksToCache);
					}
				}
			},

			setActiveTask: (taskId) => {
				const task = get().tasks.find((t) => t.id === taskId) || null;
				set({ activeTaskId: taskId, currentTask: task });
			},

			setCurrentTask: (task) =>
				set({
					currentTask: task,
					activeTaskId: task?.id || null,
					timeRemaining: task ? task.duration * 60 : get().timeRemaining,
					totalTime: task ? task.duration * 60 : get().totalTime,
				}),

			setView: (view) => set({ view }),
		}),
		{
			name: 'schedule-storage',
		}
	)
);

export function ScheduleProvider({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}
