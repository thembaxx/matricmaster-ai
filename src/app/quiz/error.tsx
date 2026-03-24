'use client';

import { Home01Icon, Refresh01Icon, Warning } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import Link from 'next/link';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface ErrorProps {
	error: Error & { digest?: string };
	reset: () => void;
}

export default function QuizError({ error, reset }: ErrorProps) {
	useEffect(() => {
		console.error('Quiz error:', error);
	}, [error]);

	return (
		<div className="flex flex-col items-center justify-center min-h-[60vh] p-6 bg-background">
			<div className="max-w-md w-full text-center space-y-6">
				<div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
					<HugeiconsIcon icon={Warning} className="w-8 h-8 text-red-600 dark:text-red-400" />
				</div>

				<div className="space-y-2">
					<h2 className="text-2xl font-bold text-foreground">quiz error</h2>
					<p className="text-sm text-muted-foreground">
						{error.message || 'unable to load the quiz. please try again.'}
					</p>
					{error.digest && (
						<p className="text-xs text-muted-foreground/60">error id: {error.digest}</p>
					)}
				</div>

				<div className="flex gap-3 justify-center">
					<Button onClick={() => reset()} variant="outline" className="gap-2 rounded-xl">
						<HugeiconsIcon icon={Refresh01Icon} className="w-4 h-4" />
						try again
					</Button>
					<Link href="/quiz">
						<Button className="gap-2 rounded-xl">
							<HugeiconsIcon icon={Home01Icon} className="w-4 h-4" />
							all quizzes
						</Button>
					</Link>
				</div>
			</div>
		</div>
	);
}
