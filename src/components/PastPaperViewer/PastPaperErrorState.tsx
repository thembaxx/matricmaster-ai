'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface PastPaperErrorStateProps {
	error?: string | null;
	onRetry?: () => void;
}

export function PastPaperErrorState({
	error = 'Failed to load past paper',
	onRetry,
}: PastPaperErrorStateProps) {
	const router = useRouter();

	return (
		<div className="flex flex-col h-full bg-background relative grow overflow-hidden">
			<div className="flex-1 flex flex-col items-center justify-center p-6">
				<Card className="w-full max-w-md">
					<CardContent className="pt-6 text-center space-y-4">
						<div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								className="w-8 h-8 text-destructive"
								aria-label="Error"
							>
								<title>Error</title>
								<circle cx="12" cy="12" r="10" />
								<line x1="12" y1="8" x2="12" y2="12" />
								<line x1="12" y1="16" x2="12.01" y2="16" />
							</svg>
						</div>
						<div className="space-y-2">
							<h3 className="font-bold text-lg">Unable to Load Paper</h3>
							<p className="text-sm text-muted-foreground">{error}</p>
						</div>
						<div className="flex gap-3 justify-center pt-2">
							{onRetry && (
								<Button variant="outline" onClick={onRetry}>
									Try Again
								</Button>
							)}
							<Button onClick={() => router.push('/past-papers')}>Browse Papers</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
