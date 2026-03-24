'use client';

import { ArrowRight01Icon, Home01Icon, Idea01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { AnimatePresence, m } from 'framer-motion';
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
			initial={{ opacity: 0, y: 30, scale: 0.96 }}
			animate={{ opacity: 1, y: 0, scale: 1 }}
			transition={{ type: 'spring', stiffness: 200, damping: 20 }}
			className="fixed bottom-32 left-1/2 -translate-x-1/2 w-[90%] max-w-xl z-50 flex flex-col gap-3"
		>
			<AnimatePresence mode="wait">
				{!isChecked ? (
					<m.div
						key="check"
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.95 }}
						transition={{ duration: 0.15 }}
						className="flex gap-3"
					>
						<m.button
							type="button"
							onClick={onToggleHint}
							disabled={disabled}
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							transition={{ type: 'spring', stiffness: 400, damping: 17 }}
							className={cn(
								'p-4 rounded-3xl bg-secondary text-muted-foreground transition-all hover:bg-secondary/80',
								showHint && 'bg-tiimo-yellow text-white shadow-lg'
							)}
						>
							<HugeiconsIcon icon={Idea01Icon} className="w-6 h-6" />
						</m.button>
						<m.div whileTap={{ scale: 0.97 }} className="flex-1">
							<Button
								size="lg"
								className={cn(
									'w-full rounded-[2rem] h-16 text-lg font-black shadow-lg bg-tiimo-lavender hover:bg-tiimo-lavender/90 text-white transition-colors duration-300',
									(!canSubmit || isGrading) && 'opacity-50 cursor-not-allowed'
								)}
								disabled={!canSubmit || disabled || isGrading}
								onClick={onCheck}
							>
								<AnimatePresence mode="wait">
									{isGrading ? (
										<m.span
											key="grading"
											initial={{ opacity: 0, filter: 'blur(4px)' }}
											animate={{ opacity: 1, filter: 'blur(0px)' }}
											exit={{ opacity: 0, filter: 'blur(4px)' }}
											transition={{ duration: 0.15 }}
											className="flex items-center"
										>
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
										</m.span>
									) : (
										<m.span
											key="check"
											initial={{ opacity: 0, filter: 'blur(4px)' }}
											animate={{ opacity: 1, filter: 'blur(0px)' }}
											exit={{ opacity: 0, filter: 'blur(4px)' }}
											transition={{ duration: 0.15 }}
											className="flex items-center"
										>
											Check Answer
											<HugeiconsIcon icon={ArrowRight01Icon} className="w-6 h-6 ml-2" />
										</m.span>
									)}
								</AnimatePresence>
							</Button>
						</m.div>
					</m.div>
				) : (
					<m.div
						key="result"
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.95 }}
						transition={{ duration: 0.15 }}
						className="flex gap-4"
					>
						<m.div whileTap={{ scale: 0.97 }} className="flex-1">
							<Button
								variant="outline"
								size="lg"
								disabled={disabled}
								className="w-full rounded-[2rem] h-16 font-black tracking-widest text-[10px] bg-secondary border-none text-muted-foreground transition-colors duration-300"
								onClick={onExit}
							>
								<HugeiconsIcon icon={Home01Icon} className="w-5 h-5 mr-2" />
								Exit
							</Button>
						</m.div>
						<m.div whileTap={{ scale: 0.97 }} className="flex-[2]">
							<AnimatePresence mode="wait">
								<m.div
									key={isCorrect ? 'continue' : 'try-again'}
									initial={{ opacity: 0, scale: 0.95 }}
									animate={{ opacity: 1, scale: 1 }}
									exit={{ opacity: 0, scale: 0.95 }}
									transition={{ type: 'spring', stiffness: 300, damping: 20 }}
								>
									<Button
										size="lg"
										disabled={disabled}
										className={cn(
											'w-full rounded-[2rem] h-16 text-lg font-black shadow-lg text-white transition-colors duration-300',
											isCorrect
												? 'bg-tiimo-green hover:bg-tiimo-green/90'
												: 'bg-tiimo-lavender hover:bg-tiimo-lavender/90'
										)}
										onClick={onCheck}
									>
										{isCorrect ? 'Continue' : 'Try Again'}
										<HugeiconsIcon icon={ArrowRight01Icon} className="w-6 h-6 ml-2" />
									</Button>
								</m.div>
							</AnimatePresence>
						</m.div>
					</m.div>
				)}
			</AnimatePresence>
		</m.div>
	);
}
