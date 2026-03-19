'use client';

import {
	LockIcon,
	Notification03Icon,
	Shield01Icon,
	UserIcon as User,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { AccountTab } from '@/components/Settings/AccountTab';
import { QUERY_STALE_TIME } from '@/components/Settings/constants';
import { useNotificationSettings } from '@/components/Settings/useNotificationSettings';
import { usePrivacySettings } from '@/components/Settings/usePrivacySettings';
import { useProfileSettings } from '@/components/Settings/useProfileSettings';
import { useSecuritySettings } from '@/components/Settings/useSecuritySettings';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useHaptics } from '@/hooks/useHaptics';
import { getNotificationSettingsAction, getPrivacySettingsAction } from '@/lib/db/settings-actions';

const NotificationsTab = dynamic(
	() =>
		import('@/components/Settings/NotificationsTab').then((mod) => ({
			default: mod.NotificationsTab,
		})),
	{ ssr: false }
);
const PrivacyTab = dynamic(
	() => import('@/components/Settings/PrivacyTab').then((mod) => ({ default: mod.PrivacyTab })),
	{ ssr: false }
);
const SecurityTab = dynamic(
	() => import('@/components/Settings/SecurityTab').then((mod) => ({ default: mod.SecurityTab })),
	{ ssr: false }
);

export default function SettingsPage() {
	const { session } = useProfileSettings();
	const security = useSecuritySettings();
	const {
		enabled: hapticEnabled,
		setEnabled: setHapticEnabled,
		isSupported: hapticSupported,
	} = useHaptics();

	const { data: notificationSettings } = useQuery({
		queryKey: ['notificationSettings', session?.user?.id],
		queryFn: () => getNotificationSettingsAction(session!.user.id),
		enabled: !!session?.user?.id,
		staleTime: QUERY_STALE_TIME,
	});

	const { data: privacySettings } = useQuery({
		queryKey: ['privacySettings', session?.user?.id],
		queryFn: () => getPrivacySettingsAction(session!.user.id),
		enabled: !!session?.user?.id,
		staleTime: QUERY_STALE_TIME,
	});

	const profile = useProfileSettings();
	const notifications = useNotificationSettings(session, notificationSettings?.data);
	const privacy = usePrivacySettings(session, privacySettings?.data);

	if (!session) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<Card className="w-full max-w-md">
					<CardHeader>
						<CardTitle>Please Sign In</CardTitle>
						<CardDescription>You need to sign in to access settings</CardDescription>
					</CardHeader>
					<CardContent>
						<Button asChild className="w-full">
							<Link href="/sign-in">Sign In</Link>
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background pt-4 pb-32 px-6 md:p-8">
			<div className="max-w-4xl mx-auto">
				<h1 className="text-3xl font-bold mb-2">Settings</h1>
				<p className="text-muted-foreground mb-8">Manage your account settings and preferences</p>

				<Tabs defaultValue="account" className="space-y-6">
					<TabsList className="grid w-full grid-cols-4">
						<TabsTrigger value="account">
							<HugeiconsIcon icon={User} className="h-4 w-4 mr-2" />
							Account
						</TabsTrigger>
						<TabsTrigger value="security">
							<HugeiconsIcon icon={Shield01Icon} className="h-4 w-4 mr-2" />
							Security
						</TabsTrigger>
						<TabsTrigger value="notifications">
							<HugeiconsIcon icon={Notification03Icon} className="h-4 w-4 mr-2" />
							Notifications
						</TabsTrigger>
						<TabsTrigger value="privacy">
							<HugeiconsIcon icon={LockIcon} className="h-4 w-4 mr-2" />
							Privacy
						</TabsTrigger>
					</TabsList>

					<TabsContent value="account">
						<AccountTab
							session={session}
							displayName={profile.displayName}
							setDisplayName={profile.setDisplayName}
							email={profile.email}
							isPendingProfile={profile.isPendingProfile}
							handleSaveProfile={profile.handleSaveProfile}
						/>
					</TabsContent>

					<TabsContent value="security">
						<SecurityTab
							is2FAEnabled={security.is2FAEnabled}
							isLoading2FA={security.isLoading2FA}
							showBackupCodes={security.showBackupCodes}
							setShowBackupCodes={security.setShowBackupCodes}
							backupCodes={security.backupCodes}
							password={security.password}
							setPassword={security.setPassword}
							currentPassword={security.currentPassword}
							setCurrentPassword={security.setCurrentPassword}
							newPassword={security.newPassword}
							setNewPassword={security.setNewPassword}
							confirmPassword={security.confirmPassword}
							setConfirmPassword={security.setConfirmPassword}
							isPendingPassword={security.isPendingPassword}
							handleEnable2FA={security.handleEnable2FA}
							handleDisable2FA={security.handleDisable2FA}
							handleRegenerateBackupCodes={security.handleRegenerateBackupCodes}
							handlePasswordChange={security.handlePasswordChange}
						/>
					</TabsContent>

					<TabsContent value="notifications">
						<NotificationsTab
							emailNotifications={notifications.emailNotifications}
							pushNotifications={notifications.pushNotifications}
							studyReminders={notifications.studyReminders}
							achievementAlerts={notifications.achievementAlerts}
							handleNotificationChange={notifications.handleNotificationChange}
						/>
					</TabsContent>

					<TabsContent value="privacy">
						<PrivacyTab
							profileVisibility={privacy.profileVisibility}
							showOnLeaderboard={privacy.showOnLeaderboard}
							analyticsTracking={privacy.analyticsTracking}
							hapticSupported={hapticSupported}
							hapticEnabled={hapticEnabled}
							setHapticEnabled={setHapticEnabled}
							handlePrivacyChange={privacy.handlePrivacyChange}
							isDeleteDialogOpen={privacy.isDeleteDialogOpen}
							setIsDeleteDialogOpen={privacy.setIsDeleteDialogOpen}
							deletePassword={privacy.deletePassword}
							setDeletePassword={privacy.setDeletePassword}
							handleDeleteAccount={privacy.handleDeleteAccount}
							isDeletingAccount={privacy.isDeletingAccount}
						/>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
