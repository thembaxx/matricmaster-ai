'use client';

import { CancelCircleIcon, CheckmarkCircle02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import { useId } from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const MAX_CHARS = 2000;

interface ShortAnswerInputProps {
	value: string;
	onChange: (value: string) => void;
	isChecked: boolean;
	isCorrect: boolean | null;
	disabled?: boolean;
}

export function ShortAnswerInput({
	value,
	onChange,
	isChecked,
	isCorrect,
	disabled = false,
}: ShortAnswerInputProps) {
	const id = useId();
	const charCount = value.length;
	const isOverLimit = charCount > MAX_CHARS;
	const displayCharCount = Math.min(charCount, MAX_CHARS);

	const inputClasses = cn(
		'w-full min-h-[120px] p-4 rounded-[1.5rem] border-2 bg-card text-foreground placeholder:text-muted-foreground resize-none transition-all',
		'focus:outline-none focus:ring-0',
		isChecked
			? isCorrect
				? 'border-tiimo-green bg-tiimo-green/5'
				: 'border-destructive bg-destructive/5'
			: 'border-border/50 focus:border-tiimo-lavender hover:border-tiimo-lavender/30',
		disabled && 'opacity-50 cursor-not-allowed'
	);

	return (
		<div className="space-y-3">
			<div className="relative">
				<Label htmlFor={id} className="sr-only">
					Your answer
				</Label>
				<textarea
					id={id}
					value={value}
					onChange={(e) => !disabled && onChange(e.target.value)}
					placeholder="Type your answer here..."
					disabled={disabled || isChecked}
					maxLength={MAX_CHARS + 100}
					className={inputClasses}
					aria-describedby={`${id}-counter`}
					aria-invalid={isOverLimit}
				/>
				{isChecked && value.trim().length > 0 && (
					<m.div
						initial={{ scale: 0.9, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						className={cn(
							'absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center',
							isCorrect ? 'bg-tiimo-green text-white' : 'bg-destructive text-white'
						)}
						aria-hidden="true"
					>
						<HugeiconsIcon
							icon={isCorrect ? CheckmarkCircle02Icon : CancelCircleIcon}
							className="w-5 h-5"
						/>
					</m.div>
				)}
			</div>

			<div
				id={`${id}-counter`}
				className={cn(
					'flex justify-end text-xs font-mono tabular-nums transition-colors',
					isOverLimit
						? 'text-destructive'
						: charCount > MAX_CHARS * 0.9
							? 'text-tiimo-yellow'
							: 'text-muted-foreground'
				)}
				aria-live="polite"
			>
				{displayCharCount}/{MAX_CHARS}
			</div>

			{!value.trim() && !isChecked && (
				<p className="text-xs text-muted-foreground flex items-center gap-1.5" role="alert">
					<span className="w-1 h-1 rounded-full bg-muted-foreground inline-block" />
					Please provide an answer
				</p>
			)}
		</div>
	);
}
