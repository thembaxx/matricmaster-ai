import type { Metadata } from 'next';
import { Suspense } from 'react';

import { appConfig } from '@/app.config';
import { SignInForm } from './SignInForm';

export const metadata: Metadata = {
	title: `Sign In | ${appConfig.name}`,
	description:
		'Sign in to continue your matric exam preparation. Track your progress and ace your NSC exams.',
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
