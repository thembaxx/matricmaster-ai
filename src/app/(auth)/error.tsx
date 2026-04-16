'use client';

import { ArrowLeft01Icon, Refresh01Icon, Warning } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import Link from 'next/link';
import { useEffect } from 'react';
import { BackgroundMesh } from '@/components/ui/background-mesh';
import { Button } from '@/components/ui/button';

interface AuthErrorProps {
	error: Error & { digest?: string };
	reset: () => void;
}

export default function AuthError({ error, reset }: AuthErrorProps) {
	useEffect(() => {
		console.error('Auth route error:', error);
	}, [error]);

	return (
		<div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
			<BackgroundMesh />
			<div className="w-full max-w-md p-4 relative z-10">
				<div className="w-full tiimo-glass border-none rounded-[var(--radius-2xl)] shadow-soft-lg overflow-hidden p-8 text-center space-y-6">
					<div className="w-16 h-16 bg-destructive/10 dark:bg-destructive/20 rounded-full flex items-center justify-center mx-auto">
						<HugeiconsIcon
							icon={Warning}
							className="w-8 h-8 text-destructive dark:text-destructive"
						/>
					</div>
					<div className="space-y-2">
						<h2 className="text-2xl font-bold text-foreground">Authentication Error</h2>
						<p className="text-sm text-muted-foreground">
							{error.message || 'something went wrong with the authentication flow.'}
						</p>
						{error.digest && (
							<p className="text-xs text-muted-foreground/60 mt-2">ref: {error.digest}</p>
						)}
					</div>
					<div className="flex gap-3 justify-center">
						<Button onClick={() => reset()} variant="outline" className="gap-2 rounded-xl">
							<HugeiconsIcon icon={Refresh01Icon} className="w-4 h-4" />
							Try again
						</Button>
						<Link href="/sign-in">
							<Button className="gap-2 rounded-xl">
								<HugeiconsIcon icon={ArrowLeft01Icon} className="w-4 h-4" />
								Sign in
							</Button>
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
