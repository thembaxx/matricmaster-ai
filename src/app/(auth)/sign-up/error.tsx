'use client';

import { Refresh01Icon, Warning } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import Link from 'next/link';
import { useEffect } from 'react';
import { BackgroundMesh } from '@/components/ui/background-mesh';
import { Button } from '@/components/ui/button';

interface SignUpErrorProps {
	error: Error & { digest?: string };
	reset: () => void;
}

export default function SignUpError({ error, reset }: SignUpErrorProps) {
	useEffect(() => {
		console.error('Sign-up error:', error);
	}, [error]);

	return (
		<div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
			<BackgroundMesh />
			<div className="w-full max-w-md p-4 relative z-10">
				<div className="w-full premium-glass border-none rounded-[2.5rem] shadow-2xl overflow-hidden p-8 text-center space-y-6">
					<div className="w-16 h-16 bg-destructive/10 dark:bg-destructive/20 rounded-full flex items-center justify-center mx-auto">
						<HugeiconsIcon
							icon={Warning}
							className="w-8 h-8 text-destructive dark:text-destructive"
						/>
					</div>
					<div className="space-y-2">
						<h2 className="text-2xl font-bold text-foreground">account creation failed</h2>
						<p className="text-sm text-muted-foreground">
							{error.message || 'could not create your account. please try again.'}
						</p>
					</div>
					<div className="flex flex-col gap-3">
						<Button onClick={() => reset()} className="gap-2 rounded-2xl w-full h-12">
							<HugeiconsIcon icon={Refresh01Icon} className="w-4 h-4" />
							try again
						</Button>
						<p className="text-sm text-muted-foreground">
							already have an account?{' '}
							<Link href="/sign-in" className="font-bold text-primary hover:text-primary/80">
								sign in
							</Link>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
