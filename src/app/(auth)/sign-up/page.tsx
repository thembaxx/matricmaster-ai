import type { Metadata } from 'next';

import { appConfig } from '@/app.config';

export const metadata: Metadata = {
	title: `Sign Up | ${appConfig.name}`,
	description:
		'Create your free account. Start practicing NSC past papers and prepare for your matric exams.',
};

import SignUpForm from './SignUpForm';

export default function SignUpPage() {
	return <SignUpForm />;
}
