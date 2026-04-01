'use client';

import { Shield01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { authClient } from '@/lib/auth-client';
import { VERIFICATION_DESCRIPTIONS } from './constants';
import { TwoFactorForm } from './two-factor-form';

export default function TwoFactorPage() {
	const router = useRouter();
	const [code, setCode] = useState('');
	const [backupCode, setBackupCode] = useState('');
	const [useBackup, setUseBackup] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('');
	const [successMessage, setSuccessMessage] = useState('');

	const handleVerify = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError('');

		try {
			if (useBackup) {
				const result = await authClient.twoFactor.verifyBackupCode({
					code: backupCode,
					trustDevice: true,
				});
				if (result.error) {
					setError(result.error.message || 'Verification failed');
				} else {
					router.push('/dashboard');
				}
			} else {
				const result = await authClient.twoFactor.verifyTotp({
					code,
					trustDevice: true,
				});
				if (result.error) {
					setError(result.error.message || 'Verification failed');
				} else {
					router.push('/dashboard');
				}
			}
		} catch (_err) {
			setError('An unexpected error occurred');
		} finally {
			setIsLoading(false);
		}
	};

	const handleSendOtp = async () => {
		setIsLoading(true);
		setError('');
		setSuccessMessage('');

		try {
			const result = await authClient.twoFactor.sendOtp();
			if (result.error) {
				setError(result.error.message || 'Failed to send OTP');
			} else {
				setSuccessMessage('OTP sent successfully! Check your email.');
			}
		} catch (_err) {
			setError('Failed to send OTP');
		} finally {
			setIsLoading(false);
		}
	};

	const handleToggleBackup = () => {
		setUseBackup(!useBackup);
		setCode('');
		setBackupCode('');
		setError('');
		setSuccessMessage('');
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-linear-to-br from-primary/5 via-background to-primary/10 p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
						<HugeiconsIcon icon={Shield01Icon} className="h-8 w-8 text-primary" />
					</div>
					<CardTitle className="text-2xl font-bold">two-factor authentication</CardTitle>
					<CardDescription>
						{useBackup ? VERIFICATION_DESCRIPTIONS.backup : VERIFICATION_DESCRIPTIONS.totp}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<TwoFactorForm
						useBackup={useBackup}
						code={code}
						backupCode={backupCode}
						error={error}
						successMessage={successMessage}
						isLoading={isLoading}
						onCodeChange={setCode}
						onBackupCodeChange={setBackupCode}
						onSubmit={handleVerify}
						onSendOtp={handleSendOtp}
						onToggleBackup={handleToggleBackup}
					/>
				</CardContent>
			</Card>
		</div>
	);
}
