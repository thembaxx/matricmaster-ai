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
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { AccountTab } from '@/components/Settings/AccountTab';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useHaptics } from '@/hooks/useHaptics';
import { authClient } from '@/lib/auth-client';
import {
	changePasswordAction,
	deleteAccountAction,
	getNotificationSettingsAction,
	getPrivacySettingsAction,
	updateNotificationSettingsAction,
	updateProfileAction,
} from '@/lib/db/settings-actions';

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
	const { data: session, refetch } = authClient.useSession();
	const [isPendingProfile, startProfileTransition] = useTransition();
	const [isPendingPassword, startPasswordTransition] = useTransition();
	const [isDeletingAccount, startDeleteTransition] = useTransition();
	const [_isPendingSettings, startSettingsTransition] = useTransition();

	// Account settings state - derive from session directly
	const [displayName, setDisplayName] = useState(session?.user?.name ?? '');
	const [email] = useState(session?.user?.email ?? '');

	// Load settings with useQuery
	const { data: notificationSettings } = useQuery({
		queryKey: ['notificationSettings', session?.user?.id],
		queryFn: () => getNotificationSettingsAction(session!.user.id),
		enabled: !!session?.user?.id,
		staleTime: Number.POSITIVE_INFINITY,
	});

	const { data: privacySettings } = useQuery({
		queryKey: ['privacySettings', session?.user?.id],
		queryFn: () => getPrivacySettingsAction(session!.user.id),
		enabled: !!session?.user?.id,
		staleTime: Number.POSITIVE_INFINITY,
	});

	// Notification settings - initialized from query data
	const [emailNotifications, setEmailNotifications] = useState(
		notificationSettings?.data?.emailNotifications ?? true
	);
	const [pushNotifications, setPushNotifications] = useState(
		notificationSettings?.data?.pushNotifications ?? true
	);
	const [studyReminders, setStudyReminders] = useState(
		notificationSettings?.data?.studyReminders ?? true
	);
	const [achievementAlerts, setAchievementAlerts] = useState(
		notificationSettings?.data?.achievementAlerts ?? true
	);

	// Privacy settings - initialized from query data
	const [profileVisibility, setProfileVisibility] = useState(
		privacySettings?.data?.profileVisibility ?? true
	);
	const [showOnLeaderboard, setShowOnLeaderboard] = useState(
		privacySettings?.data?.showOnLeaderboard ?? true
	);
	const [analyticsTracking, setAnalyticsTracking] = useState(
		privacySettings?.data?.analyticsTracking ?? true
	);

	// Security settings state
	const [is2FAEnabled, setIs2FAEnabled] = useState(false);
	const [isLoading2FA, setIsLoading2FA] = useState(false);
	const [showBackupCodes, setShowBackupCodes] = useState(false);
	const [backupCodes, setBackupCodes] = useState<string[]>([]);
	const [password, setPassword] = useState('');

	// Password change state
	const [currentPassword, setCurrentPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');

	// Account deletion state
	const [deletePassword, setDeletePassword] = useState('');
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

	// Haptic feedback settings
	const {
		enabled: hapticEnabled,
		setEnabled: setHapticEnabled,
		isSupported: hapticSupported,
	} = useHaptics();

	// Profile save handler
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

	// Password change handler
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

		if (newPassword.length < 8) {
			toast.error('Password must be at least 8 characters');
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

	// Account deletion handler
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
				// Redirect to home after deletion
				window.location.href = '/';
			} else {
				toast.error('Failed to delete account', {
					description: result.error || 'Please try again.',
				});
			}
		});
	};

	// Handler for notification changes - update state directly
	const handleNotificationChange = async (key: string, value: boolean) => {
		// Optimistic update
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

	// Handler for privacy changes - update state directly
	const handlePrivacyChange = async (key: string, value: boolean) => {
		// Optimistic update
		if (key === 'profileVisibility') setProfileVisibility(value);
		if (key === 'showOnLeaderboard') setShowOnLeaderboard(value);
		if (key === 'analyticsTracking') setAnalyticsTracking(value);

		if (!session?.user?.id) return;

		startSettingsTransition(async () => {
			toast.success('Privacy settings updated');
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
							displayName={displayName}
							setDisplayName={setDisplayName}
							email={email}
							isPendingProfile={isPendingProfile}
							handleSaveProfile={handleSaveProfile}
						/>
					</TabsContent>

					<TabsContent value="security">
						<SecurityTab
							is2FAEnabled={is2FAEnabled}
							isLoading2FA={isLoading2FA}
							showBackupCodes={showBackupCodes}
							setShowBackupCodes={setShowBackupCodes}
							backupCodes={backupCodes}
							password={password}
							setPassword={setPassword}
							currentPassword={currentPassword}
							setCurrentPassword={setCurrentPassword}
							newPassword={newPassword}
							setNewPassword={setNewPassword}
							confirmPassword={confirmPassword}
							setConfirmPassword={setConfirmPassword}
							isPendingPassword={isPendingPassword}
							handleEnable2FA={handleEnable2FA}
							handleDisable2FA={handleDisable2FA}
							handleRegenerateBackupCodes={handleRegenerateBackupCodes}
							handlePasswordChange={handlePasswordChange}
						/>
					</TabsContent>

					<TabsContent value="notifications">
						<NotificationsTab
							emailNotifications={emailNotifications}
							pushNotifications={pushNotifications}
							studyReminders={studyReminders}
							achievementAlerts={achievementAlerts}
							handleNotificationChange={handleNotificationChange}
						/>
					</TabsContent>

					<TabsContent value="privacy">
						<PrivacyTab
							profileVisibility={profileVisibility}
							showOnLeaderboard={showOnLeaderboard}
							analyticsTracking={analyticsTracking}
							hapticSupported={hapticSupported}
							hapticEnabled={hapticEnabled}
							setHapticEnabled={setHapticEnabled}
							handlePrivacyChange={handlePrivacyChange}
							isDeleteDialogOpen={isDeleteDialogOpen}
							setIsDeleteDialogOpen={setIsDeleteDialogOpen}
							deletePassword={deletePassword}
							setDeletePassword={setDeletePassword}
							handleDeleteAccount={handleDeleteAccount}
							isDeletingAccount={isDeletingAccount}
						/>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
