'use client';

import { Home01Icon, Refresh01Icon, Warning } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface RouteErrorProps {
	error: Error & { digest?: string };
	reset: () => void;
	title?: string;
	message?: string;
	description?: string;
	homeLink?: string;
	homeLabel?: string;
	showHomeButton?: boolean;
}

export function RouteError({
	error,
	reset,
	title = 'Something Went Wrong',
	message,
	description,
	homeLink = '/dashboard',
	homeLabel = 'dashboard',
	showHomeButton = true,
}: RouteErrorProps) {
	const fallbackMessage = description ?? message ?? 'Unable to Load this Page. Please Try Again.';

	return (
		<div className="flex flex-col items-center justify-center min-h-[60vh] p-6 bg-background">
			<div className="max-w-md w-full text-center space-y-6">
				<div className="w-16 h-16 bg-destructive/10 dark:bg-destructive/20 rounded-full flex items-center justify-center mx-auto">
					<HugeiconsIcon
						icon={Warning}
						className="w-8 h-8 text-destructive dark:text-destructive"
					/>
				</div>

				<div className="space-y-2">
					<h2 className="text-2xl font-bold text-foreground">{title}</h2>
					<p className="text-sm text-muted-foreground">{error.message || fallbackMessage}</p>
					{error.digest && (
						<p className="text-xs text-muted-foreground/60">error id: {error.digest}</p>
					)}
				</div>

				<div className="flex gap-3 justify-center">
					<Button onClick={() => reset()} variant="outline" className="gap-2 rounded-xl">
						<HugeiconsIcon icon={Refresh01Icon} className="w-4 h-4" />
						Try Again
					</Button>
					{showHomeButton && (
						<Link href={homeLink}>
							<Button className="gap-2 rounded-xl">
								<HugeiconsIcon icon={Home01Icon} className="w-4 h-4" />
								{homeLabel}
							</Button>
						</Link>
					)}
				</div>
			</div>
		</div>
	);
}
