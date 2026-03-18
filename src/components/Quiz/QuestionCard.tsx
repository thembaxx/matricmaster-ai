'use client';

import { Mortarboard01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import { AnswerOption, type AnswerOptionProps } from './AnswerOption';
import { InteractiveDiagram } from './InteractiveDiagram';

export interface QuestionOption {
	id: string;
	label: string;
	isCorrect: boolean;
}

interface QuestionCardProps {
	question: string;
	options: QuestionOption[];
	selectedOption: string | null;
	isChecked: boolean;
	onSelect: (id: string) => void;
	diagram?: string;
}

export function QuestionCard({
	question,
	options,
	selectedOption,
	isChecked,
	onSelect,
	diagram,
}: QuestionCardProps) {
	return (
		<m.div
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
					<h2 className="text-xl font-semibold leading-tight text-foreground">{question}</h2>
				</div>

				{diagram && <InteractiveDiagram type={diagram} className="mb-10" />}

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
								initial={{ opacity: 0, x: -10 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: index * 0.05 }}
							>
								<AnswerOption {...optionProps} />
							</m.div>
						);
					})}
				</div>
			</div>
		</m.div>
	);
}
