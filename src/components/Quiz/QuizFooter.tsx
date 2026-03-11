'use client';

import { HelpCircleIcon as Question } from 'hugeicons-react';
import { m } from 'framer-motion';
import { Button } from '@/components/ui/button';

type QuizFooterProps = {
	selectedOption: string | null;
	isChecked: boolean;
	isCorrect: boolean;
	hasMoreQuestions: boolean;
	onCheck: () => void;
	onNext: () => void;
	onReport?: () => void;
	onShowSolution?: () => void;
};

export function QuizFooter({
	selectedOption,
	isChecked,
	isCorrect,
	hasMoreQuestions,
	onCheck,
	onNext,
	onReport,
	onShowSolution,
}: QuizFooterProps) {
	const getButtonState = () => {
		if (!selectedOption) {
			return {
				text: 'Check Answer',
				className: 'bg-muted text-muted-foreground cursor-not-allowed',
				disabled: true,
			};
		}
		if (!isChecked) {
			return {
				text: 'Check Answer',
				className: 'bg-primary text-primary-foreground hover:opacity-90 shadow-primary/20',
				disabled: false,
			};
		}
		if (isCorrect) {
			return {
				text: hasMoreQuestions ? 'Continue' : 'Finish',
				className: 'bg-brand-green hover:bg-brand-green/80 text-white shadow-brand-green/20',
				disabled: false,
			};
		}
		return {
			text: 'Try Again',
			className: 'bg-brand-red hover:bg-red-600 text-white shadow-brand-red/20',
			disabled: false,
		};
	};

	const buttonState = getButtonState();

	return (
		<m.footer
			initial={{ y: 100 }}
			animate={{ y: 0 }}
			transition={{ type: 'spring', stiffness: 200, damping: 30 }}
			className="absolute bottom-0 left-0 right-0 bg-card/80 backdrop-blur-xl p-8 z-30 border-t border-border"
		>
			<div className="max-w-2xl mx-auto w-full space-y-6">
				{(onReport || onShowSolution) && (
					<div className="flex justify-between items-center px-2">
						{onReport && (
							<button
								type="button"
								onClick={onReport}
								className="flex items-center gap-2.5 text-muted-foreground font-black text-[10px] uppercase tracking-widest hover:text-foreground transition-colors min-h-[44px]"
								aria-label="Report issue with this question"
							>
								<span className="w-5 h-5 bg-muted rounded-lg flex items-center justify-center">
									?
								</span>
								Report Issue
							</button>
						)}
						{onShowSolution && (
							<button
								type="button"
								onClick={onShowSolution}
								className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest hover:text-primary/80 transition-colors min-h-[44px]"
								aria-label="Show solution"
							>
								<Question className="w-4 h-4" />
								Show Solution
							</button>
						)}
					</div>
				)}

				<m.div
					whileHover={selectedOption ? { scale: 1.02 } : {}}
					whileTap={selectedOption ? { scale: 0.98 } : {}}
				>
					<Button
						size="lg"
						onClick={isChecked ? onNext : onCheck}
						className={`w-full h-16 rounded-[2rem] text-lg font-black shadow-2xl transition-all ${buttonState.className}`}
						disabled={buttonState.disabled}
					>
						{buttonState.text}
					</Button>
				</m.div>
			</div>
		</m.footer>
	);
}

type SimpleQuizFooterProps = {
	showCheckButton: boolean;
	selectedAnswer: string | null;
	hasMoreQuestions: boolean;
	primaryColor?: string;
	shadowColor?: string;
	onCheck: () => void;
	onNext: () => void;
};

export function SimpleQuizFooter({
	showCheckButton,
	selectedAnswer,
	hasMoreQuestions,
	primaryColor = 'bg-foreground dark:bg-background text-background dark:text-foreground',
	shadowColor = 'shadow-zinc-900/10',
	onCheck,
	onNext,
}: SimpleQuizFooterProps) {
	return (
		<footer className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-xl border-t border-border z-30">
			<div className="max-w-2xl mx-auto w-full p-4 sm:p-6 flex gap-4">
				{showCheckButton ? (
					<Button
						className={`flex-1 h-16 rounded-[2rem] font-bold text-lg shadow-xl ${primaryColor} ${shadowColor} disabled:opacity-50 transition-all active:scale-95`}
						disabled={!selectedAnswer}
						onClick={onCheck}
					>
						Check Answer
					</Button>
				) : (
					<Button
						className={`flex-1 h-16 text-white rounded-[2rem] font-bold text-lg shadow-xl transition-all active:scale-95 ${primaryColor} ${shadowColor}`}
						onClick={onNext}
					>
						{hasMoreQuestions ? 'Next Question' : 'Finish Quiz'}
					</Button>
				)}
			</div>
		</footer>
	);
}
