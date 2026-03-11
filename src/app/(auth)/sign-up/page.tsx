import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Sign Up | MatricMaster',
	description: 'Create your MatricMaster account and start your journey to Grade 12 success.',
};

import SignUpForm from './SignUpForm';

export default function SignUpPage() {
	return <SignUpForm />;
}
