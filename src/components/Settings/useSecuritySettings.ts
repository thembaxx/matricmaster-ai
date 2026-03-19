import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { authClient } from '@/lib/auth-client';
import { changePasswordAction } from '@/lib/db/settings-actions';
import { PASSWORD_MIN_LENGTH } from './constants';

export function useSecuritySettings() {
	const { data: session } = authClient.useSession();
	const [isPendingPassword, startPasswordTransition] = useTransition();

	const [is2FAEnabled, setIs2FAEnabled] = useState(false);
	const [isLoading2FA, setIsLoading2FA] = useState(false);
	const [showBackupCodes, setShowBackupCodes] = useState(false);
	const [backupCodes, setBackupCodes] = useState<string[]>([]);
	const [password, setPassword] = useState('');

	const [currentPassword, setCurrentPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');

	const handlePasswordChange = async () => {
		if (!session?.user?.id) return;

		if (!currentPassword || !newPassword || !confirmPassword) {
			toast.error('Please fill in all password fields');
			return;
		}

		if (newPassword !== confirmPassword) {
			toast.error('Passwords do not match');
			return;
		}

		if (newPassword.length < PASSWORD_MIN_LENGTH) {
			toast.error(`Password must be at least ${PASSWORD_MIN_LENGTH} characters`);
			return;
		}

		startPasswordTransition(async () => {
			const result = await changePasswordAction(session.user.id, {
				currentPassword,
				newPassword,
			});

			if (result.success) {
				toast.success('Password changed successfully!');
				setCurrentPassword('');
				setNewPassword('');
				setConfirmPassword('');
			} else {
				toast.error('Failed to change password', {
					description: result.error || 'Please try again.',
				});
			}
		});
	};

	const handleEnable2FA = async () => {
		if (!password) {
			toast.error('Please enter your password');
			return;
		}

		setIsLoading2FA(true);
		try {
			const result = await authClient.twoFactor.enable({ password });
			if (result.data) {
				setBackupCodes(result.data.backupCodes);
				setShowBackupCodes(true);
				setIs2FAEnabled(true);
				toast.success('2FA enabled successfully!', {
					description: 'Save your backup codes in a safe place.',
				});
			} else if (result.error) {
				toast.error(result.error.message);
			}
		} catch (error) {
			console.debug(error);
			toast.error('Failed to enable 2FA');
		} finally {
			setIsLoading2FA(false);
		}
	};

	const handleDisable2FA = async () => {
		if (!password) {
			toast.error('Please enter your password');
			return;
		}

		setIsLoading2FA(true);
		try {
			const result = await authClient.twoFactor.disable({ password });
			if (result.data) {
				setIs2FAEnabled(false);
				setShowBackupCodes(false);
				setBackupCodes([]);
				toast.success('2FA disabled');
			} else if (result.error) {
				toast.error(result.error.message);
			}
		} catch (error) {
			console.debug(error);
			toast.error('Failed to disable 2FA');
		} finally {
			setIsLoading2FA(false);
		}
	};

	const handleRegenerateBackupCodes = async () => {
		if (!password) {
			toast.error('Please enter your password');
			return;
		}

		setIsLoading2FA(true);
		try {
			const result = await authClient.twoFactor.generateBackupCodes({ password });
			if (result.data) {
				setBackupCodes(result.data.backupCodes);
				setShowBackupCodes(true);
				toast.success('Backup codes regenerated', {
					description: 'Save your new backup codes.',
				});
			} else if (result.error) {
				toast.error(result.error.message);
			}
		} catch (error) {
			console.debug(error);
			toast.error('Failed to regenerate backup codes');
		} finally {
			setIsLoading2FA(false);
		}
	};

	return {
		is2FAEnabled,
		isLoading2FA,
		showBackupCodes,
		setShowBackupCodes,
		backupCodes,
		password,
		setPassword,
		currentPassword,
		setCurrentPassword,
		newPassword,
		setNewPassword,
		confirmPassword,
		setConfirmPassword,
		isPendingPassword,
		handleEnable2FA,
		handleDisable2FA,
		handleRegenerateBackupCodes,
		handlePasswordChange,
	};
}
