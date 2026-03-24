'use client';

import { cn } from '@/lib/utils';

interface FrustrationToggleProps {
	value: boolean | null;
	onChange: (value: boolean) => void;
	groupId: string;
}

export function FrustrationToggle({ value, onChange, groupId }: FrustrationToggleProps) {
	return (
		<fieldset className="space-y-3">
			<legend className="text-sm font-medium">Is this getting frustrating?</legend>
			<div className="flex gap-2" role="radiogroup" aria-labelledby={groupId}>
				<button
					type="button"
					onClick={() => onChange(true)}
					role="radio"
					aria-checked={value === true}
					className={cn(
						'flex-1 py-2 px-4 rounded-md border text-sm font-medium transition-colors',
						'hover:border-primary/50 hover:bg-primary/5',
						'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
						value === true
							? 'border-primary bg-primary/10 text-primary'
							: 'border-input bg-background'
					)}
				>
					Yes
				</button>
				<button
					type="button"
					onClick={() => onChange(false)}
					role="radio"
					aria-checked={value === false}
					className={cn(
						'flex-1 py-2 px-4 rounded-md border text-sm font-medium transition-colors',
						'hover:border-primary/50 hover:bg-primary/5',
						'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
						value === false
							? 'border-primary bg-primary/10 text-primary'
							: 'border-input bg-background'
					)}
				>
					No
				</button>
			</div>
		</fieldset>
	);
}
