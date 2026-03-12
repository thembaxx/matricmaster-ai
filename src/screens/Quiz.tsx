'use client';

import {
	AiBrain01Icon,
	BookOpen01Icon,
	CalculatorIcon,
	CheckmarkCircle02Icon,
} from '@hugeicons/core-free-icons';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { FocusContent } from '@/components/Layout/FocusContent';
import { TimelineSidebar } from '@/components/Layout/TimelineSidebar';
import { QuestionCard, type QuestionOption } from '@/components/Quiz/QuestionCardV2';
import { QuizActions } from '@/components/Quiz/QuizActionsV2';
import { QuizHeader } from '@/components/Quiz/QuizHeaderV2';
import { QuizProgress, type QuizStep } from '@/components/Quiz/QuizProgressV2';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQuizResultStore } from '@/stores/useQuizResultStore';

const QUIZ_STEPS: QuizStep[] = [
	{ id: '1', icon: BookOpen01Icon, title: 'Review', status: 'completed' },
	{ id: '2', icon: CalculatorIcon, title: 'Problem', status: 'current' },
	{ id: '3', icon: AiBrain01Icon, title: 'Practice', status: 'upcoming' },
	{ id: '4', icon: CheckmarkCircle02Icon, title: 'Done', status: 'upcoming' },
];

const QUESTION_OPTIONS: QuestionOption[] = [
	{ id: 'A', label: '(1, 0)', isCorrect: false },
	{ id: 'B', label: '(-1, 4)', isCorrect: true },
	{ id: 'C', label: '(0, 2)', isCorrect: false },
	{ id: 'D', label: '(1, 4)', isCorrect: false },
];

export default function Quiz() {
	const router = useRouter();
	const startTimeRef = useRef<number>(Date.now());
	const [selectedOption, setSelectedOption] = useState<string | null>(null);
	const [isChecked, setIsChecked] = useState<boolean>(false);
	const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
	const [elapsedSeconds, setElapsedSeconds] = useState(0);
	const [showHint, setShowHint] = useState(false);

	useEffect(() => {
		const timer = setInterval(() => {
			setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
		}, 1000);
		return () => clearInterval(timer);
	}, []);

	const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

	const handleCheck = () => {
		if (isChecked) {
			if (isCorrect) {
				useQuizResultStore.getState().save({
					correctAnswers: 1,
					totalQuestions: 1,
					durationSeconds: elapsedSeconds,
					accuracy: 100,
					subjectName: 'Mathematics',
					subjectId: 2,
					difficulty: 'medium',
					topic: 'Algebra',
					completedAt: new Date(),
				});
				router.push('/lesson-complete');
			} else {
				setIsChecked(false);
				setIsCorrect(null);
				setSelectedOption(null);
			}
			return;
		}
		const correct = QUESTION_OPTIONS.find((o) => o.id === selectedOption)?.isCorrect || false;
		setIsCorrect(correct);
		setIsChecked(true);
	};

	return (
		<div className="min-h-screen bg-background flex">
			<TimelineSidebar />
			<FocusContent>
				<div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					<QuizHeader
						title="Calculus"
						subtitle="Mathematics P1 • NSC"
						elapsedTime={formatTime(elapsedSeconds)}
					/>
					<QuizProgress steps={QUIZ_STEPS} progressPercent={50} />

					<ScrollArea className="h-[calc(100vh-320px)] no-scrollbar pr-4">
						<div className="space-y-8 pb-32">
							<QuestionCard
								question="Find the coordinates of the local maximum for the function f(x) = x³ - 3x + 2"
								options={QUESTION_OPTIONS}
								selectedOption={selectedOption}
								isChecked={isChecked}
								onSelect={setSelectedOption}
							/>
						</div>
					</ScrollArea>

					<QuizActions
						isChecked={isChecked}
						isCorrect={isCorrect}
						selectedOption={selectedOption}
						showHint={showHint}
						onToggleHint={() => setShowHint(!showHint)}
						onCheck={handleCheck}
						onExit={() => router.push('/dashboard')}
					/>
				</div>
			</FocusContent>
		</div>
	);
}
