'use client';

import { m } from 'framer-motion';
import { Button } from '@/components/ui/button';

type MobileQuizFooterProps = {
	showCheckButton: boolean;
	selectedAnswer: string | null;
	hasMoreQuestions: boolean;
	primaryColor?: string;
	shadowColor?: string;
	onCheck: () => void;
	onNext: () => void;
};

export function MobileQuizFooter({
	showCheckButton,
	selectedAnswer,
	hasMoreQuestions,
	primaryColor = 'bg-foreground dark:bg-background text-background dark:text-foreground',
	shadowColor = 'shadow-zinc-900/10',
	onCheck,
	onNext,
}: MobileQuizFooterProps) {
	return (
		<m.footer
			initial={{ y: 50, opacity: 0 }}
			animate={{ y: 0, opacity: 1 }}
			transition={{ type: 'spring', stiffness: 300, damping: 30 }}
			className="fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-xl border-t border-border z-40 px-4 mobile-footer-safe"
		>
			<div className="max-w-2xl mx-auto w-full p-4">
				{showCheckButton ? (
					<m.div
						initial={{ scale: 0.95 }}
						animate={{ scale: 1 }}
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.98 }}
					>
						<Button
							className={`w-full h-14 rounded-[2rem] font-bold text-lg shadow-xl ${primaryColor} ${shadowColor} disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95`}
							disabled={!selectedAnswer}
							onClick={onCheck}
						>
							Check Answer
						</Button>
					</m.div>
				) : (
					<m.div
						initial={{ scale: 0.95 }}
						animate={{ scale: 1 }}
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.98 }}
					>
						<Button
							className={`w-full h-14 text-white rounded-[2rem] font-bold text-lg shadow-xl transition-all active:scale-95 ${primaryColor} ${shadowColor}`}
							onClick={onNext}
						>
							{hasMoreQuestions ? 'Next Question' : 'Finish Quiz'}
						</Button>
					</m.div>
				)}
			</div>
		</m.footer>
	);
}