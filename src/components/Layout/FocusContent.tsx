'use client';

import { m } from 'framer-motion';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FocusContentProps {
	children: ReactNode;
	className?: string;
}

export function FocusContent({ children, className }: FocusContentProps) {
	return (
		<m.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
			className={cn(
				'flex-1 min-h-screen',
				'lg:ml-72', // Account for TimelineSidebar
				className
			)}
		>
			<div className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">{children}</div>
		</m.div>
	);
}
