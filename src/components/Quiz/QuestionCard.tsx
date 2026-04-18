'use client';

import { Flag02Icon, FlagIcon, Mortarboard01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { AnimatePresence, m } from 'framer-motion';
import { useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { DURATION, EASING } from '@/lib/animation-presets';
import type { ConfidenceLevel } from '@/types/quiz';
import { AnswerOption, type AnswerOptionProps } from './AnswerOption';
import { ConfidenceSelector } from './ConfidenceSelector';
import { InteractiveDiagram } from './InteractiveDiagram';
import { MisconceptionDialogue } from './MisconceptionDialogue';

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
	isFlagged?: boolean;
	onToggleFlag?: () => void;
	confidenceLevel: ConfidenceLevel | null;
	onSetConfidence: (level: ConfidenceLevel) => void;
	isConfidentError?: boolean;
	correctAnswerText?: string;
	selectedAnswerText?: string;
	subject?: string;
	topic?: string;
	onDismissConfidentError?: () => void;
}

const questionVariants = {
	initial: { opacity: 0, y: 8, filter: 'blur(4px)' },
	animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
	exit: { opacity: 0, y: -6, filter: 'blur(2px)' },
};

const questionTransition = {
	duration: DURATION.normal,
	ease: EASING.easeOut,
};

export function QuestionCard({
	question,
	questionKey,
	options,
	selectedOption,
	isChecked,
	onSelect,
	diagram,
	isFlagged = false,
	onToggleFlag,
	confidenceLevel,
	onSetConfidence,
	isConfidentError = false,
	correctAnswerText = '',
	selectedAnswerText = '',
	subject,
	topic,
	onDismissConfidentError,
}: QuestionCardProps) {
	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (isChecked) return;

			const currentIndex = options.findIndex((o) => o.id === selectedOption);
			let nextIndex = currentIndex;

			switch (e.key) {
				case 'ArrowDown':
				case 'ArrowRight':
					e.preventDefault();
					nextIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
					break;
				case 'ArrowUp':
				case 'ArrowLeft':
					e.preventDefault();
					nextIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
					break;
				case 'Enter':
				case ' ':
					if (selectedOption) {
						e.preventDefault();
						onSelect(selectedOption);
					}
					return;
				default:
					return;
			}

			if (nextIndex >= 0 && nextIndex < options.length) {
				onSelect(options[nextIndex].id);
			}
		},
		[options, selectedOption, isChecked, onSelect]
	);

	return (
		<m.div
			layout
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.1 }}
		>
			<Card className="shadow-lg border-border/50 p-8 sm:p-10">
				<div className="mb-8">
					<div className="flex items-center justify-between gap-2 mb-4">
						<div className="flex items-center gap-2">
							<div className="p-1.5 bg-tiimo-lavender/10 rounded-lg">
								<HugeiconsIcon icon={Mortarboard01Icon} className="w-4 h-4 text-tiimo-lavender" />
							</div>
							<span className="text-[10px] font-medium text-tiimo-lavender">Practice problem</span>
						</div>
						{onToggleFlag && (
							<button
								type="button"
								onClick={onToggleFlag}
								className="p-2 rounded-full hover:bg-muted/50 transition-colors"
								aria-label={isFlagged ? 'Unflag question' : 'Flag question for review'}
							>
								<HugeiconsIcon
									icon={isFlagged ? Flag02Icon : FlagIcon}
									className={`w-5 h-5 transition-colors ${
										isFlagged ? 'text-brand-orange' : 'text-muted-foreground/50'
									}`}
								/>
							</button>
						)}
					</div>

					<AnimatePresence mode="wait" initial={false}>
						<m.h2
							key={questionKey}
							variants={questionVariants}
							initial="initial"
							animate="animate"
							exit="exit"
							transition={questionTransition}
							className="text-xl font-question leading-tight text-foreground"
						>
							{question}
						</m.h2>
					</AnimatePresence>
				</div>

				{diagram && <InteractiveDiagram type={diagram} className="mb-10" />}

				<AnimatePresence mode="wait" initial={false}>
					<m.div
						key={`${questionKey}-options`}
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: DURATION.quick }}
					>
						<div
							role="radiogroup"
							aria-label="answer options"
							className="grid grid-cols-1 gap-3"
							onKeyDown={handleKeyDown}
						>
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
											duration: DURATION.normal,
											ease: EASING.smooth,
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

				{!isChecked && (
					<div className="mt-4">
						<ConfidenceSelector
							value={confidenceLevel}
							onChange={onSetConfidence}
							disabled={isChecked}
						/>
					</div>
				)}

				<AnimatePresence>
					{isChecked && isConfidentError && (
						<MisconceptionDialogue
							questionText={question}
							userAnswer={selectedAnswerText}
							correctAnswer={correctAnswerText}
							subject={subject}
							topic={topic}
							onDismiss={onDismissConfidentError ?? (() => {})}
						/>
					)}
				</AnimatePresence>
			</Card>
		</m.div>
	);
}
