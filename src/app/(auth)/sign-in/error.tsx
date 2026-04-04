'use client';

import { Refresh01Icon, Warning } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import Link from 'next/link';
import { useEffect } from 'react';
import { BackgroundMesh } from '@/components/ui/background-mesh';
import { Button } from '@/components/ui/button';

interface SignInErrorProps {
	error: Error & { digest?: string };
	reset: () => void;
}

export default function SignInError({ error, reset }: SignInErrorProps) {
	useEffect(() => {
		console.error('Sign-in error:', error);
	}, [error]);

	return (
		<div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
			<BackgroundMesh />
			<div className="w-full max-w-md p-4 relative z-10">
				<div className="w-full tiimo-glass border-none rounded-[var(--radius-2xl)] shadow-2xl overflow-hidden p-8 text-center space-y-6">
					<div className="w-16 h-16 bg-destructive/10 dark:bg-destructive/20 rounded-full flex items-center justify-center mx-auto">
						<HugeiconsIcon
							icon={Warning}
							className="w-8 h-8 text-destructive dark:text-destructive"
						/>
					</div>
					<div className="space-y-2">
						<h2 className="text-2xl font-bold text-foreground">sign-in failed</h2>
						<p className="text-sm text-muted-foreground">
							{error.message || 'could not complete sign-in. please try again.'}
						</p>
					</div>
					<div className="flex flex-col gap-3">
						<Button onClick={() => reset()} className="gap-2 rounded-xl w-full h-12">
							<HugeiconsIcon icon={Refresh01Icon} className="w-4 h-4" />
							try again
						</Button>
						<p className="text-sm text-muted-foreground">
							don&apos;t have an account?{' '}
							<Link href="/sign-up" className="font-bold text-primary hover:text-primary/80">
								sign up
							</Link>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
