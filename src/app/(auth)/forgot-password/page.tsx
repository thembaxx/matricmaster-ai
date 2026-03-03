import type { Metadata } from 'next';
import { ForgotPasswordForm } from './ForgotPasswordForm';

export const metadata: Metadata = {
	title: 'Forgot Password | MatricMaster AI',
	description: 'Reset your password for MatricMaster AI.',
};

export default function ForgotPasswordPage() {
	return <ForgotPasswordForm />;
}
