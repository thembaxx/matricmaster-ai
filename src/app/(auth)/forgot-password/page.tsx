import type { Metadata } from 'next';
import { ForgotPasswordForm } from './ForgotPasswordForm';

export const metadata: Metadata = {
	title: 'Forgot Password | MatricMaster',
	description: 'Reset your password for MatricMaster.',
};

export default function ForgotPasswordPage() {
	return <ForgotPasswordForm />;
}
