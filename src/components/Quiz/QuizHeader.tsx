'use client';

import { Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type QuizHeaderProps = {
	title: string;
	subtitle?: string;
	currentQuestion: number;
	totalQuestions: number;
	elapsedSeconds: number;
	score?: number;
	topic?: string;
	topicColor?: string;
	showProgress?: boolean;
};

export function QuizHeader({
	title,
	subtitle,
	currentQuestion,
	totalQuestions,
	elapsedSeconds,
	score = 0,
	topic,
	topicColor = 'bg-brand-purple/10 text-brand-purple',
	showProgress = true,
}: QuizHeaderProps) {
	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	};

	const progress = (currentQuestion / totalQuestions) * 100;

	return (
		<header className="px-6 pt-12 pb-4 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl sticky top-0 z-20 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
			<div className="max-w-2xl mx-auto w-full">
				<div className="flex justify-between items-center mb-2">
					<span className="text-sm font-bold text-zinc-600 dark:text-zinc-400">
						Question {currentQuestion} of {totalQuestions}
					</span>
					<div className="flex items-center gap-2">
						{score > 0 && (
							<Badge
								variant="outline"
								className="text-[10px] font-bold text-brand-green border-brand-green/20 bg-brand-green/5"
							>
								Score: {score}
							</Badge>
						)}
						<Badge
							variant="outline"
							className="text-[10px] font-bold text-zinc-500 border-zinc-200 bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700"
						>
							<Clock className="w-3 h-3 mr-1" />
							{formatTime(elapsedSeconds)}
						</Badge>
					</div>
				</div>

				{showProgress && (
					<div className="relative h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800 mb-3">
						<div
							className="h-full transition-all duration-500 bg-primary"
							style={{ width: `${progress}%` }}
						/>
					</div>
				)}

				{topic && (
					<Badge
						variant="secondary"
						className={`text-[10px] font-black uppercase tracking-tighter rounded-full ${topicColor}`}
					>
						{topic}
					</Badge>
				)}

				{subtitle && (
					<p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-2">
						{subtitle}
					</p>
				)}

				{title && <h1 className="text-lg font-black text-foreground mt-1">{title}</h1>}
			</div>
		</header>
	);
}

type SimpleQuizHeaderProps = {
	title: string;
	subtitle?: string;
	elapsedSeconds: number;
	currentQuestion: number;
	totalQuestions: number;
	progressPercent?: number;
};

export function SimpleQuizHeader({
	title,
	subtitle,
	elapsedSeconds,
	currentQuestion,
	totalQuestions,
	progressPercent,
}: SimpleQuizHeaderProps) {
	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	};

	return (
		<header className="bg-card/80 backdrop-blur-xl border-b border-border shrink-0">
			<div className="max-w-2xl mx-auto w-full">
				<div className="px-6 pt-12 pb-2 flex items-center justify-between">
					<div className="text-center flex-1">
						<h1 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
							{title}
						</h1>
						{subtitle && <p className="text-sm font-black text-foreground">{subtitle}</p>}
					</div>
					<Badge
						variant="outline"
						className="text-[10px] font-bold text-zinc-500 border-zinc-200 bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700"
					>
						<Clock className="w-3 h-3 mr-1" />
						{formatTime(elapsedSeconds)}
					</Badge>
				</div>
				<div className="px-6 pb-6">
					<div className="relative h-2 w-full bg-muted rounded-full overflow-hidden mb-3">
						<div
							className="absolute top-0 left-0 h-full bg-brand-green rounded-full shadow-[0_0_12px_rgba(16,185,129,0.4)] transition-all duration-500"
							style={{ width: `${progressPercent ?? (currentQuestion / totalQuestions) * 100}%` }}
						/>
					</div>
					<div className="flex justify-between items-center text-[10px] font-black tracking-widest text-muted-foreground uppercase">
						<span>
							Question {currentQuestion}/{totalQuestions}
						</span>
					</div>
				</div>
			</div>
		</header>
	);
}
