import { useState, useTransition } from 'react';
import { updateNotificationSettingsAction } from '@/lib/db/settings-actions';

interface NotificationData {
	emailNotifications?: boolean;
	pushNotifications?: boolean;
	studyReminders?: boolean;
	achievementAlerts?: boolean;
}

export function useNotificationSettings(
	session: { user: { id: string } } | null | undefined,
	initialData: NotificationData | undefined
) {
	const [_isPendingSettings, startSettingsTransition] = useTransition();

	const [emailNotifications, setEmailNotifications] = useState(
		initialData?.emailNotifications ?? true
	);
	const [pushNotifications, setPushNotifications] = useState(
		initialData?.pushNotifications ?? true
	);
	const [studyReminders, setStudyReminders] = useState(initialData?.studyReminders ?? true);
	const [achievementAlerts, setAchievementAlerts] = useState(
		initialData?.achievementAlerts ?? true
	);

	const handleNotificationChange = async (key: string, value: boolean) => {
		if (key === 'emailNotifications') setEmailNotifications(value);
		if (key === 'pushNotifications') setPushNotifications(value);
		if (key === 'studyReminders') setStudyReminders(value);
		if (key === 'achievementAlerts') setAchievementAlerts(value);

		if (!session?.user?.id) return;

		startSettingsTransition(async () => {
			const updates = {
				...(key === 'emailNotifications' && { emailNotifications: value }),
				...(key === 'pushNotifications' && { pushNotifications: value }),
				...(key === 'studyReminders' && { studyReminders: value }),
				...(key === 'achievementAlerts' && { achievementAlerts: value }),
			};

			await updateNotificationSettingsAction(session.user.id, updates);
		});
	};

	return {
		emailNotifications,
		pushNotifications,
		studyReminders,
		achievementAlerts,
		handleNotificationChange,
	};
}
