import type { Metadata } from 'next';

import { appConfig } from '@/app.config';
import { ForgotPasswordForm } from './ForgotPasswordForm';

export const metadata: Metadata = {
	title: `Forgot Password | ${appConfig.name} AI`,
	description: `Reset your password for ${appConfig.name} AI.`,
};

export default function ForgotPasswordPage() {
	return <ForgotPasswordForm />;
}
