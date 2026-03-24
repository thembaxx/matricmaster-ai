'use client';

import { m, useCycle } from 'framer-motion';
import { useEffect } from 'react';

const ANALYZING_MESSAGES = [
	'Checking your question...',
	'Reading your image...',
	'Finding answer...',
	'Almost there...',
	'Getting result...',
];

interface AnalyzingStateProps {
	className?: string;
}

export function AnalyzingState({ className }: AnalyzingStateProps) {
	const [messageIndex, setMessageIndex] = useCycle(0, ANALYZING_MESSAGES.length);

	useEffect(() => {
		const interval = setInterval(() => {
			setMessageIndex();
		}, 3000);
		return () => clearInterval(interval);
	}, [setMessageIndex]);

	return (
		<m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={className}>
			<div className="flex flex-col items-center justify-center py-8">
				<div className="w-16 h-16 border-4 border-tiimo-lavender/20 border-t-tiimo-lavender rounded-full animate-spin mb-6" />
				<m.p
					key={messageIndex}
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					className="text-base font-medium text-foreground"
				>
					{ANALYZING_MESSAGES[messageIndex]}
				</m.p>
			</div>
		</m.div>
	);
}
