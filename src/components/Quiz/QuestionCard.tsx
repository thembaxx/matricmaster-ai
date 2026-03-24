'use client';

import { Mortarboard01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { AnimatePresence, m } from 'framer-motion';
import { AnswerOption, type AnswerOptionProps } from './AnswerOption';
import { InteractiveDiagram } from './InteractiveDiagram';

export interface QuestionOption {
	id: string;
	label: string;
	isCorrect: boolean;
}

interface QuestionCardProps {
	question: string;
	questionKey: string;
	options: QuestionOption[];
	selectedOption: string | null;
	isChecked: boolean;
	onSelect: (id: string) => void;
	diagram?: string;
}

const questionVariants = {
	initial: { opacity: 0, y: 8, filter: 'blur(4px)' },
	animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
	exit: { opacity: 0, y: -6, filter: 'blur(2px)' },
};

const questionTransition = {
	duration: 0.35,
	ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
};

export function QuestionCard({
	question,
	questionKey,
	options,
	selectedOption,
	isChecked,
	onSelect,
	diagram,
}: QuestionCardProps) {
	return (
		<m.div
			layout
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.1 }}
		>
			<div className="bg-card rounded-[2.5rem] shadow-lg border border-border/50 p-8 sm:p-10">
				<div className="mb-8">
					<div className="flex items-center gap-2 mb-4">
						<div className="p-1.5 bg-tiimo-lavender/10 rounded-lg">
							<HugeiconsIcon icon={Mortarboard01Icon} className="w-4 h-4 text-tiimo-lavender" />
						</div>
						<span className="text-[10px] font-medium text-tiimo-lavender">Practice problem</span>
					</div>

					<AnimatePresence mode="wait">
						<m.h2
							key={questionKey}
							variants={questionVariants}
							initial="initial"
							animate="animate"
							exit="exit"
							transition={questionTransition}
							className="text-xl font-semibold leading-tight text-foreground"
						>
							{question}
						</m.h2>
					</AnimatePresence>
				</div>

				{diagram && <InteractiveDiagram type={diagram} className="mb-10" />}

				<AnimatePresence mode="wait">
					<m.div
						key={`${questionKey}-options`}
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2 }}
					>
						<div className="grid grid-cols-1 gap-3">
							{options.map((option, index) => {
								const optionProps: AnswerOptionProps = {
									id: option.id,
									label: option.label,
									isSelected: selectedOption === option.id,
									isCorrect: option.isCorrect,
									isChecked,
									onSelect: () => onSelect(option.id),
									disabled: isChecked,
								};

								return (
									<m.div
										key={option.id}
										initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
										animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
										exit={{ opacity: 0, y: -6, filter: 'blur(2px)' }}
										transition={{
											duration: 0.35,
											ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
											delay: 0.06 * index,
										}}
									>
										<AnswerOption {...optionProps} />
									</m.div>
								);
							})}
						</div>
					</m.div>
				</AnimatePresence>
			</div>
		</m.div>
	);
}
