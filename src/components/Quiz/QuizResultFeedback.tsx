import {
	CheckmarkCircle02Icon,
	ForwardIcon,
	MessageSecure01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useRouter } from 'next/navigation';

('use client');

type QuizResultFeedbackProps = {
	showResult: boolean;
	isCorrect: boolean;
	correctAnswer?: string;
	correctMessage?: string;
	incorrectMessage?: string;
	questionText?: string;
	userAnswer?: string;
	topic?: string;
	subject?: string;
};

export function QuizResultFeedback({
	showResult,
	isCorrect,
	correctAnswer,
	correctMessage = 'Excellent understanding of the principles involved.',
	incorrectMessage,
	questionText,
	userAnswer,
	topic,
	subject,
}: QuizResultFeedbackProps) {
	const router = useRouter();

	if (!showResult) return null;

	const handleDiscussWithTutor = () => {
		const params = new URLSearchParams();
		if (questionText) params.set('question', questionText);
		if (topic) params.set('topic', topic);
		if (subject) params.set('subject', subject);
		if (userAnswer) {
			params.set(
				'context',
				`I got this question wrong. My answer was: "${userAnswer}". The correct answer is: "${correctAnswer}". Can you help me understand why I was wrong and explain the concept?`
			);
		}
		router.push(`/study-companion?${params.toString()}`);
	};

	return (
		<div
			className={`p-6 rounded-[2rem] border animate-in fade-in slide-in-from-bottom-4 ${
				isCorrect
					? 'bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-900/30'
					: 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30'
			}`}
		>
			<div className="flex items-start gap-4">
				<div
					className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
						isCorrect ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
					}`}
				>
					{isCorrect ? (
						<HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-5 h-5 text-green-600" />
					) : (
						<HugeiconsIcon icon={ForwardIcon} className="w-5 h-5 text-red-600" />
					)}
				</div>
				<div>
					<h4
						className={`font-black text-xs  tracking-widest mb-1 ${
							isCorrect ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100'
						}`}
					>
						{isCorrect ? 'Correct! Well done' : 'Not quite right'}
					</h4>
					<p
						className={`text-sm font-medium ${
							isCorrect
								? 'text-green-800/80 dark:text-green-200/80'
								: 'text-red-800/80 dark:text-red-200/80'
						}`}
					>
						{isCorrect
							? correctMessage
							: incorrectMessage ||
								(correctAnswer
									? `The correct answer is ${correctAnswer}. Let's review the hint.`
									: 'Try again!')}
					</p>
					{!isCorrect && (
						<button
							type="button"
							onClick={handleDiscussWithTutor}
							className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
						>
							<HugeiconsIcon icon={MessageSecure01Icon} className="w-4 h-4" />
							Discuss with Tutor
						</button>
					)}
				</div>
			</div>
		</div>
	);
}
