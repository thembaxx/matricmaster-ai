'use client';

import { createContext, type ReactNode, useCallback, useContext, useState } from 'react';
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
			{ id: 's2', title: 'Solve practice problems', completed: false },
			{ id: 's3', title: 'Review solutions', completed: false },
		],
	},
	{
		id: '3',
		title: 'Essay writing practice',
		subject: 'english',
		duration: 60,
		completed: false,
		steps: [
			{ id: 's1', title: 'Choose essay topic', completed: false },
			{ id: 's2', title: 'Outline essay structure', completed: false },
			{ id: 's3', title: 'Write first draft', completed: false },
			{ id: 's4', title: 'Edit and revise', completed: false },
		],
	},
];

export function ScheduleProvider({ children }: { children: ReactNode }) {
	const [tasks, setTasks] = useState<StudyTask[]>(DEMO_TASKS);
	const [currentTask, setCurrentTaskState] = useState<StudyTask | null>(DEMO_TASKS[0]);
	const [view, setView] = useState<ScheduleView>('active');
	const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
	const [timeRemaining, setTimeRemaining] = useState<number>(0);

	const addTask = useCallback((task: StudyTask) => {
		setTasks((prev) => [...prev, { ...task, id: generateId() }]);
	}, []);

	const removeTask = useCallback((id: string) => {
		setTasks((prev) => prev.filter((task) => task.id !== id));
	}, []);

	const updateTask = useCallback((id: string, updates: Partial<StudyTask>) => {
		setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, ...updates } : task)));
	}, []);

	const completeTask = useCallback((id: string) => {
		setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, completed: true } : task)));
	}, []);

	const setCurrentTask = useCallback((task: StudyTask | null) => {
		setCurrentTaskState(task);
	}, []);

	const startTimer = useCallback(() => {
		setIsTimerRunning(true);
	}, []);

	const pauseTimer = useCallback(() => {
		setIsTimerRunning(false);
	}, []);

	const resetTimer = useCallback(() => {
		setIsTimerRunning(false);
		setTimeRemaining(0);
	}, []);

	const addTime = useCallback((seconds: number) => {
		setTimeRemaining((prev) => prev + seconds);
	}, []);

	const toggleStep = useCallback((taskId: string, stepId: string) => {
		setTasks((prev) =>
			prev.map((task) => {
				if (task.id === taskId) {
					return {
						...task,
						steps: task.steps.map((step) =>
							step.id === stepId ? { ...step, completed: !step.completed } : step
						),
					};
				}
				return task;
			})
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
			}}
		>
			{children}
		</ScheduleContext.Provider>
	);
}

export function useSchedule() {
	const context = useContext(ScheduleContext);
	if (!context) {
		throw new Error('useSchedule must be used within a ScheduleProvider');
	}
	return context;
}
