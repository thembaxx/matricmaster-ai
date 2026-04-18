'use client';

import { ArrowLeft01Icon, BookOpen01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { getLessonsBySubject, type Lesson } from '@/lib/lessons';
import { CompleteView } from './Focus/CompleteView';
import { ContentView } from './Focus/ContentView';
import { TimerView } from './Focus/TimerView';

function FocusScreenContent() {
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
	const [viewMode, setViewMode] = useState<'timer' | 'content'>('timer');

	const totalTime = (lesson?.duration || 25) * 60;
	const progress = ((totalTime - timeRemaining) / totalTime) * 100;
	const showComplete = timeRemaining === 0 && !isPaused;

	useEffect(() => {
		if (isPaused) return;

		const timer = setInterval(() => {
			setTimeRemaining((prev) => {
				if (prev <= 1) {
					return 0;
				}
				return prev - 1;
			});
		}, 1000);

		return () => clearInterval(timer);
	}, [isPaused]);

	if (!lesson)
		return (
			<div className="flex items-center justify-center h-screen font-black tracking-widest animate-pulse">
				loading lesson...
			</div>
		);

	return (
		<div className="min-h-screen bg-background flex flex-col items-center p-6 overflow-x-hidden">
			<header className="w-full max-w-4xl flex items-center justify-between mb-8 pt-6">
				<Button
					variant="ghost"
					size="icon"
					onClick={() => router.back()}
					className="rounded-full"
					aria-label="Go back"
				>
					<HugeiconsIcon icon={ArrowLeft01Icon} className="w-6 h-6" />
				</Button>
				<div className="flex items-center gap-2 bg-muted/50 px-4 py-2 rounded-full border border-border/50">
					<div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
					<span className="text-[10px] font-black tracking-widest">
						focusing: {lesson.topic.toLowerCase()}
					</span>
				</div>
				<Button
					variant="outline"
					size="sm"
					onClick={() => setViewMode(viewMode === 'timer' ? 'content' : 'timer')}
					className="rounded-full font-black text-[10px] gap-2 h-10 px-4"
				>
					<HugeiconsIcon icon={BookOpen01Icon} className="w-4 h-4" />
					{viewMode === 'timer' ? 'show lesson' : 'show timer'}
				</Button>
			</header>

			<AnimatePresence mode="wait" initial={false}>
				{!showComplete ? (
					viewMode === 'timer' ? (
						<TimerView
							title={lesson.title}
							timeRemaining={timeRemaining}
							progress={progress}
							isPaused={isPaused}
							onTogglePause={() => setIsPaused(!isPaused)}
						/>
					) : (
						<ContentView content={lesson.content} onBackToTimer={() => setViewMode('timer')} />
					)
				) : (
					<CompleteView title={lesson.title} onContinue={() => router.push('/dashboard')} />
				)}
			</AnimatePresence>
		</div>
	);
}

function FocusScreenSkeleton() {
	return (
		<div className="min-h-screen bg-background flex flex-col items-center p-6">
			<div className="w-full max-w-4xl space-y-6 animate-pulse">
				<div className="h-16 bg-muted rounded" />
				<div className="h-64 bg-muted rounded-full" />
			</div>
		</div>
	);
}

export default function FocusScreen() {
	return (
		<Suspense fallback={<FocusScreenSkeleton />}>
			<FocusScreenContent />
		</Suspense>
	);
}
