'use client';

import { ArrowRight01Icon, Home01Icon, Idea01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface QuizFooterProps {
	isChecked: boolean;
	isCorrect: boolean | null;
	selectedOption: string | null;
	showHint: boolean;
	onToggleHint: () => void;
	onCheck: () => void;
	onExit: () => void;
	disabled?: boolean;
	isGrading?: boolean;
	hasAnswer?: boolean;
}

export function QuizFooter({
	isChecked,
	isCorrect,
	selectedOption,
	showHint,
	onToggleHint,
	onCheck,
	onExit,
	disabled,
	isGrading = false,
	hasAnswer = false,
}: QuizFooterProps) {
	const canSubmit = hasAnswer || selectedOption !== null;

	return (
		<m.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.3 }}
			className="fixed bottom-32 left-1/2 -translate-x-1/2 w-[90%] max-w-xl z-50 flex flex-col gap-3"
		>
			{!isChecked ? (
				<div className="flex gap-3">
					<button
						type="button"
						onClick={onToggleHint}
						disabled={disabled}
						className={cn(
							'p-4 rounded-3xl bg-secondary text-muted-foreground transition-all hover:bg-secondary/80 active:scale-95',
							showHint && 'bg-tiimo-yellow text-white shadow-lg'
						)}
					>
						<HugeiconsIcon icon={Idea01Icon} className="w-6 h-6" />
					</button>
					<Button
						size="lg"
						className={cn(
							'flex-1 rounded-[2rem] h-16 text-lg font-black shadow-lg bg-tiimo-lavender hover:bg-tiimo-lavender/90 text-white',
							(!canSubmit || isGrading) && 'opacity-50 cursor-not-allowed'
						)}
						disabled={!canSubmit || disabled || isGrading}
						onClick={onCheck}
					>
						{isGrading ? (
							<>
								Checking...
								<svg
									className="w-5 h-5 ml-2 animate-spin"
									viewBox="0 0 24 24"
									fill="none"
									role="img"
									aria-label="Checking answer"
								>
									<circle
										className="opacity-25"
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										strokeWidth="4"
									/>
									<path
										className="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
									/>
								</svg>
							</>
						) : (
							<>Check Answer</>
						)}
						{!isGrading && <HugeiconsIcon icon={ArrowRight01Icon} className="w-6 h-6 ml-2" />}
					</Button>
				</div>
			) : (
				<div className="flex gap-4">
					<Button
						variant="outline"
						size="lg"
						disabled={disabled}
						className={cn(
							'flex-1 rounded-[2rem] h-16 font-black uppercase tracking-widest text-[10px] bg-secondary border-none text-muted-foreground'
						)}
						onClick={onExit}
					>
						<HugeiconsIcon icon={Home01Icon} className="w-5 h-5 mr-2" />
						Exit
					</Button>
					<Button
						size="lg"
						disabled={disabled}
						className={cn(
							'flex-[2] rounded-[2rem] h-16 text-lg font-black shadow-lg text-white',
							isCorrect
								? 'bg-tiimo-green hover:bg-tiimo-green/90'
								: 'bg-tiimo-lavender hover:bg-tiimo-lavender/90'
						)}
						onClick={onCheck}
					>
						{isCorrect ? 'Continue' : 'Try Again'}
						<HugeiconsIcon icon={ArrowRight01Icon} className="w-6 h-6 ml-2" />
					</Button>
				</div>
			)}
		</m.div>
	);
}
