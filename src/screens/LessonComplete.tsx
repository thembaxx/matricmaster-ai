'use client';

import { AnimatePresence, m } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AchievementUnlocked } from '@/components/LessonComplete/AchievementUnlocked';
import { ActionButtons } from '@/components/LessonComplete/ActionButtons';
import { ConfettiEffect } from '@/components/LessonComplete/ConfettiEffect';
import { FlashcardGenerator } from '@/components/LessonComplete/FlashcardGenerator';
import { StatsGrid } from '@/components/LessonComplete/StatsGrid';
import { SuccessHeader } from '@/components/LessonComplete/SuccessHeader';
import { TrophySection } from '@/components/LessonComplete/TrophySection';
import { XpProgress } from '@/components/LessonComplete/XpProgress';
import { LessonCompleteSkeleton } from '@/components/LessonCompleteSkeleton';
import { QuizAnalyticsModal } from '@/components/Quiz/QuizAnalyticsModal';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQuizCompletion } from '@/hooks/use-quiz-completion';
import { getUserAchievements } from '@/lib/db/achievement-actions';
import { getLevelInfo } from '@/lib/level-utils';
import { useAiContextStore } from '@/stores/useAiContextStore';
import { useQuizResultStore } from '@/stores/useQuizResultStore';
import type { QuizResult } from '@/types/quiz';

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
	const [confettiEnabled, setConfettiEnabled] = useState(false);
	const { completeQuiz, isCompleting } = useQuizCompletion();
	const addActivity = useAiContextStore((s) => s.addActivity);

	useEffect(() => {
		async function loadResult() {
			const quizResult = useQuizResultStore.getState().get();
			if (!quizResult) {
				router.push('/dashboard');
				return;
			}

			setResult(quizResult);
			useQuizResultStore.getState().clear();

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

			const mistakes = useQuizResultStore.getState().getLastMistakes();
			setMistakeCount(mistakes.length);

			setConfettiEnabled(true);

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
	}, [completeQuiz, router, addActivity]);

	if (!result) {
		return <LessonCompleteSkeleton />;
	}

	return (
		<div className="flex flex-col h-full bg-background">
			<ConfettiEffect enabled={confettiEnabled} />
			<SuccessHeader />

			<ScrollArea className="flex-1">
				<main className="px-6 py-4 flex flex-col items-center pb-32 max-w-2xl mx-auto w-full">
					<TrophySection accuracy={result.accuracy} />

					<m.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.4 }}
					>
						<StatsGrid result={result} pointsEarned={pointsEarned} isCompleting={isCompleting} />
					</m.div>

					<AnimatePresence>
						{newAchievement && (
							<m.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.5 }}
							>
								<AchievementUnlocked achievement={newAchievement} />
							</m.div>
						)}
					</AnimatePresence>

					{mistakeCount > 0 && (
						<m.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.55 }}
						>
							<FlashcardGenerator mistakeCount={mistakeCount} />
						</m.div>
					)}

					{result.accuracy === 100 && mistakeCount === 0 && (
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
					>
						<XpProgress
							level={level}
							xpInCurrentLevel={xpInCurrentLevel}
							xpForNextLevel={xpForNextLevel}
							xpProgress={xpProgress}
						/>
					</m.div>

					<m.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.7 }}
					>
						<ActionButtons onShowAnalytics={() => setShowAnalytics(true)} />
					</m.div>
				</main>
			</ScrollArea>

			<QuizAnalyticsModal open={showAnalytics} onOpenChange={setShowAnalytics} />
		</div>
	);
}
