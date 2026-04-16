import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { appConfig } from '@/app.config';
import { optionalAuth } from '@/lib/server-auth';
import SignUpForm from './SignUpForm';

export const metadata: Metadata = {
	title: `Sign up | ${appConfig.name}`,
	description:
		'Create your free account. Start practicing NSC past papers and prepare for your matric exams.',
};

export default async function SignUpPage() {
	const session = await optionalAuth();
	if (session) {
		redirect('/dashboard');
	}

	return <SignUpForm />;
}
