'use client';

import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import type { ScheduleView, StudyTask } from '@/types/schedule';

interface ScheduleContextType {
	tasks: StudyTask[];
	currentTask: StudyTask | null;
	view: ScheduleView;
	isTimerRunning: boolean;
	timeRemaining: number;
	addTask: (task: StudyTask) => void;
	removeTask: (id: string) => void;
	updateTask: (id: string, updates: Partial<StudyTask>) => void;
	completeTask: (id: string) => void;
	setCurrentTask: (task: StudyTask | null) => void;
	setView: (view: ScheduleView) => void;
	startTimer: () => void;
	pauseTimer: () => void;
	resetTimer: () => void;
	addTime: (seconds: number) => void;
	toggleStep: (taskId: string, stepId: string) => void;
	reorderTasks: (tasks: StudyTask[]) => void;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

const generateId = () => Math.random().toString(36).substring(2, 9);

const DEMO_TASKS: StudyTask[] = [
	{
		id: '1',
		title: 'Calculus derivatives practice',
		subject: 'mathematics',
		duration: 45,
		completed: false,
		steps: [
			{ id: 's1', title: 'Review differentiation rules', completed: true },
			{ id: 's2', title: 'Complete practice problems 1-10', completed: false },
			{ id: 's3', title: 'Check answers', completed: false },
		],
	},
	{
		id: '2',
		title: 'Circuit analysis',
		subject: 'physics',
		duration: 30,
		completed: false,
		steps: [
			{ id: 's1', title: 'Read chapter on circuits', completed: false },
			{ id: 's2', title: 'Solve 5 circuit problems', completed: false },
		],
	},
	{
		id: '3',
		title: 'Essay outline',
		subject: 'english',
		duration: 25,
		completed: true,
		steps: [
			{ id: 's1', title: 'Choose essay topic', completed: true },
			{ id: 's2', title: 'Create thesis statement', completed: true },
			{ id: 's3', title: 'Outline main points', completed: true },
		],
	},
	{
		id: '4',
		title: 'Cell structures review',
		subject: 'life-sciences',
		duration: 40,
		completed: false,
		steps: [
			{ id: 's1', title: 'Review mitochondria', completed: false },
			{ id: 's2', title: 'Review chloroplasts', completed: false },
		],
	},
];

export function ScheduleProvider({ children }: { children: ReactNode }) {
	const [tasks, setTasks] = useState<StudyTask[]>(DEMO_TASKS);
	const [currentTask, setCurrentTask] = useState<StudyTask | null>(DEMO_TASKS[0]);
	const [view, setView] = useState<ScheduleView>('active');
	const [isTimerRunning, setIsTimerRunning] = useState(false);
	const [timeRemaining, setTimeRemaining] = useState(45 * 60);

	useEffect(() => {
		if (isTimerRunning && timeRemaining > 0) {
			const interval = setInterval(() => {
				setTimeRemaining((prev) => Math.max(0, prev - 1));
			}, 1000);
			return () => clearInterval(interval);
		}
		if (timeRemaining === 0) {
			setIsTimerRunning(false);
		}
	}, [isTimerRunning, timeRemaining]);

	const addTask = useCallback((task: StudyTask) => {
		setTasks((prev) => [...prev, { ...task, id: generateId() }]);
	}, []);

	const removeTask = useCallback(
		(id: string) => {
			setTasks((prev) => prev.filter((t) => t.id !== id));
			if (currentTask?.id === id) {
				setCurrentTask(null);
			}
		},
		[currentTask]
	);

	const updateTask = useCallback((id: string, updates: Partial<StudyTask>) => {
		setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
	}, []);

	const completeTask = useCallback(
		(id: string) => {
			updateTask(id, { completed: true });
			const remaining = tasks.filter((t) => !t.completed && t.id !== id);
			if (remaining.length > 0) {
				setCurrentTask(remaining[0]);
				setTimeRemaining(remaining[0].duration * 60);
			} else {
				setCurrentTask(null);
			}
		},
		[tasks, updateTask]
	);

	const startTimer = useCallback(() => {
		if (currentTask && timeRemaining === 0) {
			setTimeRemaining(currentTask.duration * 60);
		}
		setIsTimerRunning(true);
	}, [currentTask, timeRemaining]);

	const pauseTimer = useCallback(() => {
		setIsTimerRunning(false);
	}, []);

	const resetTimer = useCallback(() => {
		setIsTimerRunning(false);
		if (currentTask) {
			setTimeRemaining(currentTask.duration * 60);
		}
	}, [currentTask]);

	const addTime = useCallback((seconds: number) => {
		setTimeRemaining((prev) => Math.max(0, prev + seconds));
	}, []);

	const toggleStep = useCallback((taskId: string, stepId: string) => {
		setTasks((prev) =>
			prev.map((task) =>
				task.id === taskId
					? {
							...task,
							steps: task.steps.map((step) =>
								step.id === stepId ? { ...step, completed: !step.completed } : step
							),
						}
					: task
			)
		);
	}, []);

	const reorderTasks = useCallback((newTasks: StudyTask[]) => {
		setTasks(newTasks);
	}, []);

	return (
		<ScheduleContext.Provider
			value={{
				tasks,
				currentTask,
				view,
				isTimerRunning,
				timeRemaining,
				addTask,
				removeTask,
				updateTask,
				completeTask,
				setCurrentTask,
				setView,
				startTimer,
				pauseTimer,
				resetTimer,
				addTime,
				toggleStep,
				reorderTasks,
			}
}
>
{
	children;
}
</ScheduleContext.Provider>
)
}

export function useSchedule() {
	const context = useContext(ScheduleContext);
	if (!context) {
		throw new Error('useSchedule must be used within a ScheduleProvider');
	}
	return context;
}
