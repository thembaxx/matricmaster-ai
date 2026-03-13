'use client';

import {
	ArrowLeft01Icon,
	BookOpen01Icon,
	Chat01Icon,
	CheckmarkCircle02Icon as CheckCircleIcon,
	Clock01Icon,
	Add01Icon as PlusIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { AnimatePresence, m } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { MarkdownRenderer } from '@/components/AI/MarkdownRenderer';
import { Comments } from '@/components/Comments/Comments';
import { ProgressRing } from '@/components/Timer/ProgressRing';
import { TaskChecklist } from '@/components/Timer/TaskChecklist';
import { TimerControls } from '@/components/Timer/TimerControls';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getLessonsBySubject, type Lesson } from '@/lib/lessons';
import { cn } from '@/lib/utils';
import { useSchedule } from '@/stores/useScheduleStore';
import type { StudyTask, SubjectId } from '@/types/schedule';

export default function FocusPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const lessonId = searchParams.get('lessonId');
	const subjectId = searchParams.get('subject') || 'mathematics';

	const {
		timeRemaining,
		totalTime,
		mode,
		setMode,
		tasks,
		addTask,
		activeTaskId,
		setActiveTask,
		isTimerRunning,
		pauseTimer,
		setCurrentTask,
	} = useSchedule();

	const [newTaskTitle, setNewTaskTitle] = useState('');
	const [isClient, setIsClient] = useState(false);
	const [activeTab, setActiveTab] = useState<'timer' | 'lesson' | 'discussion'>('timer');

	// Load lesson if present
	const lessons = useMemo(() => getLessonsBySubject(subjectId), [subjectId]);
	const lesson = useMemo(() => lessons.find((l: Lesson) => l.id === lessonId), [lessons, lessonId]);

	useEffect(() => {
		setIsClient(true);
		if (lesson) {
			setCurrentTask({
				id: lesson.id,
				title: lesson.title,
				subject: subjectId as SubjectId,
				duration: lesson.duration,
				completed: lesson.completed || false,
				steps: [],
			});
		}
	}, [lesson, setCurrentTask, subjectId]);

	// Simple timer effect
	useEffect(() => {
		let interval: NodeJS.Timeout;
		if (isTimerRunning && timeRemaining > 0) {
			interval = setInterval(() => {
				useSchedule.setState((state) => ({ timeRemaining: state.timeRemaining - 1 }));
			}, 1000);
		} else if (timeRemaining === 0) {
			pauseTimer();
		}
		return () => clearInterval(interval);
	}, [isTimerRunning, timeRemaining, pauseTimer]);

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	};

	const progress = ((totalTime - timeRemaining) / totalTime) * 100;

	const handleAddTask = (e: React.FormEvent) => {
		e.preventDefault();
		if (!newTaskTitle.trim()) return;

		const newTask: StudyTask = {
			id: crypto.randomUUID(),
			title: newTaskTitle,
			subject: 'mathematics',
			duration: 25,
			completed: false,
			steps: [],
		};

		addTask(newTask);
		setNewTaskTitle('');
	};

	if (!isClient) return null;

	return (
		<div className="min-h-screen p-4 md:p-8 space-y-8 max-w-6xl mx-auto pb-32">
			<header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
				<div className="flex items-center gap-4">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => router.back()}
						className="rounded-full"
					>
						<HugeiconsIcon icon={ArrowLeft01Icon} className="w-6 h-6" />
					</Button>
					<div>
						<h1 className="text-3xl font-black tracking-tight text-foreground uppercase">
							{lesson ? lesson.title : 'Focus Mode'}
						</h1>
						<p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">
							{lesson ? `${lesson.topic} • ${lesson.duration} MINS` : 'Crush your study goals'}
						</p>
					</div>
				</div>

				<Tabs
					value={activeTab}
					onValueChange={(v) => setActiveTab(v as 'timer' | 'lesson' | 'discussion')}
					className="w-auto"
				>
					<TabsList className="bg-muted/50 p-1 rounded-full h-12 border border-border/50">
						<TabsTrigger
							value="timer"
							className="rounded-full px-6 data-[state=active]:bg-background data-[state=active]:shadow-tiimo font-black uppercase text-[10px] tracking-widest"
						>
							<HugeiconsIcon icon={Clock01Icon} className="w-4 h-4 mr-2" />
							Timer
						</TabsTrigger>
						{lesson && (
							<TabsTrigger
								value="lesson"
								className="rounded-full px-6 data-[state=active]:bg-background data-[state=active]:shadow-tiimo font-black uppercase text-[10px] tracking-widest"
							>
								<HugeiconsIcon icon={BookOpen01Icon} className="w-4 h-4 mr-2" />
								Lesson
							</TabsTrigger>
						)}
						<TabsTrigger
							value="discussion"
							className="rounded-full px-6 data-[state=active]:bg-background data-[state=active]:shadow-tiimo font-black uppercase text-[10px] tracking-widest"
						>
							<HugeiconsIcon icon={Chat01Icon} className="w-4 h-4 mr-2" />
							Chat
						</TabsTrigger>
					</TabsList>
				</Tabs>
			</header>

			<AnimatePresence mode="wait">
				<m.div
					key={activeTab}
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -10 }}
					transition={{ duration: 0.2 }}
				>
					{activeTab === 'timer' && (
						<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
							{/* Timer Section */}
							<div className="lg:col-span-7 flex flex-col items-center space-y-8 bg-card border border-border/50 p-8 md:p-12 rounded-[3rem] shadow-tiimo relative overflow-hidden min-h-[500px] justify-center">
								<div
									className={cn(
										'absolute inset-0 opacity-5 pointer-events-none transition-colors duration-500',
										mode === 'focus' ? 'bg-primary' : 'bg-success'
									)}
								/>

								<div className="flex items-center gap-2 bg-muted/50 p-1 rounded-full relative z-10">
									{(['focus', 'short-break', 'long-break'] as const).map((m) => (
										<button
											type="button"
											key={m}
											onClick={() => setMode(m)}
											className={cn(
												'px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all',
												mode === m
													? 'bg-background shadow-tiimo text-foreground'
													: 'text-muted-foreground hover:text-foreground'
											)}
										>
											{m.replace('-', ' ')}
										</button>
									))}
								</div>

								<ProgressRing
									progress={progress}
									size={320}
									strokeWidth={16}
									className={cn(mode === 'focus' ? 'text-primary' : 'text-success')}
								>
									<div className="text-center space-y-2">
										<div className="text-7xl font-black tracking-tighter tabular-nums">
											{formatTime(timeRemaining)}
										</div>
										<div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
											{isTimerRunning ? 'Session Active' : 'Paused'}
										</div>
									</div>
								</ProgressRing>

								<TimerControls />
							</div>

							{/* Tasks Section */}
							<div className="lg:col-span-5 space-y-6">
								<div className="bg-card border border-border/50 p-8 rounded-[3rem] shadow-sm">
									<h3 className="text-lg font-black uppercase tracking-tight mb-6 flex items-center gap-3">
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
										<button
											type="submit"
											className="bg-primary text-primary-foreground p-4 rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-primary/20"
										>
											<HugeiconsIcon icon={PlusIcon} className="w-6 h-6" />
										</button>
									</form>

									<div className="space-y-4">
										<AnimatePresence mode="popLayout">
											{tasks.length === 0 ? (
												<m.div
													initial={{ opacity: 0 }}
													animate={{ opacity: 1 }}
													className="text-center py-12 text-muted-foreground font-bold uppercase text-[10px] tracking-widest border-2 border-dashed border-border/50 rounded-[2rem]"
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
																	'font-black text-sm uppercase tracking-tight',
																	task.completed && 'line-through text-muted-foreground'
																)}
															>
																{task.title}
															</span>
															{activeTaskId === task.id && (
																<div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary text-white text-[8px] font-black uppercase tracking-widest">
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
						</div>
					)}

					{activeTab === 'lesson' && lesson && (
						<m.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							className="bg-card border border-border/50 rounded-[3rem] shadow-tiimo overflow-hidden"
						>
							<ScrollArea className="h-[70vh] p-8 md:p-16">
								<MarkdownRenderer content={lesson.content} />
							</ScrollArea>
							<div className="p-8 bg-muted/30 border-t border-border/50 flex justify-between items-center">
								<p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
									Keep going, you're doing great!
								</p>
								<Button
									onClick={() => setActiveTab('timer')}
									className="rounded-full font-black uppercase text-[10px] px-8 h-12 tracking-widest shadow-xl shadow-primary/10"
								>
									Back to Timer
								</Button>
							</div>
						</m.div>
					)}

					{activeTab === 'discussion' && (
						<Comments
							resourceType="lesson"
							resourceId={lessonId || 'general'}
							title={lesson ? `${lesson.title} Discussion` : 'Global Discussion'}
						/>
					)}
				</m.div>
			</AnimatePresence>
		</div>
	);
}
