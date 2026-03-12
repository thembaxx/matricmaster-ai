'use client';

import { ArrowRight01Icon, Home01Icon, Idea01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface QuizActionsProps {
	isChecked: boolean;
	isCorrect: boolean | null;
	selectedOption: string | null;
	showHint: boolean;
	onToggleHint: () => void;
	onCheck: () => void;
	onExit: () => void;
}

export function QuizActions({
	isChecked,
	isCorrect,
	selectedOption,
	showHint,
	onToggleHint,
	onCheck,
	onExit,
}: QuizActionsProps) {
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
						className={cn(
							'p-4 rounded-3xl bg-secondary text-tiimo-gray-muted transition-all tiimo-press',
							showHint && 'bg-tiimo-yellow text-white shadow-tiimo'
						)}
					>
						<HugeiconsIcon icon={Idea01Icon} className="w-6 h-6" />
					</button>
					<Button
						size="lg"
						className="flex-1 rounded-[2rem] h-16 text-lg font-black shadow-tiimo tiimo-press bg-tiimo-lavender hover:bg-tiimo-lavender/90 text-white"
						disabled={!selectedOption}
						onClick={onCheck}
					>
						Check Answer
						<HugeiconsIcon icon={ArrowRight01Icon} className="w-6 h-6 ml-2" />
					</Button>
				</div>
			) : (
				<div className="flex gap-4">
					<Button
						variant="outline"
						size="lg"
						className="flex-1 rounded-[2rem] h-16 font-black uppercase tracking-widest text-[10px] bg-secondary border-none tiimo-press text-tiimo-gray-muted"
						onClick={onExit}
					>
						<HugeiconsIcon icon={Home01Icon} className="w-5 h-5 mr-2" />
						Exit
					</Button>
					<Button
						size="lg"
						className={cn(
							'flex-[2] rounded-[2rem] h-16 text-lg font-black shadow-tiimo tiimo-press text-white',
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
