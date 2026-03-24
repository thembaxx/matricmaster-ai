import type { Metadata } from 'next';

import { appConfig } from '@/app.config';

export const metadata: Metadata = {
	title: `sign up | ${appConfig.name}`,
	description:
		'create your free account. start practicing nsc past papers and prepare for your matric exams.',
};

import SignUpForm from './SignUpForm';

export default function SignUpPage() {
	return <SignUpForm />;
}
