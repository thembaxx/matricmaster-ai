'use client';

import { AnimatePresence, m } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FocusHeroProps {
	subject: string;
	emoji: string;
	duration: number; // in minutes
	subtasks: {
		id: string;
		title: string;
		completed: boolean;
	}[];
}

const DEMO_FOCUS: FocusHeroProps = {
	subject: 'Calculus',
	emoji: '🧮',
	duration: 45,
	subtasks: [
		{ id: '1', title: 'Review notes', completed: true },
		{ id: '2', title: 'Practice problems', completed: false },
		{ id: '3', title: 'Check answers', completed: false },
	],
};

export default function FocusHero() {
	const router = useRouter();
	const [timeRemaining, setTimeRemaining] = useState(DEMO_FOCUS.duration * 60);
	const [isPaused, setIsPaused] = useState(false);
	const [subtasks, setSubtasks] = useState(DEMO_FOCUS.subtasks);
	const [showComplete, setShowComplete] = useState(false);

	const totalTime = DEMO_FOCUS.duration * 60;
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

	const toggleSubtask = (id: string) => {
		setSubtasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
	};

	const completedCount = subtasks.filter((t) => t.completed).length;

	return (
		<div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
			<AnimatePresence mode="wait">
				{!showComplete ? (
					<m.div
						key="focus"
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.9 }}
						className="w-full max-w-md"
					>
						{/* Header */}
						<div className="text-center mb-8">
							<m.div
								initial={{ y: -20 }}
								animate={{ y: 0 }}
								className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-subject-math-soft text-subject-math mb-4"
							>
								<span className="w-2 h-2 rounded-full bg-current animate-pulse" />
								<span className="text-sm font-semibold">Focus mode</span>
							</m.div>
							<h1 className="text-2xl font-display font-bold text-foreground">
								{DEMO_FOCUS.subject}
							</h1>
						</div>

						{/* Progress Ring with Emoji */}
						<div className="relative w-64 h-64 mx-auto mb-8">
							{/* SVG Ring */}
							<svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
								<circle cx="50" cy="50" r="45" fill="none" stroke="var(--border)" strokeWidth="6" />
								<m.circle
									cx="50"
									cy="50"
									r="45"
									fill="none"
									stroke="var(--primary)"
									strokeWidth="6"
									strokeLinecap="round"
									strokeDasharray={`${2 * Math.PI * 45}`}
									initial={{ strokeDashoffset: `${2 * Math.PI * 45}` }}
									animate={{
										strokeDashoffset: `${2 * Math.PI * 45 * (1 - progress / 100)}`,
									}}
									transition={{ duration: 0.5, ease: 'easeOut' }}
								/>
							</svg>

							{/* Center Content */}
							<div className="absolute inset-0 flex flex-col items-center justify-center">
								<m.div
									animate={isPaused ? {} : { rotate: 360 }}
									transition={
										isPaused
											? {}
											: { duration: 60, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }
									}
									className="text-6xl mb-2"
								>
									{DEMO_FOCUS.emoji}
								</m.div>
								<m.div
									key={timeRemaining}
									initial={{ scale: 0.8, opacity: 0 }}
									animate={{ scale: 1, opacity: 1 }}
									className="text-5xl font-display font-bold text-foreground"
								>
									{formatTime(timeRemaining)}
								</m.div>
							</div>
						</div>

						{/* Subtasks */}
						<div className="space-y-3 mb-8">
							<p className="text-sm text-muted-foreground text-center mb-4">
								{completedCount} of {subtasks.length} steps complete
							</p>
							{subtasks.map((task, index) => (
								<m.button
									key={task.id}
									initial={{ opacity: 0, x: -20 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ delay: index * 0.1 }}
									onClick={() => toggleSubtask(task.id)}
									className={cn(
										'w-full flex items-center gap-3 p-4 rounded-2xl border transition-all tiimo-press',
										task.completed
											? 'bg-success-soft border-success/30'
											: 'bg-card border-border hover:border-primary'
									)}
								>
									<div
										className={cn(
											'w-8 h-8 rounded-full border-2 flex items-center justify-center',
											task.completed
												? 'bg-success border-success text-white'
												: 'bg-transparent border-border'
										)}
									>
										{task.completed && (
											<svg
												className="w-4 h-4"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
												strokeWidth={3}
											>
												<path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
											</svg>
										)}
									</div>
									<span
										className={cn(
											'font-medium flex-1 text-left',
											task.completed && 'line-through text-muted-foreground'
										)}
									>
										{task.title}
									</span>
								</m.button>
							))}
						</div>

						{/* Controls */}
						<div className="flex items-center justify-center gap-4">
							<Button
								variant="outline"
								size="lg"
								onClick={() => router.back()}
								className="rounded-full px-6"
							>
								End
							</Button>
							<Button
								size="lg"
								onClick={() => setIsPaused(!isPaused)}
								className="rounded-full px-8 h-14 text-lg"
							>
								{isPaused ? 'Resume' : 'Pause'}
							</Button>
						</div>
					</m.div>
				) : (
					<m.div
						key="complete"
						initial={{ opacity: 0, scale: 0.8 }}
						animate={{ opacity: 1, scale: 1 }}
						className="text-center"
					>
						<m.div
							initial={{ scale: 0 }}
							animate={{ scale: 1 }}
							transition={{ type: 'spring', stiffness: 200, damping: 15 }}
							className="text-8xl mb-6"
						>
							🎉
						</m.div>
						<h2 className="text-3xl font-display font-bold mb-2">Great job!</h2>
						<p className="text-muted-foreground mb-8">
							You completed your {DEMO_FOCUS.subject} session
						</p>
						<Button
							size="lg"
							onClick={() => router.push('/dashboard')}
							className="rounded-full px-8"
						>
							Back to dashboard
						</Button>
					</m.div>
				)}
			</AnimatePresence>
		</div>
	);
}
