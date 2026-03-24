'use client';

import { memo } from 'react';
import { cn } from '@/lib/utils';

interface ProgressRingProps {
	progress: number;
	size?: number;
	strokeWidth?: number;
	children?: React.ReactNode;
	variant?: 'default' | 'success' | 'warning' | 'danger' | 'violet';
	className?: string;
	showPercentage?: boolean;
	animated?: boolean;
}

const variantColors = {
	default: {
		track: 'text-muted/20',
		progress: 'text-primary',
	},
	success: {
		track: 'text-accent-lime/20',
		progress: 'text-accent-lime',
	},
	warning: {
		track: 'text-brand-amber/20',
		progress: 'text-brand-amber',
	},
	danger: {
		track: 'text-primary-red/20',
		progress: 'text-primary-red',
	},
	violet: {
		track: 'text-primary-violet/20',
		progress: 'text-primary-violet',
	},
};

export const ProgressRing = memo(function ProgressRing({
	progress,
	size = 120,
	strokeWidth = 10,
	children,
	variant = 'default',
	className,
	showPercentage = false,
	animated = true,
}: ProgressRingProps) {
	const radius = (size - strokeWidth) / 2;
	const circumference = radius * 2 * Math.PI;
	const clampedProgress = Math.min(Math.max(progress, 0), 100);
	const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;
	const colors = variantColors[variant];

	return (
		<div className={cn('relative inline-flex items-center justify-center', className)}>
			<svg
				width={size}
				height={size}
				className="transform -rotate-90"
				role="img"
				aria-label={`Progress ring: ${Math.round(clampedProgress)}%`}
			>
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					stroke="currentColor"
					strokeWidth={strokeWidth}
					fill="transparent"
					className={colors.track}
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
					className={cn(colors.progress, animated && 'transition-all duration-500 ease-out')}
				/>
			</svg>
			<div className="absolute inset-0 flex items-center justify-center">
				{children ? (
					children
				) : showPercentage ? (
					<span className="text-lg font-black text-foreground tracking-tighter">
						{Math.round(clampedProgress)}%
					</span>
				) : null}
			</div>
		</div>
	);
});

interface ProgressRingWithLabelProps extends ProgressRingProps {
	label?: string;
	sublabel?: string;
}

export const ProgressRingWithLabel = memo(function ProgressRingWithLabel({
	label,
	sublabel,
	size = 120,
	...props
}: ProgressRingWithLabelProps) {
	return (
		<ProgressRing size={size} {...props}>
			<div className="flex flex-col items-center text-center px-2">
				{label && (
					<span className="text-xl font-black text-foreground tracking-tighter">{label}</span>
				)}
				{sublabel && (
					<span className="text-[9px] font-black text-muted-foreground  tracking-widest">
						{sublabel}
					</span>
				)}
			</div>
		</ProgressRing>
	);
});

export default ProgressRing;
