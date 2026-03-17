'use client';

import { m } from 'framer-motion';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

const ANALYZING_MESSAGES = [
	'Reading the numbers...',
	'Applying formulas...',
	'Analyzing patterns...',
	'Finding solutions...',
	'Processing your question...',
];

interface LoadingStateProps {
	message?: string;
	showAnalyzingVariants?: boolean;
	className?: string;
}

export function LoadingState({
	message = 'Loading...',
	showAnalyzingVariants = false,
	className,
}: LoadingStateProps) {
	const [displayMessage, setDisplayMessage] = useState(message);

	useEffect(() => {
		if (!showAnalyzingVariants) return;

		const interval = setInterval(() => {
			const randomIndex = Math.floor(Math.random() * ANALYZING_MESSAGES.length);
			setDisplayMessage(ANALYZING_MESSAGES[randomIndex]);
		}, 3000);

		return () => clearInterval(interval);
	}, [showAnalyzingVariants]);

	return (
		<m.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			className={cn('flex flex-col items-center justify-center py-12', className)}
		>
			<div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
			<p className="text-sm text-muted-foreground animate-pulse">
				{showAnalyzingVariants ? displayMessage : message}
			</p>
		</m.div>
	);
}
