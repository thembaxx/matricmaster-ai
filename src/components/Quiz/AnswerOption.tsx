'use client';

import { CancelCircleIcon, CheckmarkCircle02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface AnswerOptionProps {
	id: string;
	label: string;
	isSelected: boolean;
	isCorrect: boolean;
	isChecked: boolean;
	onSelect: () => void;
	disabled?: boolean;
}

export function AnswerOption({
	id,
	label,
	isSelected,
	isCorrect,
	isChecked,
	onSelect,
	disabled = false,
}: AnswerOptionProps) {
	const getContainerClasses = () => {
		if (isSelected) {
			if (isChecked) {
				return isCorrect
					? 'bg-tiimo-green/10 border-tiimo-green'
					: 'bg-destructive/10 border-destructive';
			}
			return 'bg-tiimo-lavender/10 border-tiimo-lavender';
		}
		if (isChecked && isCorrect) {
			return 'bg-tiimo-green/10 border-tiimo-green';
		}
		return 'bg-card border-border/50 hover:border-tiimo-lavender/30';
	};

	const getIndicatorClasses = () => {
		if (isSelected) {
			if (isChecked) {
				return isCorrect ? 'bg-tiimo-green text-white' : 'bg-destructive text-white';
			}
			return 'bg-tiimo-lavender text-white';
		}
		if (isChecked && isCorrect) {
			return 'bg-tiimo-green text-white';
		}
		return 'bg-secondary text-muted-foreground';
	};

	const getLabelClasses = () => {
		if (isSelected && isChecked && !isCorrect) {
			return 'text-muted-foreground';
		}
		return 'text-foreground';
	};

	return (
		<m.button
			initial={{ opacity: 0, x: -10 }}
			animate={{ opacity: 1, x: 0 }}
			onClick={() => !disabled && onSelect()}
			disabled={disabled}
			className={cn(
				'w-full flex items-center gap-4 p-4 rounded-[1.5rem] border-2 transition-all',
				'hover:border-tiimo-lavender/30 active:scale-[0.98]',
				getContainerClasses()
			)}
		>
			<div
				className={cn(
					'w-12 h-12 rounded-xl flex items-center justify-center font-semibold text-lg transition-all',
					getIndicatorClasses()
				)}
			>
				{id}
			</div>
			<span className={cn('flex-1 text-left font-medium text-base', getLabelClasses())}>
				{label}
			</span>

			{isChecked && (isSelected || isCorrect) && (
				<m.div
					initial={{ scale: 0 }}
					animate={{ scale: 1 }}
					className={cn(
						'w-6 h-6 rounded-full flex items-center justify-center text-white',
						isCorrect ? 'bg-tiimo-green' : 'bg-destructive'
					)}
				>
					<HugeiconsIcon
						icon={isCorrect ? CheckmarkCircle02Icon : CancelCircleIcon}
						className="w-4 h-4"
					/>
				</m.div>
			)}
		</m.button>
	);
}
