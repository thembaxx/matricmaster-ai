import type { Metadata } from 'next';

import { appConfig } from '@/app.config';

export const metadata: Metadata = {
	title: `Sign Up | ${appConfig.name} AI`,
	description: `Create your ${appConfig.name} AI account and start your journey to Grade 12 success.`,
};

import SignUpForm from './SignUpForm';

export default function SignUpPage() {
	return <SignUpForm />;
}
