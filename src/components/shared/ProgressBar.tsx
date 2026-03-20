'use client';

import { memo } from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
	value: number;
	max?: number;
	showPercentage?: boolean;
	size?: 'sm' | 'md' | 'lg';
	variant?: 'default' | 'success' | 'warning' | 'danger';
	label?: string;
	showLabel?: boolean;
	animated?: boolean;
	className?: string;
	barClassName?: string;
}

const variantStyles = {
	default: 'bg-primary',
	success: 'bg-accent-lime',
	warning: 'bg-brand-amber',
	danger: 'bg-primary-red',
};

const sizeStyles = {
	sm: 'h-1.5',
	md: 'h-2.5',
	lg: 'h-4',
};

const percentageColors = {
	default: 'text-primary',
	success: 'text-accent-lime',
	warning: 'text-brand-amber',
	danger: 'text-primary-red',
};

export const ProgressBar = memo(function ProgressBar({
	value,
	max = 100,
	showPercentage = true,
	size = 'md',
	variant = 'default',
	label,
	showLabel = false,
	animated = true,
	className,
	barClassName,
}: ProgressBarProps) {
	const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

	return (
		<div className={cn('w-full', className)}>
			{(label || showLabel) && (
				<div className="flex justify-between items-center mb-2">
					{label && (
						<span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
							{label}
						</span>
					)}
					{showPercentage && (
						<span className={cn('text-xs font-black tabular-nums', percentageColors[variant])}>
							{Math.round(percentage)}%
						</span>
					)}
				</div>
			)}
			<div
				className={cn('w-full overflow-hidden rounded-full bg-primary/10', sizeStyles[size])}
				role="progressbar"
				aria-valuenow={value}
				aria-valuemin={0}
				aria-valuemax={max}
				aria-label={label || `Progress: ${Math.round(percentage)}%`}
			>
				<div
					className={cn(
						'h-full rounded-full transition-all duration-500 ease-out',
						variantStyles[variant],
						animated && 'relative overflow-hidden',
						barClassName
					)}
					style={{ width: `${percentage}%` }}
				>
					{animated && (
						<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
					)}
				</div>
			</div>
		</div>
	);
});

export const ProgressBarWithSegments = memo(function ProgressBarWithSegments({
	value,
	max = 100,
	segments = 10,
	variant = 'default',
	label,
	size = 'md',
	className,
}: {
	value: number;
	max?: number;
	segments?: number;
	variant?: 'default' | 'success' | 'warning' | 'danger';
	label?: string;
	size?: 'sm' | 'md' | 'lg';
	className?: string;
}) {
	const percentage = (value / max) * 100;
	const filledSegments = Math.round((percentage / 100) * segments);

	return (
		<div className={cn('w-full', className)}>
			{label && (
				<div className="flex justify-between items-center mb-2">
					<span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
						{label}
					</span>
					<span className="text-xs font-black text-primary">{Math.round(percentage)}%</span>
				</div>
			)}
			<div className="flex gap-1">
				{Array.from({ length: segments }).map((_, i) => (
					<div
						key={`segment-${i}`}
						className={cn(
							'flex-1 rounded-full transition-all duration-300',
							sizeStyles[size],
							i < filledSegments ? variantStyles[variant] : 'bg-primary/10'
						)}
					/>
				))}
			</div>
		</div>
	);
});

export default ProgressBar;
