import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { authClient } from '@/lib/auth-client';
import { updateProfileAction } from '@/lib/db/settings-actions';

export function useProfileSettings() {
	const { data: session, refetch } = authClient.useSession();
	const [isPendingProfile, startProfileTransition] = useTransition();
	const [displayName, setDisplayName] = useState(session?.user?.name ?? '');
	const [email] = useState(session?.user?.email ?? '');

	const handleSaveProfile = async () => {
		if (!session?.user?.id) return;

		startProfileTransition(async () => {
			const result = await updateProfileAction(session.user.id, { name: displayName });

			if (result.success) {
				toast.success('Profile updated successfully!', {
					description: 'Your display name has been saved.',
				});
				refetch();
			} else {
				toast.error('Failed to update profile', {
					description: result.error || 'Please try again.',
				});
			}
		});
	};

	return {
		session,
		displayName,
		setDisplayName,
		email,
		isPendingProfile,
		handleSaveProfile,
	};
}
