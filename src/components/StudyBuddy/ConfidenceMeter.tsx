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
		if (s >= 0.8) return 'bg-success';
		if (s >= 0.5) return 'bg-warning';
		return 'bg-destructive';
	};

	const getLabelColor = (s: number) => {
		if (s >= 0.8) return 'text-success';
		if (s >= 0.5) return 'text-warning';
		return 'text-destructive';
	};

	const getHeight = () => {
		switch (size) {
			case 'sm':
				return 'h-1.5';
			case 'lg':
				return 'h-3';
			default:
				return 'h-2';
		}
	};

	const getTextSize = () => {
		switch (size) {
			case 'sm':
				return 'text-[10px]';
			case 'lg':
				return 'text-sm';
			default:
				return 'text-xs';
		}
	};

	return (
		<div className="space-y-1.5">
			{label && (
				<div className="flex justify-between items-center">
					<span className={`${getTextSize()} text-muted-foreground`}>{label}</span>
					{showValue && (
						<span className={`font-semibold ${getLabelColor(score)} ${getTextSize()}`}>
							{percentage}%
						</span>
					)}
				</div>
			)}
			{!label && showValue && (
				<div className="flex justify-end">
					<span className={`font-semibold ${getLabelColor(score)} ${getTextSize()}`}>
						{percentage}%
					</span>
				</div>
			)}
			<Progress
				value={percentage}
				className={`${getHeight()} rounded-full bg-secondary`}
				indicatorClassName={`rounded-full ${getColor(score)} transition-all duration-500`}
			/>
		</div>
	);
}
