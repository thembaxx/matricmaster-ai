'use client';

import { cn } from '@/lib/utils';

interface ProgressRingProps {
	progress: number;
	size?: number;
	strokeWidth?: number;
	children?: React.ReactNode;
	className?: string;
}

export function ProgressRing({
	progress,
	size = 200,
	strokeWidth = 12,
	children,
	className,
}: ProgressRingProps) {
	const radius = (size - strokeWidth) / 2;
	const circumference = radius * 2 * Math.PI;
	const strokeDashoffset = circumference - (progress / 100) * circumference;

	return (
		<div className={cn('relative inline-flex items-center justify-center', className)}>
			<svg width={size} height={size} className="transform -rotate-90">
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					stroke="currentColor"
					strokeWidth={strokeWidth}
					fill="transparent"
					className="text-muted/20"
				/>
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					stroke="currentColor"
					strokeWidth={strokeWidth}
					fill="transparent"
					strokeLinecap="round"
					strokeDasharray={circumference}
					strokeDashoffset={strokeDashoffset}
					className="text-primary transition-all duration-500 ease-out"
				/>
			</svg>
			<div className="absolute inset-0 flex items-center justify-center">{children}</div>
		</div>
	);
}
