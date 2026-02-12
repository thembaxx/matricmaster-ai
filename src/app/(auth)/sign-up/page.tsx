import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Sign Up | MatricMaster AI',
	description: 'Create your MatricMaster AI account and start your journey to Grade 12 success.',
};

import SignUpForm from './SignUpForm';

export default function SignUpPage() {
	return <SignUpForm />;
}
