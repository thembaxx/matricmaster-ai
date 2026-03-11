import type { Metadata } from 'next';
import { Suspense } from 'react';

import { SignInForm } from './SignInForm';

export const metadata: Metadata = {
	title: 'Sign In | MatricMaster',
	description: 'Sign in to your MatricMaster account to continue learning.',
};

export default function SignInPage() {
	return (
		<Suspense
			fallback={
				<div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950">
					<div
						className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"
						role="progressbar"
						aria-label="Loading sign-in form"
						aria-live="polite"
					/>
				</div>
			}
		>
			<SignInForm />
		</Suspense>
	);
}
