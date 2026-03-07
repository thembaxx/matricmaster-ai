'use client';

import { CircleNotch, DeviceMobile, Key, Shield } from '@phosphor-icons/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { authClient } from '@/lib/auth-client';

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
					// Navigate to dashboard on successful verification
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
					// Navigate to dashboard on successful verification
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

	return (
		<div className="min-h-screen flex items-center justify-center bg-linear-to-br from-primary/5 via-background to-primary/10 p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
						<Shield className="h-8 w-8 text-primary" />
					</div>
					<CardTitle className="text-2xl font-bold">Two-Factor Authentication</CardTitle>
					<CardDescription>
						{useBackup
							? 'Enter one of your backup codes to continue'
							: 'Enter the 6-digit code from your authenticator app'}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleVerify} className="space-y-4">
						{!useBackup ? (
							<div className="space-y-2">
								<label htmlFor="code" className="text-sm font-medium">
									Verification Code
								</label>
								<div className="flex gap-2">
									<Input
										id="code"
										type="text"
										placeholder="000000"
										value={code}
										onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
										className="text-center text-2xl tracking-widest"
										maxLength={6}
										required
									/>
								</div>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									className="text-sm text-muted-foreground"
									onClick={handleSendOtp}
									disabled={isLoading}
								>
									<DeviceMobile className="mr-2 h-4 w-4" />
									PaperPlaneRight code to email
								</Button>
							</div>
						) : (
							<div className="space-y-2">
								<label htmlFor="backupCode" className="text-sm font-medium">
									Backup Code
								</label>
								<Input
									id="backupCode"
									type="text"
									placeholder="XXXXXXXXXX"
									value={backupCode}
									onChange={(e) => setBackupCode(e.target.value.toUpperCase())}
									className="text-center text-xl tracking-widest font-mono"
									maxLength={10}
									required
								/>
							</div>
						)}

						{error && (
							<div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
								{error}
							</div>
						)}

						{successMessage && (
							<div className="rounded-md bg-green-500/10 p-3 text-sm text-green-600">
								{successMessage}
							</div>
						)}

						<Button type="submit" className="w-full" disabled={isLoading}>
							{isLoading ? (
								<>
									<CircleNotch className="mr-2 h-4 w-4 animate-spin" />
									Verifying...
								</>
							) : (
								<>
									<Key className="mr-2 h-4 w-4" />
									Verify
								</>
							)}
						</Button>

						<div className="text-center">
							<Button
								type="button"
								variant="link"
								onClick={() => {
									setUseBackup(!useBackup);
									setCode('');
									setBackupCode('');
									setError('');
									setSuccessMessage('');
								}}
								className="text-sm"
							>
								{useBackup ? 'Use authenticator app' : 'Use backup code'}
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
