import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

import { appConfig } from '@/app.config';
import { optionalAuth } from '@/lib/server-auth';
import { SignInForm } from './SignInForm';

export const metadata: Metadata = {
	title: `Sign In | ${appConfig.name}`,
	description:
		'Sign in to continue your matric exam preparation. Track your progress and ace your NSC exams.',
};

export default async function SignInPage() {
	const session = await optionalAuth();
	if (session) {
		redirect('/dashboard');
	}

	return (
		<Suspense
			fallback={
				<div className="min-h-screen flex items-center justify-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
				</div>
			}
		>
			<SignInForm />
		</Suspense>
	);
}
