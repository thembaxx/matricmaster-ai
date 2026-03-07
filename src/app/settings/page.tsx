'use client';

import {
	Bell,
	CheckCircle,
	CircleNotch,
	DeviceMobile,
	Key,
	Lock,
	Shield,
	Trash,
	User,
	XCircle,
} from '@phosphor-icons/react';
import Link from 'next/link';
import { useEffect, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { authClient } from '@/lib/auth-client';
import {
	changePasswordAction,
	deleteAccountAction,
	getNotificationSettingsAction,
	getPrivacySettingsAction,
	updateNotificationSettingsAction,
	updateProfileAction,
} from '@/lib/db/settings-actions';

export default function SettingsPage() {
	const { data: session, refetch } = authClient.useSession();
	const [isPendingProfile, startProfileTransition] = useTransition();
	const [isPendingPassword, startPasswordTransition] = useTransition();
	const [isDeletingAccount, startDeleteTransition] = useTransition();
	const [_isPendingSettings, startSettingsTransition] = useTransition();

	// Account settings state
	const [displayName, setDisplayName] = useState(session?.user?.name || '');
	const [email, setEmail] = useState(session?.user?.email || '');

	// Sync state when session changes
	useEffect(() => {
		if (session?.user) {
			setDisplayName(session.user.name || '');
			setEmail(session.user.email || '');
		}
	}, [session]);

	// Load settings on mount
	useEffect(() => {
		const loadSettings = async () => {
			if (session?.user?.id) {
				// Load notification settings
				const notifResult = await getNotificationSettingsAction(session.user.id);
				if (notifResult.success && notifResult.data) {
					setEmailNotifications(notifResult.data.emailNotifications);
					setPushNotifications(notifResult.data.pushNotifications);
					setStudyReminders(notifResult.data.studyReminders);
					setAchievementAlerts(notifResult.data.achievementAlerts);
				}

				// Load privacy settings
				const privacyResult = await getPrivacySettingsAction(session.user.id);
				if (privacyResult.success && privacyResult.data) {
					setProfileVisibility(privacyResult.data.profileVisibility);
					setShowOnLeaderboard(privacyResult.data.showOnLeaderboard);
					setAnalyticsTracking(privacyResult.data.analyticsTracking);
				}
			}
		};
		loadSettings();
	}, [session?.user?.id]);

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

	// Notification settings
	const [emailNotifications, setEmailNotifications] = useState(true);
	const [pushNotifications, setPushNotifications] = useState(true);
	const [studyReminders, setStudyReminders] = useState(true);
	const [achievementAlerts, setAchievementAlerts] = useState(true);

	// Privacy settings
	const [profileVisibility, setProfileVisibility] = useState(true);
	const [showOnLeaderboard, setShowOnLeaderboard] = useState(true);
	const [analyticsTracking, setAnalyticsTracking] = useState(true);

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

	// Notification settings handlers
	const handleNotificationChange = async (key: string, value: boolean) => {
		if (!session?.user?.id) return;

		startSettingsTransition(async () => {
			const updates = {
				...(key === 'emailNotifications' && { emailNotifications: value }),
				...(key === 'pushNotifications' && { pushNotifications: value }),
				...(key === 'studyReminders' && { studyReminders: value }),
				...(key === 'achievementAlerts' && { achievementAlerts: value }),
			};

			const result = await updateNotificationSettingsAction(session.user.id, updates);
			if (result.success) {
				if (key === 'emailNotifications') setEmailNotifications(value);
				if (key === 'pushNotifications') setPushNotifications(value);
				if (key === 'studyReminders') setStudyReminders(value);
				if (key === 'achievementAlerts') setAchievementAlerts(value);
			}
		});
	};

	// Privacy settings handlers
	const handlePrivacyChange = async (key: string, value: boolean) => {
		if (!session?.user?.id) return;

		startSettingsTransition(async () => {
			if (key === 'profileVisibility') setProfileVisibility(value);
			if (key === 'showOnLeaderboard') setShowOnLeaderboard(value);
			if (key === 'analyticsTracking') setAnalyticsTracking(value);

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
					description: 'FloppyDisk your backup codes in a safe place.',
				});
			} else if (result.error) {
				toast.error(result.error.message);
			}
		} catch (error) {
			console.error(error);
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
			console.error(error);
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
					description: 'FloppyDisk your new backup codes.',
				});
			} else if (result.error) {
				toast.error(result.error.message);
			}
		} catch (error) {
			console.error(error);
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
				<h1 className="text-3xl font-bold mb-2">Gear</h1>
				<p className="text-muted-foreground mb-8">Manage your account settings and preferences</p>

				<Tabs defaultValue="account" className="space-y-6">
					<TabsList className="grid w-full grid-cols-4">
						<TabsTrigger value="account">
							<User className="h-4 w-4 mr-2" />
							Account
						</TabsTrigger>
						<TabsTrigger value="security">
							<Shield className="h-4 w-4 mr-2" />
							Security
						</TabsTrigger>
						<TabsTrigger value="notifications">
							<Bell className="h-4 w-4 mr-2" />
							Notifications
						</TabsTrigger>
						<TabsTrigger value="privacy">
							<Lock className="h-4 w-4 mr-2" />
							Privacy
						</TabsTrigger>
					</TabsList>

					{/* Account Tab */}
					<TabsContent value="account" className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Profile Information</CardTitle>
								<CardDescription>Update your account details</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid gap-2">
									<Label htmlFor="displayName">Display Name</Label>
									<Input
										id="displayName"
										value={displayName}
										onChange={(e) => setDisplayName(e.target.value)}
										placeholder="Your name"
										maxLength={100}
									/>
								</div>
								<div className="grid gap-2">
									<Label htmlFor="email">Email</Label>
									<Input
										id="email"
										type="email"
										value={email}
										placeholder="your@email.com"
										disabled
									/>
									<p className="text-xs text-muted-foreground">
										Email cannot be changed. Contact support if you need to update it.
									</p>
								</div>
								<Button onClick={handleSaveProfile} disabled={isPendingProfile}>
									{isPendingProfile ? (
										<>
											<CircleNotch className="mr-2 h-4 w-4 animate-spin" />
											Saving...
										</>
									) : (
										'FloppyDisk Changes'
									)}
								</Button>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Connected Accounts</CardTitle>
								<CardDescription>Manage your connected OAuth providers</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center">
											<span className="text-red-500 font-bold">G</span>
										</div>
										<div>
											<p className="font-medium">Google</p>
											<p className="text-sm text-muted-foreground">
												{session.user?.email ? 'Connected' : 'Not connected'}
											</p>
										</div>
									</div>
									<Button variant="outline" size="sm" disabled>
										{session.user?.email ? 'Connected' : 'Connect'}
									</Button>
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					{/* Security Tab */}
					<TabsContent value="security" className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<DeviceMobile className="h-5 w-5" />
									Two-Factor Authentication
								</CardTitle>
								<CardDescription>Add an extra layer of security to your account</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										{is2FAEnabled ? (
											<CheckCircle className="h-5 w-5 text-green-500" />
										) : (
											<XCircle className="h-5 w-5 text-muted-foreground" />
										)}
										<div>
											<p className="font-medium">2FA Status</p>
											<p className="text-sm text-muted-foreground">
												{is2FAEnabled ? 'Enabled' : 'Disabled'}
											</p>
										</div>
									</div>
								</div>

								{!showBackupCodes ? (
									<>
										<Separator />
										<div className="space-y-4">
											<div className="grid gap-2">
												<Label htmlFor="password">Enter Password to Enable 2FA</Label>
												<Input
													id="password"
													type="password"
													value={password}
													onChange={(e) => setPassword(e.target.value)}
													placeholder="Your password"
												/>
											</div>
											<div className="flex gap-2">
												{is2FAEnabled ? (
													<Button
														variant="destructive"
														onClick={handleDisable2FA}
														disabled={isLoading2FA}
													>
														{isLoading2FA && <CircleNotch className="mr-2 h-4 w-4 animate-spin" />}
														Disable 2FA
													</Button>
												) : (
													<>
														<Button onClick={handleEnable2FA} disabled={isLoading2FA}>
															{isLoading2FA && (
																<CircleNotch className="mr-2 h-4 w-4 animate-spin" />
															)}
															Enable 2FA
														</Button>
														<Button
															variant="outline"
															onClick={handleRegenerateBackupCodes}
															disabled={isLoading2FA || !is2FAEnabled}
														>
															<Key className="mr-2 h-4 w-4" />
															Regenerate Backup Codes
														</Button>
													</>
												)}
											</div>
										</div>
									</>
								) : (
									<>
										<Separator />
										<div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
											<h4 className="font-semibold text-amber-800 mb-2">
												⚠️ FloppyDisk Your Backup Codes
											</h4>
											<p className="text-sm text-amber-700 mb-4">
												Store these codes somewhere safe. You can use them to access your account if
												you lose your authenticator device.
											</p>
											<div className="grid grid-cols-2 gap-2">
												{backupCodes.map((code, index) => (
													<code
														key={index}
														className="bg-white px-2 py-1 rounded text-sm font-mono"
													>
														{code}
													</code>
												))}
											</div>
										</div>
										<Button variant="outline" onClick={() => setShowBackupCodes(false)}>
											I've Saved My Codes
										</Button>
									</>
								)}
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Password</CardTitle>
								<CardDescription>Change your account password</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid gap-2">
									<Label htmlFor="currentPassword">Current Password</Label>
									<Input
										id="currentPassword"
										type="password"
										value={currentPassword}
										onChange={(e) => setCurrentPassword(e.target.value)}
										placeholder="••••••••"
									/>
								</div>
								<div className="grid gap-2">
									<Label htmlFor="newPassword">New Password</Label>
									<Input
										id="newPassword"
										type="password"
										value={newPassword}
										onChange={(e) => setNewPassword(e.target.value)}
										placeholder="••••••••"
									/>
								</div>
								<div className="grid gap-2">
									<Label htmlFor="confirmPassword">Confirm New Password</Label>
									<Input
										id="confirmPassword"
										type="password"
										value={confirmPassword}
										onChange={(e) => setConfirmPassword(e.target.value)}
										placeholder="••••••••"
									/>
								</div>
								<Button onClick={handlePasswordChange} disabled={isPendingPassword}>
									{isPendingPassword ? (
										<>
											<CircleNotch className="mr-2 h-4 w-4 animate-spin" />
											Updating...
										</>
									) : (
										'Update Password'
									)}
								</Button>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Active Sessions</CardTitle>
								<CardDescription>Manage your active login sessions</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="text-sm text-muted-foreground">
									<p>View and manage your active sessions across devices.</p>
									<Button variant="outline" className="mt-4">
										View Sessions
									</Button>
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					{/* Notifications Tab */}
					<TabsContent value="notifications" className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Notification Preferences</CardTitle>
								<CardDescription>Choose how you want to be notified</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="flex items-center justify-between">
									<div>
										<p className="font-medium">Email Notifications</p>
										<p className="text-sm text-muted-foreground">Receive updates via email</p>
									</div>
									<Switch
										checked={emailNotifications}
										onCheckedChange={(v) => handleNotificationChange('emailNotifications', v)}
									/>
								</div>
								<Separator />
								<div className="flex items-center justify-between">
									<div>
										<p className="font-medium">Push Notifications</p>
										<p className="text-sm text-muted-foreground">Receive browser notifications</p>
									</div>
									<Switch
										checked={pushNotifications}
										onCheckedChange={(v) => handleNotificationChange('pushNotifications', v)}
									/>
								</div>
								<Separator />
								<div className="flex items-center justify-between">
									<div>
										<p className="font-medium">Study Reminders</p>
										<p className="text-sm text-muted-foreground">Daily reminders to study</p>
									</div>
									<Switch
										checked={studyReminders}
										onCheckedChange={(v) => handleNotificationChange('studyReminders', v)}
									/>
								</div>
								<Separator />
								<div className="flex items-center justify-between">
									<div>
										<p className="font-medium">Achievement Alerts</p>
										<p className="text-sm text-muted-foreground">
											Get notified when you earn achievements
										</p>
									</div>
									<Switch
										checked={achievementAlerts}
										onCheckedChange={(v) => handleNotificationChange('achievementAlerts', v)}
									/>
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					{/* Privacy Tab */}
					<TabsContent value="privacy" className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Privacy Gear</CardTitle>
								<CardDescription>Control your privacy preferences</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="flex items-center justify-between">
									<div>
										<p className="font-medium">Profile Visibility</p>
										<p className="text-sm text-muted-foreground">
											Allow others to see your profile
										</p>
									</div>
									<Switch
										checked={profileVisibility}
										onCheckedChange={(v) => handlePrivacyChange('profileVisibility', v)}
									/>
								</div>
								<Separator />
								<div className="flex items-center justify-between">
									<div>
										<p className="font-medium">Show on Leaderboard</p>
										<p className="text-sm text-muted-foreground">
											Appear on the public leaderboard
										</p>
									</div>
									<Switch
										checked={showOnLeaderboard}
										onCheckedChange={(v) => handlePrivacyChange('showOnLeaderboard', v)}
									/>
								</div>
								<Separator />
								<div className="flex items-center justify-between">
									<div>
										<p className="font-medium">Analytics Tracking</p>
										<p className="text-sm text-muted-foreground">
											Help us improve by sharing usage data
										</p>
									</div>
									<Switch
										checked={analyticsTracking}
										onCheckedChange={(v) => handlePrivacyChange('analyticsTracking', v)}
									/>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Danger Zone</CardTitle>
								<CardDescription>Irreversible account actions</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex items-center justify-between">
									<div>
										<p className="font-medium">Backspace Account</p>
										<p className="text-sm text-muted-foreground">
											Permanently delete your account and all data
										</p>
									</div>
									<Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
										<DialogTrigger asChild>
											<Button variant="destructive" size="sm">
												<Trash className="mr-2 h-4 w-4" />
												Backspace Account
											</Button>
										</DialogTrigger>
										<DialogContent>
											<DialogHeader>
												<DialogTitle>Backspace Account</DialogTitle>
												<DialogDescription>
													Are you sure you want to delete your account? This action cannot be
													undone. All your data, progress, and achievements will be permanently
													deleted.
												</DialogDescription>
											</DialogHeader>
											<div className="py-4">
												<Label htmlFor="deletePassword">Enter your password to confirm</Label>
												<Input
													id="deletePassword"
													type="password"
													value={deletePassword}
													onChange={(e) => setDeletePassword(e.target.value)}
													placeholder="Your password"
													className="mt-2"
												/>
											</div>
											<DialogFooter>
												<Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
													Cancel
												</Button>
												<Button
													variant="destructive"
													onClick={handleDeleteAccount}
													disabled={isDeletingAccount}
												>
													{isDeletingAccount ? (
														<>
															<CircleNotch className="mr-2 h-4 w-4 animate-spin" />
															Deleting...
														</>
													) : (
														'Backspace My Account'
													)}
												</Button>
											</DialogFooter>
										</DialogContent>
									</Dialog>
								</div>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
