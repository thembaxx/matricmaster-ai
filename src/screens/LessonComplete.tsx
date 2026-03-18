'use client';

import {
	ArrowRight01Icon,
	Cancel01Icon,
	ChampionIcon,
	ChartBar,
	CheckmarkCircle02Icon,
	Clock01Icon,
	FlashIcon,
	Layers01Icon,
	Refresh01Icon,
	SparklesIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
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
import { useHaptics } from '@/hooks/useHaptics';
import { getUserAchievements } from '@/lib/db/achievement-actions';
import { generateFlashcardsFromMistakes } from '@/lib/db/learning-loop-actions';
import { getLevelInfo } from '@/lib/level-utils';
import { useAiContextStore } from '@/stores/useAiContextStore';
import { useQuizResultStore } from '@/stores/useQuizResultStore';
import type { QuizResult } from '@/types/quiz';

function formatDuration(seconds: number): string {
	if (seconds < 60) return `${seconds}s`;
	const mins = Math.floor(seconds / 60);
	const secs = seconds % 60;
	return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
}

import { LessonCompleteSkeleton } from '@/components/LessonCompleteSkeleton';

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
	const [mistakeCount, setMistakeCount] = useState(0);
	const [isGenerating, setIsGenerating] = useState(false);
	const [generationResult, setGenerationResult] = useState<{
		success: boolean;
		cardsCreated: number;
	} | null>(null);
	const { completeQuiz, isCompleting } = useQuizCompletion();
	const addActivity = useAiContextStore((s) => s.addActivity);
	const { trigger: triggerHaptic } = useHaptics();

	useEffect(() => {
		async function loadResult() {
			const quizResult = useQuizResultStore.getState().get();
			if (!quizResult) {
				router.push('/dashboard');
				return;
			}

			setResult(quizResult);
			useQuizResultStore.getState().clear();

			// Track quiz activity in context store
			const accuracy =
				quizResult.totalQuestions > 0
					? (quizResult.correctAnswers / quizResult.totalQuestions) * 100
					: 0;
			const outcome = accuracy >= 60 ? 'passed' : 'failed';

			addActivity({
				type: 'quiz',
				subject: quizResult.subjectName,
				topic: quizResult.topic,
				outcome,
				score: accuracy,
				description: `${outcome === 'passed' ? 'Passed' : 'Failed'} ${quizResult.subjectName} quiz with ${accuracy.toFixed(0)}% (${quizResult.correctAnswers}/${quizResult.totalQuestions})`,
			});

			// Load mistake count from store
			const mistakes = useQuizResultStore.getState().getLastMistakes();
			setMistakeCount(mistakes.length);

			// Trigger haptic feedback for completion
			triggerHaptic('achievement');

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
	}, [completeQuiz, router, addActivity, triggerHaptic]);

	const handleGenerateFlashcards = async () => {
		setIsGenerating(true);
		try {
			const result = await generateFlashcardsFromMistakes();
			setGenerationResult(result);
		} catch (error) {
			console.debug('Failed to generate flashcards:', error);
			setGenerationResult({ success: false, cardsCreated: 0 });
		} finally {
			setIsGenerating(false);
		}
	};

	if (!result) {
		return <LessonCompleteSkeleton />;
	}

	return (
		<div className="flex flex-col h-full bg-background">
			<header className="px-6 py-12 flex items-center justify-between shrink-0 max-w-2xl mx-auto w-full">
				<Button
					variant="ghost"
					size="icon"
					onClick={() => router.push('/dashboard')}
					className="rounded-full text-foreground"
				>
					<HugeiconsIcon icon={Cancel01Icon} className="w-6 h-6" />
				</Button>
				<h1 className="text-xl font-black text-foreground tracking-tight uppercase">Success</h1>
				<div className="w-10" />
			</header>

			<ScrollArea className="flex-1">
				<main className="px-6 py-4 flex flex-col items-center pb-32 max-w-2xl mx-auto w-full">
					<div className="relative mb-12 w-56 h-56 flex items-center justify-center">
						<m.div
							initial={{ scale: 0.95, opacity: 0 }}
							animate={{ scale: 1 }}
							transition={{ type: 'spring', damping: 10, stiffness: 200 }}
							className="absolute inset-0 bg-primary-orange/10 rounded-[3rem] blur-2xl"
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
						<p className="text-muted-foreground dark:text-muted-foreground font-medium text-lg">
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
						<div className="bg-card p-4 rounded-3xl flex flex-col items-center shadow-xl border border-border/50">
							<div className="w-10 h-10 rounded-2xl bg-accent-lime/10 flex items-center justify-center mb-3">
								<HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-6 h-6 text-accent-lime" />
							</div>
							<span className="text-xl font-black text-foreground tracking-tight">
								{result.accuracy}%
							</span>
							<span className="text-[10px] uppercase font-black text-muted-foreground tracking-wider">
								Accuracy
							</span>
						</div>

						<div className="bg-card p-4 rounded-3xl flex flex-col items-center shadow-xl border border-border/50">
							<div className="w-10 h-10 rounded-2xl bg-primary-cyan/10 flex items-center justify-center mb-3">
								<HugeiconsIcon icon={Clock01Icon} className="w-6 h-6 text-primary-cyan" />
							</div>
							<span className="text-xl font-black text-foreground tracking-tight">
								{formatDuration(result.durationSeconds)}
							</span>
							<span className="text-[10px] uppercase font-black text-muted-foreground tracking-wider">
								Time
							</span>
						</div>

						<div className="bg-card p-4 rounded-3xl flex flex-col items-center shadow-xl border border-border/50">
							<div className="w-10 h-10 rounded-2xl bg-primary-orange/10 flex items-center justify-center mb-3">
								<HugeiconsIcon icon={FlashIcon} className="w-6 h-6 text-primary-orange" />
							</div>
							<span className="text-xl font-black text-primary-orange tracking-tight">
								{isCompleting ? '...' : `+${pointsEarned}`}
							</span>
							<span className="text-[10px] uppercase font-black text-muted-foreground tracking-wider">
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
								<h3 className="text-lg font-black text-foreground text-left ml-1 flex items-center gap-2 uppercase tracking-tight">
									<HugeiconsIcon icon={SparklesIcon} className="w-5 h-5 text-primary-orange" />
									Rewards Unlocked
								</h3>
								<div className="bg-card p-6 rounded-[2rem] flex items-center gap-5 shadow-2xl border border-primary-orange/20">
									<div className="w-16 h-16 bg-gradient-to-br from-primary-orange to-accent-pink rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
										<HugeiconsIcon icon={ChampionIcon} className="w-8 h-8 text-white" />
									</div>
									<div className="flex-1">
										<p className="text-[10px] font-black text-primary-orange uppercase tracking-widest mb-0.5 opacity-80">
											New Achievement
										</p>
										<h4 className="text-xl font-bold text-foreground">Achievement Unlocked!</h4>
										<p className="text-sm text-muted-foreground font-medium">
											Keep learning to unlock more
										</p>
									</div>
								</div>
							</m.div>
						)}
					</AnimatePresence>

					{mistakeCount > 0 && !generationResult && (
						<m.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.55 }}
							className="w-full max-w-md space-y-3 mb-8"
						>
							<Button
								variant="outline"
								className="w-full h-16 rounded-2xl text-lg font-black shadow-lg border-primary-orange/30 hover:bg-primary-orange/10 flex items-center justify-center gap-3"
								onClick={handleGenerateFlashcards}
								disabled={isGenerating}
							>
								{isGenerating ? (
									<>
										<div className="w-5 h-5 border-2 border-primary-orange border-t-transparent rounded-full animate-spin" />
										Generating...
									</>
								) : (
									<>
										<HugeiconsIcon icon={Layers01Icon} className="w-6 h-6 text-primary-orange" />
										Create Flashcards from Mistakes
									</>
								)}
							</Button>
							<p className="text-center text-sm text-muted-foreground font-medium">
								{mistakeCount} {mistakeCount === 1 ? 'mistake' : 'mistakes'} to review
							</p>
						</m.div>
					)}

					{generationResult && (
						<m.div
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							className="w-full max-w-md space-y-3 mb-8"
						>
							<div className="bg-card p-6 rounded-[2rem] flex items-center gap-4 shadow-lg border border-green-500/20">
								<div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center shrink-0">
									<HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-6 h-6 text-green-500" />
								</div>
								<div>
									<p className="font-bold text-foreground">
										{generationResult.cardsCreated > 0
											? `${generationResult.cardsCreated} Flashcards Created!`
											: 'No New Cards'}
									</p>
									<p className="text-sm text-muted-foreground">
										{generationResult.cardsCreated > 0
											? 'Added to your Mistake Master deck'
											: 'All mistakes already have flashcards'}
									</p>
								</div>
							</div>
						</m.div>
					)}

					{result.accuracy === 100 && mistakeCount === 0 && !generationResult && (
						<m.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.55 }}
							className="w-full max-w-md mb-8"
						>
							<div className="bg-accent-lime/10 p-4 rounded-2xl border border-accent-lime/20">
								<p className="text-center font-bold text-accent-lime">
									Perfect Score! No mistakes to review.
								</p>
							</div>
						</m.div>
					)}

					<m.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.6 }}
						className="w-full max-w-md space-y-3 mb-10 px-1"
					>
						<div className="flex justify-between items-end">
							<span className="text-base font-black text-foreground uppercase tracking-tight">
								Level {level}
							</span>
							<span className="text-xs font-black text-muted-foreground opacity-60">
								{xpInCurrentLevel} / {xpForNextLevel} XP
							</span>
						</div>
						<Progress
							value={xpProgress}
							className="h-3 bg-muted/30 rounded-full"
							style={
								{
									'--progress-background': 'var(--primary-violet)',
								} as React.CSSProperties
							}
						/>
						<div className="flex justify-end">
							<span className="text-xs font-bold text-muted-foreground">
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
							variant="gradient"
							className="w-full h-16 rounded-3xl text-lg font-black shadow-2xl transition-all flex items-center justify-center gap-2"
							onClick={() => router.push('/dashboard')}
						>
							Keep Going
							<HugeiconsIcon icon={ArrowRight01Icon} className="w-5 h-5" />
						</Button>
						<Button
							variant="ghost"
							className="w-full h-14 rounded-2xl font-black text-sm uppercase tracking-widest text-muted-foreground hover:text-foreground flex items-center justify-center gap-2"
							onClick={() => setShowAnalytics(true)}
						>
							<HugeiconsIcon icon={ChartBar} className="w-5 h-5" />
							View Analytics
						</Button>
						<Button
							variant="ghost"
							className="w-full h-14 rounded-2xl font-black text-sm uppercase tracking-widest text-muted-foreground hover:text-foreground flex items-center justify-center gap-2"
							onClick={() => router.push('/quiz')}
						>
							<HugeiconsIcon icon={Refresh01Icon} className="w-5 h-5" />
							Try Another Quiz
						</Button>
						<Button
							variant="ghost"
							className="w-full h-14 rounded-2xl font-black text-sm uppercase tracking-widest text-muted-foreground hover:text-foreground flex items-center justify-center gap-2"
							onClick={() => router.push('/flashcards')}
						>
							<HugeiconsIcon icon={Layers01Icon} className="w-5 h-5" />
							Review Flashcards
						</Button>
						<Button
							variant="ghost"
							className="w-full h-14 rounded-2xl font-black text-sm uppercase tracking-widest text-muted-foreground hover:text-foreground flex items-center justify-center gap-2"
							onClick={() => router.push('/past-papers')}
						>
							<HugeiconsIcon icon={SparklesIcon} className="w-5 h-5" />
							Practice Past Papers
						</Button>
					</m.div>
				</main>
			</ScrollArea>

			<QuizAnalyticsModal open={showAnalytics} onOpenChange={setShowAnalytics} />
		</div>
	);
}
