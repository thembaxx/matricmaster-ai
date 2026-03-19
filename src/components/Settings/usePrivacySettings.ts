import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { deleteAccountAction } from '@/lib/db/settings-actions';

interface PrivacyData {
	profileVisibility?: boolean;
	showOnLeaderboard?: boolean;
	analyticsTracking?: boolean;
}

export function usePrivacySettings(
	session: { user: { id: string } } | null | undefined,
	initialData: PrivacyData | undefined
) {
	const [_isPendingSettings, startSettingsTransition] = useTransition();

	const [profileVisibility, setProfileVisibility] = useState(
		initialData?.profileVisibility ?? true
	);
	const [showOnLeaderboard, setShowOnLeaderboard] = useState(
		initialData?.showOnLeaderboard ?? true
	);
	const [analyticsTracking, setAnalyticsTracking] = useState(
		initialData?.analyticsTracking ?? true
	);

	const [deletePassword, setDeletePassword] = useState('');
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [isDeletingAccount, startDeleteTransition] = useTransition();

	const handlePrivacyChange = async (key: string, value: boolean) => {
		if (key === 'profileVisibility') setProfileVisibility(value);
		if (key === 'showOnLeaderboard') setShowOnLeaderboard(value);
		if (key === 'analyticsTracking') setAnalyticsTracking(value);

		if (!session?.user?.id) return;

		startSettingsTransition(async () => {
			toast.success('Privacy settings updated');
		});
	};

	const handleDeleteAccount = async () => {
		if (!session?.user?.id) return;

		if (!deletePassword) {
			toast.error('Please enter your password to delete your account');
			return;
		}

		startDeleteTransition(async () => {
			const result = await deleteAccountAction(session.user.id, deletePassword);

			if (result.success) {
				toast.success('Account deleted', {
					description: 'Your account has been permanently deleted.',
				});
				window.location.href = '/';
			} else {
				toast.error('Failed to delete account', {
					description: result.error || 'Please try again.',
				});
			}
		});
	};

	return {
		profileVisibility,
		showOnLeaderboard,
		analyticsTracking,
		deletePassword,
		setDeletePassword,
		isDeleteDialogOpen,
		setIsDeleteDialogOpen,
		handlePrivacyChange,
		handleDeleteAccount,
		isDeletingAccount,
	};
}
