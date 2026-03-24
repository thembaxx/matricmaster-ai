'use client';
/* eslint-disable react-hooks/setState-in-use-effect */

import { m } from 'framer-motion';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

const ANALYZING_MESSAGES = [
	'Loading your progress...',
	'Calculating your results...',
	'Checking your weak topics...',
	'Preparing recommendations...',
	'Finding past papers on this topic...',
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
	const [displayMessage, setDisplayMessage] = useState(() =>
		showAnalyzingVariants ? ANALYZING_MESSAGES[0] : message
	);

	// eslint-disable-next-line react-hooks/setState-in-use-effect
	useEffect(() => {
		if (!showAnalyzingVariants) {
			setDisplayMessage(message);
			return;
		}

		const interval = setInterval(() => {
			const randomIndex = Math.floor(Math.random() * ANALYZING_MESSAGES.length);
			setDisplayMessage(ANALYZING_MESSAGES[randomIndex]);
		}, 3000);

		return () => clearInterval(interval);
	}, [showAnalyzingVariants, message]);

	const finalMessage = showAnalyzingVariants ? displayMessage : message;

	return (
		<m.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			className={cn('flex flex-col items-center justify-center py-12', className)}
		>
			<div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
			<p className="text-sm text-muted-foreground animate-pulse">{finalMessage}</p>
		</m.div>
	);
}
