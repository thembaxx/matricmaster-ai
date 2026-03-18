'use client';

import { CheckmarkCircle02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useFocusMode } from '@/contexts/FocusModeContext';

export function ExamCompleteModal() {
	const { state, endFocusMode } = useFocusMode();
	const router = useRouter();

	if (state !== 'completed') return null;

	const handleReview = () => {
		endFocusMode();
	};

	const handleExit = () => {
		endFocusMode();
		router.push('/dashboard');
	};

	return (
		<div className="fixed inset-0 z-[100] bg-background/95 flex items-center justify-center">
			<div className="text-center space-y-6 max-w-md p-8">
				<div className="inline-flex items-center justify-center p-4 rounded-full bg-green-100 dark:bg-green-900">
					<HugeiconsIcon
						icon={CheckmarkCircle02Icon}
						className="w-12 h-12 text-green-600 dark:text-green-400"
					/>
				</div>

				<h1 className="text-3xl font-bold">Exam Complete!</h1>
				<p className="text-muted-foreground">
					Great job! You can now review your answers with AI assistance.
				</p>

				<div className="flex gap-4 justify-center">
					<Button onClick={handleReview}>Review Answers</Button>
					<Button variant="outline" onClick={handleExit}>
						Exit Focus Mode
					</Button>
				</div>
			</div>
		</div>
	);
}
