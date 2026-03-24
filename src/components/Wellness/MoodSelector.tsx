'use client';

import { Heart, RefreshCw, Sun, Thermometer, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const MOOD_OPTIONS = [
	{ value: 1, label: 'Struggling', icon: Thermometer },
	{ value: 2, label: 'Difficult', icon: Volume2 },
	{ value: 3, label: 'Okay', icon: Sun },
	{ value: 4, label: 'Good', icon: Heart },
	{ value: 5, label: 'Great', icon: RefreshCw },
];

interface MoodSelectorProps {
	value: number | null;
	onChange: (value: number) => void;
	groupId: string;
}

export function MoodSelector({ value, onChange, groupId }: MoodSelectorProps) {
	return (
		<fieldset className="space-y-3">
			<legend className="text-sm font-medium">How are you feeling?</legend>
			<div className="flex justify-between gap-2" role="radiogroup" aria-labelledby={groupId}>
				{MOOD_OPTIONS.map((option) => {
					const Icon = option.icon;
					const isSelected = value === option.value;
					return (
						<button
							key={option.value}
							type="button"
							onClick={() => onChange(option.value)}
							role="radio"
							aria-checked={isSelected}
							aria-label={option.label}
							className={cn(
								'flex flex-col items-center gap-1 p-3 rounded-lg border transition-all',
								'hover:border-primary/50 hover:bg-primary/5',
								'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
								isSelected && 'border-primary bg-primary/10 ring-1 ring-primary'
							)}
						>
							<Icon
								className={cn('h-6 w-6', isSelected ? 'text-primary' : 'text-muted-foreground')}
							/>
							<span className="text-xs text-muted-foreground">{option.label}</span>
						</button>
					);
				})}
			</div>
		</fieldset>
	);
}
