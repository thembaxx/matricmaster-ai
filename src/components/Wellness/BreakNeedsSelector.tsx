'use client';

import { cn } from '@/lib/utils';

type BreakOption = 'yes' | 'no' | 'suggestions';

interface BreakNeedsSelectorProps {
	value: BreakOption | null;
	onChange: (value: BreakOption) => void;
	groupId: string;
}

export function BreakNeedsSelector({ value, onChange, groupId }: BreakNeedsSelectorProps) {
	const options: { value: BreakOption; label: string }[] = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' },
		{ value: 'suggestions', label: 'Suggestions' },
	];

	return (
		<fieldset className="space-y-3">
			<legend className="text-sm font-medium">Need a break?</legend>
			<div className="flex flex-wrap gap-2" role="radiogroup" aria-labelledby={groupId}>
				{options.map((option) => (
					<button
						key={option.value}
						type="button"
						onClick={() => onChange(option.value)}
						role="radio"
						aria-checked={value === option.value}
						className={cn(
							'flex-1 py-2 px-4 rounded-md border text-sm font-medium transition-colors min-w-[80px]',
							'hover:border-primary/50 hover:bg-primary/5',
							'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
							value === option.value
								? 'border-primary bg-primary/10 text-primary'
								: 'border-input bg-background'
						)}
					>
						{option.label}
					</button>
				))}
			</div>
		</fieldset>
	);
}
