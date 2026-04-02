import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { appConfig } from '@/app.config';
import { optionalAuth } from '@/lib/server-auth';
import SignUpForm from './SignUpForm';

export const metadata: Metadata = {
	title: `sign up | ${appConfig.name}`,
	description:
		'create your free account. start practicing nsc past papers and prepare for your matric exams.',
};

export default async function SignUpPage() {
	const session = await optionalAuth();
	if (session) {
		redirect('/dashboard');
	}

	return <SignUpForm />;
}
