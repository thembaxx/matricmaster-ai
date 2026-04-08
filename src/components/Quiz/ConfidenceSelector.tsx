'use client';

import { cn } from '@/lib/utils';
import type { ConfidenceLevel } from '@/types/quiz';

interface ConfidenceSelectorProps {
	value: ConfidenceLevel | null;
	onChange: (level: ConfidenceLevel) => void;
	disabled?: boolean;
}

const levels: Array<{ key: ConfidenceLevel; label: string; color: string; activeColor: string }> = [
	{
		key: 'low',
		label: 'low',
		color: 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200',
		activeColor: 'bg-gray-500 text-white border-gray-500 shadow-sm',
	},
	{
		key: 'medium',
		label: 'medium',
		color: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
		activeColor: 'bg-amber-500 text-white border-amber-500 shadow-sm',
	},
	{
		key: 'high',
		label: 'high',
		color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
		activeColor: 'bg-emerald-500 text-white border-emerald-500 shadow-sm',
	},
];

export function ConfidenceSelector({ value, onChange, disabled = false }: ConfidenceSelectorProps) {
	return (
		<div className="flex items-center gap-2">
			<span className="text-xs font-medium text-muted-foreground mr-1">confidence:</span>
			{levels.map((level) => (
				<button
					key={level.key}
					type="button"
					disabled={disabled}
					onClick={() => onChange(level.key)}
					className={cn(
						'px-3 py-1 text-xs font-medium rounded-full border transition-all duration-200',
						value === level.key ? level.activeColor : level.color,
						disabled && 'opacity-50 cursor-not-allowed'
					)}
				>
					{level.label}
				</button>
			))}
		</div>
	);
}
