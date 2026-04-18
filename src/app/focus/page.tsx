'use client';

import {
	ArrowLeft01Icon,
	BookOpen01Icon,
	Chat01Icon,
	Clock01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { AnimatePresence, motion as m } from 'motion/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState, ViewTransition } from 'react';
import { toast } from 'sonner';
import { MarkdownRenderer } from '@/components/AI/MarkdownRenderer';
import { Comments } from '@/components/Comments/Comments';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFocusMode, useFocusModeAuto } from '@/hooks/useFocusMode';
import { DURATION, EASING } from '@/lib/animation-presets';
import { getLessonsBySubject, type Lesson } from '@/lib/lessons';
import { useSchedule } from '@/stores/useScheduleStore';
import type { StudyTask, SubjectId } from '@/types/schedule';
import { TasksPanel } from './TasksPanel';
import { TimerPanel } from './TimerPanel';

function FocusPageContent() {
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
		startTimer,
		setCurrentTask,
	} = useSchedule();

	const { enableAuto, autoEnabled } = useFocusMode();

	// Auto-activation: prompt user when a scheduled study session is coming up
	useFocusModeAuto((session) => {
		toast(
			<div className="flex flex-col gap-2">
				<div className="font-semibold">Scheduled session starting soon</div>
				<div className="text-sm text-muted-foreground">
					<strong>{session.title}</strong> starts in 5 minutes. Enter Focus Mode?
				</div>
				<div className="flex gap-2 mt-1">
					<button
						type="button"
						onClick={() => {
							enableAuto();
							if (!isTimerRunning && timeRemaining > 0) {
								startTimer();
							}
							toast.dismiss();
						}}
						className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90"
					>
						Enter Focus
					</button>
					<button
						type="button"
						onClick={() => toast.dismiss()}
						className="px-3 py-1.5 text-sm bg-muted text-muted-foreground rounded-lg font-medium hover:bg-muted/80"
					>
						Skip
					</button>
				</div>
			</div>,
			{ duration: 15000, id: 'upcoming-session-toast' }
		);
	});

	// Auto-start timer when auto-mode is enabled and there's time remaining
	useEffect(() => {
		if (autoEnabled && !isTimerRunning && timeRemaining > 0) {
			startTimer();
		}
	}, [autoEnabled, isTimerRunning, timeRemaining, startTimer]);

	const [newTaskTitle, setNewTaskTitle] = useState('');
	const [isClient, setIsClient] = useState(false);
	const [activeTab, setActiveTab] = useState<'timer' | 'lesson' | 'discussion'>('timer');

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
						<h1 className="text-3xl font-black tracking-tight text-foreground ">
							{lesson ? lesson.title : 'Focus Mode'}
						</h1>
						<p className="text-muted-foreground font-bold  tracking-widest text-[10px]">
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
							className="rounded-full px-6 data-[state=active]:bg-background data-[state=active]:shadow-tiimo font-black  text-[10px] tracking-widest"
						>
							<HugeiconsIcon icon={Clock01Icon} className="w-4 h-4 mr-2" />
							Timer
						</TabsTrigger>
						{lesson && (
							<TabsTrigger
								value="lesson"
								className="rounded-full px-6 data-[state=active]:bg-background data-[state=active]:shadow-tiimo font-black  text-[10px] tracking-widest"
							>
								<HugeiconsIcon icon={BookOpen01Icon} className="w-4 h-4 mr-2" />
								Lesson
							</TabsTrigger>
						)}
						<TabsTrigger
							value="discussion"
							className="rounded-full px-6 data-[state=active]:bg-background data-[state=active]:shadow-tiimo font-black  text-[10px] tracking-widest"
						>
							<HugeiconsIcon icon={Chat01Icon} className="w-4 h-4 mr-2" />
							Chat
						</TabsTrigger>
					</TabsList>
				</Tabs>
			</header>

			<AnimatePresence mode="wait" initial={false}>
				<m.div
					key={activeTab}
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -10 }}
					transition={{ duration: DURATION.quick, ease: EASING.easeOut }}
				>
					{activeTab === 'timer' && (
						<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
							<TimerPanel
								mode={mode}
								setMode={setMode}
								timeRemaining={timeRemaining}
								progress={progress}
								isTimerRunning={isTimerRunning}
								formatTime={formatTime}
							/>
							<TasksPanel
								tasks={tasks}
								activeTaskId={activeTaskId}
								newTaskTitle={newTaskTitle}
								setNewTaskTitle={setNewTaskTitle}
								handleAddTask={handleAddTask}
								setActiveTask={setActiveTask}
							/>
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
								<p className="text-[10px] font-black  tracking-[0.2em] text-muted-foreground">
									Keep going, you're doing great!
								</p>
								<Button
									onClick={() => setActiveTab('timer')}
									className="rounded-full font-black  text-[10px] px-8 h-12 tracking-widest shadow-xl shadow-primary/10"
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

function FocusPageSkeleton() {
	return (
		<div className="min-h-screen p-4 md:p-8 space-y-8 max-w-6xl mx-auto pb-32">
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-pulse">
				<div className="h-20 w-48 bg-muted rounded" />
				<div className="h-12 w-64 bg-muted rounded-full" />
			</div>
			<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
				<div className="lg:col-span-8 h-96 bg-muted rounded-lg" />
				<div className="lg:col-span-4 h-64 bg-muted rounded-lg" />
			</div>
		</div>
	);
}

export default function FocusPage() {
	return (
		<ViewTransition default="none" enter="vt-blur-reveal">
			<Suspense fallback={<FocusPageSkeleton />}>
				<FocusPageContent />
			</Suspense>
		</ViewTransition>
	);
}
