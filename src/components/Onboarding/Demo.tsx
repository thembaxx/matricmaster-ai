import { motion } from 'motion/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { generateStudyPlan, MOCK_QUESTIONS } from '@/lib/onboarding/demo-logic';
import { cn } from '@/lib/utils';

export function DemoQuizScreen({
	selectedSubject,
	onComplete,
	results,
}: {
	selectedSubject: string;
	onComplete: (correctCount: number) => void;
	results: { questionId: string; isCorrect: boolean }[];
}) {
	const [currentStep, setCurrentStep] = useState(0);
	const questions = MOCK_QUESTIONS[selectedSubject] || MOCK_QUESTIONS.default;
	const currentQuestion = questions[currentStep];

	const handleAnswer = (index: number) => {
		const isCorrect = index === currentQuestion.correctAnswer;
		const newResults = [...results, { questionId: currentQuestion.id, isCorrect }];

		if (currentStep < questions.length - 1) {
			setCurrentStep((prev) => prev + 1);
		} else {
			const correctCount = newResults.filter((r) => r.isCorrect).length;
			onComplete(correctCount);
		}
	};

	return (
		<motion.div
			initial={{ opacity: 0, x: 50 }}
			animate={{ opacity: 1, x: 0 }}
			exit={{ opacity: 0, x: -50 }}
			className="w-full space-y-8"
		>
			<div className="text-center space-y-2">
				<h2 className="text-3xl font-bold tracking-tight">Let's test your knowledge.</h2>
				<p className="text-muted-foreground">
					Answer 3 quick questions to calibrate your personalized plan.
				</p>
			</div>

			<div className="relative w-full max-w-md mx-auto p-6 rounded-3xl bg-card border-2 border-border shadow-xl space-y-6">
				<div className="flex justify-between items-center">
					<span className="text-xs font-bold tracking-wider text-muted-foreground">
						question {currentStep + 1} of 3
					</span>
					<span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
						{currentQuestion.subject}
					</span>
				</div>

				<h3 className="text-xl font-semibold text-foreground leading-tight">
					{currentQuestion.question}
				</h3>

				<div className="grid gap-3">
					{currentQuestion.options.map((option, i) => (
						<button
							type="button"
							key={i}
							onClick={() => handleAnswer(i)}
							className="w-full p-4 text-left rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-all font-medium text-foreground"
						>
							{option}
						</button>
					))}
				</div>
			</div>

			<div className="flex justify-center">
				<div className="flex gap-2">
					{questions.map((_, i) => (
						<div
							key={i}
							className={cn(
								'h-1.5 w-8 rounded-full transition-colors',
								i === currentStep ? 'bg-primary' : i < currentStep ? 'bg-primary' : 'bg-muted'
							)}
						/>
					))}
				</div>
			</div>
		</motion.div>
	);
}

export function ValueDeliveryScreen({
	subject,
	correctCount,
	onContinue,
}: {
	subject: string;
	correctCount: number;
	onContinue: () => void;
}) {
	const plan = generateStudyPlan(subject, correctCount);

	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.9 }}
			animate={{ opacity: 1, scale: 1 }}
			exit={{ opacity: 0, scale: 0.9 }}
			className="w-full space-y-8"
		>
			<div className="text-center space-y-2">
				<h2 className="text-3xl font-bold tracking-tight">Your 1-Week Mastery Plan is ready!</h2>
				<p className="text-muted-foreground">
					We've calibrated this to your <span className="text-primary font-bold">{plan.level}</span>{' '}
					level.
				</p>
			</div>

			<div className="relative w-full max-w-md mx-auto p-6 rounded-3xl bg-card border-2 border-primary/30 shadow-2xl space-y-6 overflow-hidden">
				<div className="absolute top-0 right-0 p-4">
					<span className="text-xs font-bold tracking-wider bg-primary text-primary-foreground px-2 py-1 rounded-full">
						AI Generated
					</span>
				</div>

				<div className="space-y-4">
					{plan.days.map((day, i) => (
						<div
							key={i}
							className="flex gap-4 items-start p-3 rounded-xl hover:bg-muted/50 transition-colors"
						>
							<div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
								{i + 1}
							</div>
							<div className="flex-1">
								<div className="font-bold text-sm text-foreground">{day.focus}</div>
								<div className="text-xs text-muted-foreground">{day.task}</div>
							</div>
						</div>
					))}
				</div>
			</div>

			<div className="flex flex-col gap-3 w-full">
				<Button size="lg" className="h-14 text-lg shadow-lg shadow-primary/20" onClick={onContinue}>
					Save this plan for free
				</Button>
				<button
					type="button"
					className="text-sm text-muted-foreground hover:text-foreground transition-colors"
				>
					Share your goals with a study buddy
				</button>
			</div>
		</motion.div>
	);
}
