'use client';

import { motion as m } from 'motion/react';
import type { ReactNode } from 'react';
import { DURATION, EASING } from '@/lib/animation-presets';
import { cn } from '@/lib/utils';

interface FocusContentProps {
	children: ReactNode;
	className?: string;
	showTimeline?: boolean;
}

export function FocusContent({ children, className, showTimeline = true }: FocusContentProps) {
	return (
		<m.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: DURATION.normal, ease: EASING.easeOut }}
			className={cn(
				'flex-1 min-h-screen',
				showTimeline && 'lg:ml-72', // Account for TimelineSidebar
				className
			)}
		>
			<div className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 pb-40">
				{children}
			</div>
		</m.div>
	);
}
