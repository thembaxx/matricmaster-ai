import type { Metadata } from 'next';

import { appConfig } from '@/app.config';
import { ResetPasswordForm } from './ResetPasswordForm';

export const metadata: Metadata = {
	title: `Reset Password | ${appConfig.name} AI`,
	description: `Create a new password for your ${appConfig.name} AI account.`,
};

export default function ResetPasswordPage() {
	return <ResetPasswordForm />;
}
