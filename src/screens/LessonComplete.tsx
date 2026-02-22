'use client';

import { AnimatePresence, m } from 'framer-motion';
import {
	BarChart3,
	CheckCircle2,
	ChevronRight,
	Clock,
	History,
	Loader2,
	Sparkles,
	Trophy,
	X,
	Zap,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { QuizAnalyticsModal } from '@/components/Quiz/QuizAnalyticsModal';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQuizCompletion } from '@/hooks/use-quiz-completion';
import { getUserAchievements } from '@/lib/db/achievement-actions';
import { useQuizResultStore } from '@/stores/useQuizResultStore';
import type { QuizResult } from '@/types/quiz';

const XP_PER_LEVEL = 500;

function calculateLevel(totalXp: number): { level: number; currentXp: number; xpToNext: number } {
	const level = Math.floor(totalXp / XP_PER_LEVEL) + 1;
	const currentXp = totalXp % XP_PER_LEVEL;
	const xpToNext = XP_PER_LEVEL;
	return { level, currentXp, xpToNext };
}

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
	const [currentXp, setCurrentXp] = useState(0);
	const [xpToNext, setXpToNext] = useState(XP_PER_LEVEL);
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

			const levelData = calculateLevel(totalXp);
			setLevel(levelData.level);
			setCurrentXp(levelData.currentXp);
			setXpToNext(levelData.xpToNext);
		}

		loadResult();
	}, [completeQuiz, router]);

	const xpProgress = (currentXp / xpToNext) * 100;

	if (!result) {
		return (
			<div className="flex flex-col h-full bg-background items-center justify-center">
				<Loader2 className="w-12 h-12 animate-spin text-primary" />
			</div>
		);
	}

	return (
		<div className="flex flex-col h-full bg-background">
			<header className="px-6 py-12 flex items-center justify-between shrink-0 max-w-2xl mx-auto w-full">
				<Button
					variant="ghost"
					size="icon"
					onClick={() => router.push('/dashboard')}
					className="rounded-full text-zinc-900 dark:text-white"
				>
					<X className="w-6 h-6" />
				</Button>
				<h1 className="text-xl font-bold text-zinc-900 dark:text-white">Success</h1>
				<div className="w-10" />
			</header>

			<ScrollArea className="flex-1">
				<main className="px-6 py-4 flex flex-col items-center pb-32 max-w-2xl mx-auto w-full">
					<div className="relative mb-12 w-56 h-56 flex items-center justify-center">
						<m.div
							initial={{ scale: 0.95, opacity: 0 }}
							animate={{ scale: 1 }}
							transition={{ type: 'spring', damping: 10, stiffness: 200 }}
							className="absolute inset-0 bg-[#fde68a] dark:bg-yellow-900/20 rounded-3xl opacity-20"
						/>
						<m.div
							initial={{ scale: 0.95, opacity: 0, rotate: -180 }}
							animate={{ scale: 1, rotate: 0 }}
							transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.2 }}
						>
							<Image
								src="https://images.unsplash.com/photo-1579546671584-62dcfaf35ad0?w=400&h=400&fit=crop"
								alt="Trophy"
								width={160}
								height={160}
								priority
								sizes="160px"
								className="object-contain rounded-2xl shadow-xl shadow-yellow-500/10"
							/>
						</m.div>
					</div>

					<m.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3 }}
						className="text-center space-y-3 mb-12"
					>
						<h2 className="text-5xl lg:text-7xl font-black text-foreground tracking-tighter uppercase leading-none">
							Lesson Complete!
						</h2>
						<p className="text-zinc-500 dark:text-zinc-400 font-medium text-lg">
							{result.accuracy >= 80
								? 'Excellent work! You nailed it!'
								: result.accuracy >= 60
									? 'Great effort! Keep practicing!'
									: "Good try! You're making progress!"}
						</p>
					</m.div>

					<m.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.4 }}
						className="grid grid-cols-3 gap-3 w-full max-w-md mb-8"
					>
						<div className="bg-white dark:bg-[#111827] p-4 rounded-2xl flex flex-col items-center shadow-sm border border-border">
							<div className="w-10 h-10 rounded-full bg-yellow-50 dark:bg-yellow-900/20 flex items-center justify-center mb-3">
								<CheckCircle2 className="w-6 h-6 text-[#efb036]" />
							</div>
							<span className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">
								{result.accuracy}%
							</span>
							<span className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 tracking-wider">
								Accuracy
							</span>
						</div>

						<div className="bg-white dark:bg-[#111827] p-4 rounded-2xl flex flex-col items-center shadow-sm border border-border">
							<div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-3">
								<Clock className="w-6 h-6 text-blue-500" />
							</div>
							<span className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">
								{formatDuration(result.durationSeconds)}
							</span>
							<span className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 tracking-wider">
								Time
							</span>
						</div>

						<div className="bg-white dark:bg-[#111827] p-4 rounded-2xl flex flex-col items-center shadow-sm border border-border">
							<div className="w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center mb-3">
								<Zap className="w-6 h-6 text-orange-500" />
							</div>
							<span className="text-xl font-bold text-orange-500 tracking-tight">
								{isCompleting ? '...' : `+${pointsEarned}`}
							</span>
							<span className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 tracking-wider">
								XP Gained
							</span>
						</div>
					</m.div>

					<AnimatePresence>
						{newAchievement && (
							<m.div
								initial={{ opacity: 0, scale: 0.8 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.8 }}
								transition={{ delay: 0.5 }}
								className="w-full max-w-md space-y-3 mb-8"
							>
								<h3 className="text-lg font-bold text-zinc-900 dark:text-white text-left ml-1 flex items-center gap-2">
									<Sparkles className="w-5 h-5 text-brand-amber" />
									Rewards Unlocked
								</h3>
								<div className="bg-gradient-to-r from-brand-amber/10 to-orange-400/10 dark:from-brand-amber/5 dark:to-orange-400/5 p-5 rounded-2xl flex items-center gap-4 shadow-sm border border-brand-amber/20">
									<div className="w-16 h-16 bg-gradient-to-br from-brand-amber to-orange-400 rounded-xl flex items-center justify-center shrink-0">
										<Trophy className="w-8 h-8 text-white" />
									</div>
									<div className="flex-1">
										<p className="text-[10px] font-extrabold text-brand-amber uppercase tracking-widest mb-0.5">
											New Achievement
										</p>
										<h4 className="text-xl font-bold text-zinc-900 dark:text-white">
											Achievement Unlocked!
										</h4>
										<p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
											Keep learning to unlock more
										</p>
									</div>
								</div>
							</m.div>
						)}
					</AnimatePresence>

					<m.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.6 }}
						className="w-full max-w-md space-y-3 mb-10 px-1"
					>
						<div className="flex justify-between items-end">
							<span className="text-base font-bold text-zinc-900 dark:text-white">
								Level {level}
							</span>
							<span className="text-xs font-bold text-zinc-400 dark:text-zinc-500">
								{currentXp} / {xpToNext} XP
							</span>
						</div>
						<Progress value={xpProgress} className="h-2.5" />
						<div className="flex justify-end">
							<span className="text-xs font-bold text-zinc-400 dark:text-zinc-500">
								Next: Level {level + 1}
							</span>
						</div>
					</m.div>

					<m.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.7 }}
						className="w-full max-w-md space-y-4"
					>
						<Button
							className="w-full h-14 bg-[#efb036] hover:bg-[#d99d2b] text-zinc-900 rounded-2xl text-lg font-bold shadow-lg shadow-yellow-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
							onClick={() => router.push('/dashboard')}
						>
							Keep Going
							<ChevronRight className="w-5 h-5" />
						</Button>
						<Button
							variant="ghost"
							className="w-full h-12 rounded-full font-bold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center gap-2"
							onClick={() => setShowAnalytics(true)}
						>
							<BarChart3 className="w-5 h-5" />
							View Analytics
						</Button>
						<Button
							variant="ghost"
							className="w-full h-12 rounded-full font-bold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center gap-2"
							onClick={() => router.push('/quiz')}
						>
							<History className="w-5 h-5" />
							Try Another Quiz
						</Button>
					</m.div>
				</main>
			</ScrollArea>

			<QuizAnalyticsModal open={showAnalytics} onOpenChange={setShowAnalytics} />
		</div>
	);
}
