import {
	CheckmarkCircle02Icon,
	ForwardIcon,
	MapPinpoint02Icon,
	MessageSecure01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useRouter } from 'next/navigation';
import { getMapLinkForTopic, isGeographySubject } from '@/lib/geography-map-links';

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

	// Bridge: Maps → Quiz - check if this is a geography question with a map view
	const mapLink = isGeographySubject(subject) && topic ? getMapLinkForTopic(topic) : null;

	return (
		<div
			className={`p-6 rounded-[2rem] border animate-in fade-in slide-in-from-bottom-4 ${
				isCorrect
					? 'bg-tiimo-green/10 border-tiimo-green/30'
					: 'bg-destructive/10 border-destructive/30'
			}`}
		>
			<div className="flex items-start gap-4">
				<div
					className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
						isCorrect ? 'bg-tiimo-green/20' : 'bg-destructive/20'
					}`}
				>
					{isCorrect ? (
						<HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-5 h-5 text-tiimo-green" />
					) : (
						<HugeiconsIcon icon={ForwardIcon} className="w-5 h-5 text-destructive" />
					)}
				</div>
				<div>
					<h4
						className={`font-black text-xs tracking-widest mb-1 ${
							isCorrect ? 'text-tiimo-green' : 'text-destructive'
						}`}
					>
						{isCorrect ? 'Correct! Well done' : 'Not quite right'}
					</h4>
					<p
						className={`text-sm font-medium ${
							isCorrect ? 'text-foreground/80' : 'text-foreground/80'
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
							className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg"
						>
							<HugeiconsIcon icon={MessageSecure01Icon} className="w-4 h-4" />
							Discuss with Tutor
						</button>
					)}
					{mapLink && (
						<button
							type="button"
							onClick={() => router.push(mapLink.mapRoute)}
							className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg"
						>
							<HugeiconsIcon icon={MapPinpoint02Icon} className="w-4 h-4" />
							{mapLink.label}
						</button>
					)}
				</div>
			</div>
		</div>
	);
}
