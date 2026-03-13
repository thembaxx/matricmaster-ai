'use client';

import {
	ArrowLeft01Icon,
	BookOpen01Icon,
	CheckmarkCircle02Icon,
	PauseIcon,
	PlayIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { AnimatePresence, m } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { MarkdownRenderer } from '@/components/AI/MarkdownRenderer';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getLessonsBySubject, type Lesson } from '@/lib/lessons';

export default function FocusScreen() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const lessonId = searchParams.get('lessonId');
	const subjectId = searchParams.get('subject') || 'math';

	const lessons = useMemo(() => getLessonsBySubject(subjectId), [subjectId]);
	const lesson = useMemo(
		() => lessons.find((l: Lesson) => l.id === lessonId) || lessons[0],
		[lessons, lessonId]
	);

	const [timeRemaining, setTimeRemaining] = useState((lesson?.duration || 25) * 60);
	const [isPaused, setIsPaused] = useState(true);
	const [showComplete, setShowComplete] = useState(false);
	const [viewMode, setViewMode] = useState<'timer' | 'content'>('timer');

	const totalTime = (lesson?.duration || 25) * 60;
	const progress = ((totalTime - timeRemaining) / totalTime) * 100;

	useEffect(() => {
		if (isPaused || showComplete) return;

		const timer = setInterval(() => {
			setTimeRemaining((prev) => {
				if (prev <= 1) {
					setShowComplete(true);
					return 0;
				}
				return prev - 1;
			});
		}, 1000);

		return () => clearInterval(timer);
	}, [isPaused, showComplete]);

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	};

	if (!lesson)
		return (
			<div className="flex items-center justify-center h-screen uppercase font-black tracking-widest animate-pulse">
				Loading Lesson...
			</div>
		);

	return (
		<div className="min-h-screen bg-background flex flex-col items-center p-6 overflow-x-hidden">
			<header className="w-full max-w-4xl flex items-center justify-between mb-8 pt-6">
				<Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
					<HugeiconsIcon icon={ArrowLeft01Icon} className="w-6 h-6" />
				</Button>
				<div className="flex items-center gap-2 bg-muted/50 px-4 py-2 rounded-full border border-border/50">
					<div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
					<span className="text-[10px] font-black uppercase tracking-widest">
						Focusing: {lesson.topic}
					</span>
				</div>
				<Button
					variant="outline"
					size="sm"
					onClick={() => setViewMode(viewMode === 'timer' ? 'content' : 'timer')}
					className="rounded-full font-black uppercase text-[10px] gap-2 h-10 px-4"
				>
					<HugeiconsIcon icon={BookOpen01Icon} className="w-4 h-4" />
					{viewMode === 'timer' ? 'Show Lesson' : 'Show Timer'}
				</Button>
			</header>

			<AnimatePresence mode="wait">
				{!showComplete ? (
					viewMode === 'timer' ? (
						<m.div
							key="timer"
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.9 }}
							className="w-full max-w-md flex flex-col items-center justify-center grow"
						>
							<div className="text-center mb-12">
								<h1 className="text-3xl font-black text-foreground tracking-tighter uppercase mb-2">
									{lesson.title}
								</h1>
								<p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
									Deep Work Session
								</p>
							</div>

							<div className="relative w-72 h-72 mx-auto mb-12">
								<svg
									className="w-full h-full -rotate-90"
									viewBox="0 0 100 100"
									role="img"
									aria-label="Study timer"
								>
									<title>Study timer</title>
									<circle
										cx="50"
										cy="50"
										r="45"
										fill="none"
										stroke="var(--muted)"
										strokeWidth="4"
									/>
									<m.circle
										cx="50"
										cy="50"
										r="45"
										fill="none"
										stroke="var(--primary)"
										strokeWidth="4"
										strokeLinecap="round"
										strokeDasharray={`${2 * Math.PI * 45}`}
										initial={{ strokeDashoffset: `${2 * Math.PI * 45}` }}
										animate={{ strokeDashoffset: `${2 * Math.PI * 45 * (1 - progress / 100)}` }}
										transition={{ duration: 0.5 }}
									/>
								</svg>
								<div className="absolute inset-0 flex flex-col items-center justify-center">
									<span className="text-6xl font-black font-mono tracking-tighter text-foreground">
										{formatTime(timeRemaining)}
									</span>
								</div>
							</div>

							<div className="flex items-center gap-4">
								<Button
									size="lg"
									variant={isPaused ? 'default' : 'outline'}
									onClick={() => setIsPaused(!isPaused)}
									className="rounded-full px-10 h-16 text-xs font-black uppercase tracking-widest gap-2 shadow-2xl shadow-primary/20"
								>
									<HugeiconsIcon icon={isPaused ? PlayIcon : PauseIcon} className="w-5 h-5" />
									{isPaused ? 'Start Session' : 'Pause'}
								</Button>
							</div>
						</m.div>
					) : (
						<m.div
							key="content"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: 20 }}
							className="w-full max-w-2xl bg-card border border-border/50 rounded-[3rem] shadow-tiimo overflow-hidden"
						>
							<ScrollArea className="h-[60vh] p-8 sm:p-12">
								<MarkdownRenderer content={lesson.content} />
							</ScrollArea>
							<div className="p-8 bg-muted/30 border-t border-border/50 flex justify-center">
								<Button
									onClick={() => setViewMode('timer')}
									className="rounded-full font-black uppercase text-xs px-8 h-12"
								>
									Back to Timer
								</Button>
							</div>
						</m.div>
					)
				) : (
					<m.div
						key="complete"
						initial={{ opacity: 0, scale: 0.8 }}
						animate={{ opacity: 1, scale: 1 }}
						className="text-center"
					>
						<div className="w-24 h-24 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-8 text-success shadow-success/20 shadow-2xl">
							<HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-12 h-12" />
						</div>
						<h2 className="text-4xl font-black tracking-tighter uppercase mb-2">
							Session Complete!
						</h2>
						<p className="text-muted-foreground font-bold uppercase text-xs tracking-widest mb-12">
							You've mastered {lesson.title}
						</p>
						<Button
							size="lg"
							onClick={() => router.push('/dashboard')}
							className="rounded-full px-10 h-14 font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20"
						>
							Continue Journey
						</Button>
					</m.div>
				)}
			</AnimatePresence>
		</div>
	);
}
