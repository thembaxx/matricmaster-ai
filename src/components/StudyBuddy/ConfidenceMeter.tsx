'use client';

import { Progress } from '@/components/ui/progress';

interface ConfidenceMeterProps {
	score: number;
	label?: string;
	showValue?: boolean;
	size?: 'sm' | 'md' | 'lg';
}

export function ConfidenceMeter({
	score,
	label,
	showValue = true,
	size = 'md',
}: ConfidenceMeterProps) {
	const percentage = Math.round(score * 100);

	const getColor = (s: number) => {
		if (s >= 0.8) return 'bg-green-500';
		if (s >= 0.5) return 'bg-yellow-500';
		return 'bg-red-500';
	};

	const getHeight = () => {
		switch (size) {
			case 'sm':
				return 'h-1';
			case 'lg':
				return 'h-4';
			default:
				return 'h-2';
		}
	};

	return (
		<div className="space-y-1">
			{label && (
				<div className="flex justify-between text-xs">
					<span className="text-muted-foreground">{label}</span>
					{showValue && <span className="font-medium">{percentage}%</span>}
				</div>
			)}
			<Progress
				value={percentage}
				className={`${getHeight()} rounded-full`}
				indicatorClassName={getColor(score)}
			/>
		</div>
	);
}
