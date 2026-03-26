'use client';

import { createContext, useCallback, useContext, useRef } from 'react';

interface LiveRegionContextType {
	announce: (message: string, priority?: 'polite' | 'assertive') => void;
	clearAnnouncements: () => void;
}

const LiveRegionContext = createContext<LiveRegionContextType>({
	announce: () => {},
	clearAnnouncements: () => {},
});

export function useLiveRegionContext() {
	return useContext(LiveRegionContext);
}

export function LiveRegionProvider({ children }: { children: React.ReactNode }) {
	const politeRef = useRef<HTMLDivElement>(null);
	const assertiveRef = useRef<HTMLDivElement>(null);

	const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
		const target = priority === 'assertive' ? assertiveRef.current : politeRef.current;
		if (target) {
			// Clear first to ensure re-announcement of same message
			target.textContent = '';
			setTimeout(() => {
				target.textContent = message;
			}, 100);
		}
	}, []);

	const clearAnnouncements = useCallback(() => {
		if (politeRef.current) politeRef.current.textContent = '';
		if (assertiveRef.current) assertiveRef.current.textContent = '';
	}, []);

	return (
		<LiveRegionContext.Provider value={{ announce, clearAnnouncements }}>
			{children}

			{/* Polite announcements - waits for user to finish current task */}
			<div
				ref={politeRef}
				aria-live="polite"
				aria-atomic="true"
				className="sr-only"
				role="status"
			/>

			{/* Assertive announcements - interrupts current task */}
			<div
				ref={assertiveRef}
				aria-live="assertive"
				aria-atomic="true"
				className="sr-only"
				role="alert"
			/>
		</LiveRegionContext.Provider>
	);
}

/**
 * Hook for announcing quiz results to screen readers
 */
export function useQuizAnnouncements() {
	const { announce } = useLiveRegionContext();

	const announceResult = useCallback(
		(isCorrect: boolean, topic?: string) => {
			const message = isCorrect
				? 'Correct answer! Well done.'
				: `Incorrect answer. ${topic ? `Review ${topic} for improvement.` : 'Keep practicing!'}`;
			announce(message, 'polite');
		},
		[announce]
	);

	const announceScore = useCallback(
		(score: number, total: number) => {
			const percentage = Math.round((score / total) * 100);
			announce(
				`Quiz complete. You scored ${score} out of ${total}, that's ${percentage} percent.`,
				'assertive'
			);
		},
		[announce]
	);

	const announceQuestion = useCallback(
		(questionNumber: number, totalQuestions: number) => {
			announce(`Question ${questionNumber} of ${totalQuestions}`, 'polite');
		},
		[announce]
	);

	const announceTimeWarning = useCallback(
		(minutesRemaining: number) => {
			announce(`${minutesRemaining} minutes remaining`, 'assertive');
		},
		[announce]
	);

	return { announceResult, announceScore, announceQuestion, announceTimeWarning };
}

/**
 * Hook for announcing progress updates
 */
export function useProgressAnnouncements() {
	const { announce } = useLiveRegionContext();

	const announceProgress = useCallback(
		(current: number, total: number, itemName: string) => {
			announce(`${itemName} ${current} of ${total}`, 'polite');
		},
		[announce]
	);

	const announceCompletion = useCallback(
		(itemName: string) => {
			announce(`${itemName} complete`, 'polite');
		},
		[announce]
	);

	return { announceProgress, announceCompletion };
}

/**
 * Hook for announcing study streak and achievements
 */
export function useAchievementAnnouncements() {
	const { announce } = useLiveRegionContext();

	const announceStreak = useCallback(
		(days: number) => {
			if (days === 1) {
				announce("You've started a study streak! Come back tomorrow to continue.", 'polite');
			} else {
				announce(`Amazing! ${days} day study streak!`, 'assertive');
			}
		},
		[announce]
	);

	const announceAchievement = useCallback(
		(title: string, description: string) => {
			announce(`Achievement unlocked: ${title}. ${description}`, 'assertive');
		},
		[announce]
	);

	const announceLevelUp = useCallback(
		(newLevel: number) => {
			announce(`Level up! You're now level ${newLevel}`, 'assertive');
		},
		[announce]
	);

	return { announceStreak, announceAchievement, announceLevelUp };
}
