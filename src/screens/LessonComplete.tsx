'use client';

import { AnimatePresence, m } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useReducer } from 'react';
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

type State = {
	showAnalytics: boolean;
	result: QuizResult | null;
	pointsEarned: number;
	level: number;
	xpInCurrentLevel: number;
	xpForNextLevel: number;
	xpProgress: number;
	newAchievement: string | null;
	mistakeCount: number;
	confettiEnabled: boolean;
};

type Action =
	| { type: 'SET_RESULT'; payload: QuizResult }
	| { type: 'SET_POINTS_EARNED'; payload: number }
	| {
			type: 'SET_LEVEL_INFO';
			payload: {
				level: number;
				xpInCurrentLevel: number;
				xpForNextLevel: number;
				xpProgress: number;
			};
	  }
	| { type: 'SET_NEW_ACHIEVEMENT'; payload: string | null }
	| { type: 'SET_MISTAKE_COUNT'; payload: number }
	| { type: 'ENABLE_CONFETTI' }
	| { type: 'SET_SHOW_ANALYTICS'; payload: boolean };

const initialState: State = {
	showAnalytics: false,
	result: null,
	pointsEarned: 0,
	level: 1,
	xpInCurrentLevel: 0,
	xpForNextLevel: 0,
	xpProgress: 0,
	newAchievement: null,
	mistakeCount: 0,
	confettiEnabled: false,
};

function reducer(state: State, action: Action): State {
	switch (action.type) {
		case 'SET_RESULT':
			return { ...state, result: action.payload };
		case 'SET_POINTS_EARNED':
			return { ...state, pointsEarned: action.payload };
		case 'SET_LEVEL_INFO':
			return { ...state, ...action.payload };
		case 'SET_NEW_ACHIEVEMENT':
			return { ...state, newAchievement: action.payload };
		case 'SET_MISTAKE_COUNT':
			return { ...state, mistakeCount: action.payload };
		case 'ENABLE_CONFETTI':
			return { ...state, confettiEnabled: true };
		case 'SET_SHOW_ANALYTICS':
			return { ...state, showAnalytics: action.payload };
		default:
			return state;
	}
}

export default function LessonComplete() {
	const router = useRouter();
	const [state, dispatch] = useReducer(reducer, initialState);
	const { completeQuiz, isCompleting } = useQuizCompletion();
	const addActivity = useAiContextStore((s) => s.addActivity);

	useEffect(() => {
		async function loadResult() {
			const quizResult = useQuizResultStore.getState().get();
			if (!quizResult) {
				router.push('/dashboard');
				return;
			}

			dispatch({ type: 'SET_RESULT', payload: quizResult });
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
			dispatch({ type: 'SET_MISTAKE_COUNT', payload: mistakes.length });
			dispatch({ type: 'ENABLE_CONFETTI' });

			const completionResult = await completeQuiz({
				correctAnswers: quizResult.correctAnswers,
				totalQuestions: quizResult.totalQuestions,
				durationMinutes: Math.ceil(quizResult.durationSeconds / 60),
				difficulty: quizResult.difficulty,
				subjectId: quizResult.subjectId,
			});

			dispatch({ type: 'SET_POINTS_EARNED', payload: completionResult.pointsEarned });

			if (completionResult.newAchievements.length > 0) {
				dispatch({ type: 'SET_NEW_ACHIEVEMENT', payload: completionResult.newAchievements[0] });
			}

			const achievements = await getUserAchievements();
			const totalXp =
				achievements.unlocked.reduce((sum, a) => {
					const def = achievements.available.find((d) => d.id === a.achievementId);
					return sum + (def?.points || 0);
				}, 0) + completionResult.pointsEarned;

			const levelInfo = getLevelInfo(totalXp);
			dispatch({
				type: 'SET_LEVEL_INFO',
				payload: {
					level: levelInfo.level,
					xpInCurrentLevel: levelInfo.xpInCurrentLevel,
					xpForNextLevel: levelInfo.xpForNextLevel,
					xpProgress: levelInfo.progressPercent,
				},
			});
		}

		loadResult();
	}, [completeQuiz, router, addActivity]);

	if (!state.result) {
		return <LessonCompleteSkeleton />;
	}

	return (
		<div className="flex flex-col h-full bg-background">
			<ConfettiEffect enabled={state.confettiEnabled} />
			<SuccessHeader />

			<ScrollArea className="flex-1">
				<main className="px-6 py-4 flex flex-col items-center pb-32 max-w-2xl mx-auto w-full">
					<TrophySection accuracy={state.result.accuracy} />

					<m.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.4 }}
					>
						<StatsGrid
							result={state.result}
							pointsEarned={state.pointsEarned}
							isCompleting={isCompleting}
						/>
					</m.div>

					<AnimatePresence>
						{state.newAchievement && (
							<m.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.5 }}
							>
								<AchievementUnlocked achievement={state.newAchievement} />
							</m.div>
						)}
					</AnimatePresence>

					{state.mistakeCount > 0 && (
						<m.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.55 }}
						>
							<FlashcardGenerator mistakeCount={state.mistakeCount} />
						</m.div>
					)}

					{state.result.accuracy === 100 && state.mistakeCount === 0 && (
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
							level={state.level}
							xpInCurrentLevel={state.xpInCurrentLevel}
							xpForNextLevel={state.xpForNextLevel}
							xpProgress={state.xpProgress}
						/>
					</m.div>

					<m.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.7 }}
					>
						<ActionButtons
							onShowAnalytics={() => dispatch({ type: 'SET_SHOW_ANALYTICS', payload: true })}
						/>
					</m.div>
				</main>
			</ScrollArea>

			<QuizAnalyticsModal
				open={state.showAnalytics}
				onOpenChange={(open) => dispatch({ type: 'SET_SHOW_ANALYTICS', payload: open })}
			/>
		</div>
	);
}
