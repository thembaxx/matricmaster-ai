'use client';

import { PauseIcon, PlayIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { useFocusModeContext } from '@/contexts/FocusModeContext';
import { DURATION } from '@/lib/animation-presets';

function formatExamTime(seconds: number) {
	const h = Math.floor(seconds / 3600);
	const m = Math.floor((seconds % 3600) / 60);
	const s = seconds % 60;
	if (h > 0) {
		return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
	}
	return `${m}:${s.toString().padStart(2, '0')}`;
}

function ExamSimulationContent() {
	const { timeRemaining, totalTime, config, status, pauseExam, resumeExam } = useFocusModeContext();

	const progress = totalTime > 0 ? ((totalTime - timeRemaining) / totalTime) * 100 : 0;

	if (status !== 'active' && status !== 'paused') {
		return null;
	}

	const CIRC = 2 * Math.PI * 45;

	return (
		<div className="flex flex-col items-center justify-center min-h-[calc(100vh-48px)] p-6">
			<m.div
				initial={{ opacity: 0, scale: 0.9 }}
				animate={{ opacity: 1, scale: 1 }}
				className="w-full max-w-md flex flex-col items-center"
			>
				<div className="text-center mb-10">
					<h1 className="text-2xl sm:text-3xl font-black tracking-tighter mb-1">
						{config?.paperTitle || 'exam simulation'}
					</h1>
					<p className="text-xs font-bold text-muted-foreground tracking-widest">
						{config?.subject || ''} nsc exam
					</p>
				</div>

				<div className="relative w-56 sm:w-64 h-56 sm:h-64 mx-auto mb-10">
					<svg
						className="w-full h-full -rotate-90"
						viewBox="0 0 100 100"
						role="img"
						aria-label="Exam timer"
					>
						<title>Exam timer</title>
						<circle cx="50" cy="50" r="45" fill="none" stroke="var(--muted)" strokeWidth="4" />
						<m.circle
							cx="50"
							cy="50"
							r="45"
							fill="none"
							stroke={
								progress < 80
									? 'var(--primary)'
									: progress < 90
										? 'var(--warning)'
										: 'var(--destructive)'
							}
							strokeWidth="4"
							strokeLinecap="round"
							strokeDasharray={`${CIRC}`}
							initial={{ strokeDashoffset: `${CIRC}` }}
							animate={{ strokeDashoffset: `${CIRC * (1 - progress / 100)}` }}
							transition={{ duration: DURATION.normal }}
						/>
					</svg>
					<div className="absolute inset-0 flex flex-col items-center justify-center">
						<span className="text-5xl sm:text-6xl font-black font-mono tracking-tighter">
							{formatExamTime(timeRemaining)}
						</span>
						<span className="text-[10px] font-bold text-muted-foreground tracking-widest mt-1">
							remaining
						</span>
					</div>
				</div>

				<div className="flex items-center gap-4">
					{status === 'active' ? (
						<Button
							size="lg"
							variant="outline"
							onClick={pauseExam}
							className="rounded-full px-10 h-14 text-xs font-black tracking-widest gap-2"
						>
							<HugeiconsIcon icon={PauseIcon} className="w-5 h-5" />
							pause
						</Button>
					) : (
						<Button
							size="lg"
							onClick={resumeExam}
							className="rounded-full px-10 h-14 text-xs font-black tracking-widest gap-2 shadow-xl shadow-primary/20"
						>
							<HugeiconsIcon icon={PlayIcon} className="w-5 h-5" />
							resume
						</Button>
					)}
				</div>
			</m.div>
		</div>
	);
}

function ExamSimSkeleton() {
	return (
		<div className="flex flex-col items-center justify-center min-h-[calc(100vh-48px)] p-6 animate-pulse">
			<div className="w-64 h-64 rounded-full bg-muted" />
		</div>
	);
}

export default function ExamSimulationScreen() {
	return (
		<Suspense fallback={<ExamSimSkeleton />}>
			<ExamSimulationContent />
		</Suspense>
	);
}
