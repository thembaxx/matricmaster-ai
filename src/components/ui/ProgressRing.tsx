'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProgressRingProps {
	value: number; // 0 to 100
	size?: number;
	strokeWidth?: number;
	className?: string;
	variant?: 'default' | 'violet' | 'cyan' | 'orange' | 'success';
}

export function ProgressRing({
	value,
	size = 60,
	strokeWidth = 6,
	className,
	variant = 'default',
}: ProgressRingProps) {
	const radius = (size - strokeWidth) / 2;
	const circumference = radius * 2 * Math.PI;
	const offset = circumference - (value / 100) * circumference;

	const colors = {
		default: 'stroke-primary',
		violet: 'stroke-primary-violet',
		cyan: 'stroke-primary-cyan',
		orange: 'stroke-primary-orange',
		success: 'stroke-success',
	};

	return (
		<div className={cn('relative inline-flex items-center justify-center', className)}>
			<svg width={size} height={size} className="transform -rotate-90">
				{/* Background circle */}
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					stroke="currentColor"
					strokeWidth={strokeWidth}
					fill="transparent"
					className="text-muted/20"
				/>
				{/* Progress circle */}
				<motion.circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					stroke="currentColor"
					strokeWidth={strokeWidth}
					fill="transparent"
					strokeDasharray={circumference}
					initial={{ strokeDashoffset: circumference }}
					animate={{ strokeDashoffset: offset }}
					transition={{ duration: 1, ease: 'easeInOut' }}
					strokeLinecap="round"
					className={cn(colors[variant])}
				/>
			</svg>
			<div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">
				{Math.round(value)}%
			</div>
		</div>
	);
}
