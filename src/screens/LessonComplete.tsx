'use client';

import {
	ArrowRight01Icon as CaretRight,
	ChartBarLineIcon as ChartBar,
	CheckmarkCircle01Icon as CheckCircle,
	Loading03Icon as CircleNotch,
	Time02Icon as Clock,
	RotateClockwiseIcon as ClockCounterClockwise,
	Lightning01Icon as Lightning,
	SparklesIcon as Sparkle,
	ChampionIcon as Trophy,
	Cancel01Icon as X,
} from 'hugeicons-react';
import confetti from 'canvas-confetti';
import { AnimatePresence, m } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { QuizAnalyticsModal } from '@/components/Quiz/QuizAnalyticsModal';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQuizCompletion } from '@/hooks/use-quiz-completion';
import { getUserAchievements } from '@/lib/db/achievement-actions';
import { getLevelInfo } from '@/lib/level-utils';
import { useQuizResultStore } from '@/stores/useQuizResultStore';
import type { QuizResult } from '@/types/quiz';
import { cn } from '@/lib/utils';

function formatDuration(seconds: number): string {
	if (seconds < 60) return `${seconds}s`;
	const mins = Math.floor(seconds / 60);
	const secs = seconds % 60;
	return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
}

export default function LessonComplete() {
	const router = useRouter();
	const [showAnalytics, setShowAnalytics] = useState(false);
	const [result, setResult] = useState<QuizResult | null>(null);
	const [pointsEarned, setPointsEarned] = useState(0);
	const [level, setLevel] = useState(1);
	const [xpInCurrentLevel, setXpInCurrentLevel] = useState(0);
	const [xpForNextLevel, setXpForNextLevel] = useState(0);
	const [xpProgress, setXpProgress] = useState(0);
	const [newAchievement, setNewAchievement] = useState<string | null>(null);
	const { completeQuiz, isCompleting } = useQuizCompletion();

	useEffect(() => {
		async function loadResult() {
			const quizResult = useQuizResultStore.getState().get();
			if (!quizResult) {
				router.push('/dashboard');
				return;
			}

			setResult(quizResult);
			useQuizResultStore.getState().clear();

			// Trigger celebratory confetti
			const duration = 5 * 1000;
			const animationEnd = Date.now() + duration;
			const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

			const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

			const interval = setInterval(() => {
				const timeLeft = animationEnd - Date.now();

				if (timeLeft <= 0) {
					return clearInterval(interval);
				}

				const particleCount = 50 * (timeLeft / duration);
				confetti({
					...defaults,
					particleCount,
					origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
				});
				confetti({
					...defaults,
					particleCount,
					origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
				});
			}, 250);

			const completionResult = await completeQuiz({
				correctAnswers: quizResult.correctAnswers,
				totalQuestions: quizResult.totalQuestions,
				durationMinutes: Math.ceil(quizResult.durationSeconds / 60),
				difficulty: quizResult.difficulty,
				subjectId: quizResult.subjectId,
			});

			setPointsEarned(completionResult.pointsEarned);

			if (completionResult.newAchievements.length > 0) {
				setNewAchievement(completionResult.newAchievements[0]);
			}

			const achievements = await getUserAchievements();
			const totalXp =
				achievements.unlocked.reduce((sum, a) => {
					const def = achievements.available.find((d) => d.id === a.achievementId);
					return sum + (def?.points || 0);
				}, 0) + completionResult.pointsEarned;

			const levelInfo = getLevelInfo(totalXp);
			setLevel(levelInfo.level);
			setXpInCurrentLevel(levelInfo.xpInCurrentLevel);
			setXpForNextLevel(levelInfo.xpForNextLevel);
			setXpProgress(levelInfo.progressPercent);
		}

		loadResult();
	}, [completeQuiz, router]);

	if (!result) {
		return (
			<div className="flex flex-col h-full bg-background items-center justify-center">
				<CircleNotch className="w-12 h-12 animate-spin text-primary" />
			</div>
		);
	}

	return (
		<div className="flex flex-col h-full bg-white dark:bg-zinc-950">
			<header className="px-8 py-10 flex items-center justify-between shrink-0 max-w-3xl mx-auto w-full">
				<Button
					variant="ghost"
					size="icon"
					onClick={() => router.push('/dashboard')}
					className="h-14 w-14 rounded-2xl bg-muted/10 hover:bg-muted/20 transition-all"
				>
					<X size={24} className="stroke-[3px]" />
				</Button>
				<h1 className="text-2xl font-black text-foreground tracking-tight">Success!</h1>
				<div className="w-14" />
			</header>

			<ScrollArea className="flex-1 no-scrollbar">
				<main className="px-8 py-8 flex flex-col items-center pb-64 max-w-3xl mx-auto w-full space-y-16">
					<div className="relative group">
						<m.div
							animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
							transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY }}
							className="absolute inset-[-20px] bg-tiimo-orange/10 rounded-full blur-[60px]"
						/>
						<m.div
							initial={{ scale: 0.5, rotate: -180, opacity: 0 }}
							animate={{ scale: 1, rotate: 0, opacity: 1 }}
							transition={{ type: 'spring', damping: 15, stiffness: 200 }}
							className="relative z-10 w-64 h-64 bg-card rounded-[4rem] shadow-[0_30px_80px_rgba(249,115,22,0.2)] flex items-center justify-center border-none group-hover:scale-105 transition-transform duration-700"
						>
							<Trophy size={120} className="text-tiimo-orange stroke-[2.5px] fill-tiimo-orange/10" />
						</m.div>
					</div>

					<m.div
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3 }}
						className="text-center space-y-4"
					>
						<h2 className="text-6xl lg:text-8xl font-black text-foreground tracking-tighter leading-none uppercase">
							Mastered!
						</h2>
						<p className="text-xl font-bold text-muted-foreground/60 max-w-sm mx-auto">
							{result.accuracy >= 80
								? 'Absolute perfection. Your scores are soaring!'
								: result.accuracy >= 60
									? 'Strong performance! Keep this energy up!'
									: "Solid effort! Each step counts on your path."}
						</p>
					</m.div>

					<m.div
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ delay: 0.4 }}
						className="grid grid-cols-3 gap-6 w-full"
					>
						{[
							{ label: 'Accuracy', value: `${result.accuracy}%`, icon: CheckCircle, color: 'text-tiimo-green', bg: 'bg-tiimo-green/10' },
							{ label: 'Time', value: formatDuration(result.durationSeconds), icon: Clock, color: 'text-tiimo-blue', bg: 'bg-tiimo-blue/10' },
							{ label: 'Kudos', value: isCompleting ? '...' : `+${pointsEarned}`, icon: Lightning, color: 'text-tiimo-orange', bg: 'bg-tiimo-orange/10' },
						].map((stat) => (
							<div key={stat.label} className="bg-card p-8 rounded-[2.5rem] flex flex-col items-center gap-4 shadow-[0_15px_45px_rgba(0,0,0,0.05)] border-none hover:shadow-xl transition-all duration-500 group">
								<div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform", stat.bg)}>
									<stat.icon size={28} className={cn("stroke-[3px]", stat.color)} />
								</div>
								<div className="text-center space-y-1">
									<span className="text-2xl font-black text-foreground block leading-none">
										{stat.value}
									</span>
									<span className="text-[10px] uppercase font-black text-muted-foreground/40 tracking-[0.2em]">
										{stat.label}
									</span>
								</div>
							</div>
						))}
					</m.div>

					<AnimatePresence>
						{newAchievement && (
							<m.div
								initial={{ opacity: 0, y: 30, scale: 0.9 }}
								animate={{ opacity: 1, y: 0, scale: 1 }}
								transition={{ delay: 0.5, type: 'spring' }}
								className="w-full space-y-6"
							>
								<div className="flex items-center gap-3 px-2">
									<Sparkle size={18} className="text-tiimo-purple stroke-[3px]" />
									<h3 className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-[0.3em]">
					Rewards unlocked
									</h3>
								</div>
								<div className="bg-tiimo-purple text-white p-10 rounded-[3.5rem] flex items-center gap-8 shadow-[0_30px_70px_rgba(124,58,237,0.3)] relative overflow-hidden group">
									<div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
									<div className="w-20 h-20 bg-white/20 rounded-[1.5rem] flex items-center justify-center shrink-0 shadow-lg">
										<Trophy size={40} className="stroke-[3px] fill-white/10" />
									</div>
									<div className="space-y-1">
										<p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">
											Milestone Achieved
										</p>
										<h4 className="text-3xl font-black leading-none">Achievement!</h4>
										<p className="text-lg font-bold opacity-80">
											Your vault is growing. Check it out!
										</p>
									</div>
								</div>
							</m.div>
						)}
					</AnimatePresence>

					<m.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.6 }}
						className="w-full space-y-6"
					>
						<div className="flex justify-between items-end px-2">
							<div className="space-y-1">
								<span className="text-2xl font-black text-foreground leading-none">
									Level {level}
								</span>
								<p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">Next Goal: Lvl {level + 1}</p>
							</div>
							<span className="text-xl font-black text-primary">
								{xpInCurrentLevel} <span className="text-muted-foreground/20">/ {xpForNextLevel}</span>
							</span>
						</div>
						<div className="h-4 w-full bg-muted/20 rounded-full overflow-hidden p-1 shadow-inner">
							<m.div
								initial={{ width: 0 }}
								animate={{ width: `${xpProgress}%` }}
								transition={{ duration: 1.5, type: 'spring' }}
								className="h-full bg-primary rounded-full shadow-lg"
							/>
						</div>
					</m.div>

					<div className="grid grid-cols-1 gap-4 w-full pt-8">
						<Button
							onClick={() => router.push('/dashboard')}
							className="h-20 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 rounded-[2rem] text-2xl font-black shadow-[0_30px_70px_rgba(0,0,0,0.3)] transition-all flex items-center justify-center gap-4 hover:opacity-90 active:scale-95"
						>
							<span>Continue quest</span>
							<CaretRight size={28} className="stroke-[3.5px]" />
						</Button>

						<div className="grid grid-cols-2 gap-4">
							<Button
								variant="ghost"
								onClick={() => setShowAnalytics(true)}
								className="h-16 rounded-2xl bg-muted/10 hover:bg-muted/20 font-black text-xs uppercase tracking-widest gap-3 transition-all"
							>
								<ChartBar size={20} className="stroke-[3px]" />
								Analytics
							</Button>
							<Button
								variant="ghost"
								onClick={() => router.push('/quiz')}
								className="h-16 rounded-2xl bg-muted/10 hover:bg-muted/20 font-black text-xs uppercase tracking-widest gap-3 transition-all"
							>
								<ClockCounterClockwise size={20} className="stroke-[3px]" />
								Another quiz
							</Button>
						</div>
					</div>
				</main>
			</ScrollArea>

			<QuizAnalyticsModal open={showAnalytics} onOpenChange={setShowAnalytics} />
		</div>
	);
}
