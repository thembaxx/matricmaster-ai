'use client';

import { cn } from '@/lib/utils';

interface ProgressRingProps {
	progress: number;
	size?: number;
	strokeWidth?: number;
	className?: string;
	showLabel?: boolean;
}

export function ProgressRing({
	progress,
	size = 60,
	strokeWidth = 6,
	className,
	showLabel = true,
}: ProgressRingProps) {
	const radius = (size - strokeWidth) / 2;
	const circumference = radius * 2 * Math.PI;
	const offset = circumference - (progress / 100) * circumference;

	const getColor = () => {
		if (progress >= 100) return 'text-success';
		if (progress >= 60) return 'text-primary';
		if (progress > 0) return 'text-warning';
		return 'text-muted-foreground';
	};

	return (
		<div className={cn('relative inline-flex items-center justify-center', className)}>
			<svg width={size} height={size} className="transform -rotate-90" aria-hidden="true">
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					stroke="currentColor"
					strokeWidth={strokeWidth}
					fill="none"
					className="text-muted/20"
				/>
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					stroke="currentColor"
					strokeWidth={strokeWidth}
					fill="none"
					strokeDasharray={circumference}
					strokeDashoffset={offset}
					strokeLinecap="round"
					className={cn('transition-all duration-500', getColor())}
				/>
			</svg>
			{showLabel && <span className="absolute text-xs font-bold">{Math.round(progress)}%</span>}
		</div>
	);
}

interface MiniProgressRingProps {
	progress: number;
	className?: string;
}

export function MiniProgressRing({ progress, className }: MiniProgressRingProps) {
	return (
		<ProgressRing
			progress={progress}
			size={24}
			strokeWidth={3}
			showLabel={false}
			className={className}
		/>
	);
}
