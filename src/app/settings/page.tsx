'use client';

import {
	Bell,
	CheckCircle2,
	KeyRound,
	Loader2,
	Lock,
	Shield,
	Smartphone,
	User,
	XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { authClient } from '@/lib/auth-client';

export default function SettingsPage() {
	const { data: session } = authClient.useSession();

	// Account settings state
	const [displayName, setDisplayName] = useState(session?.user?.name || '');
	const [email, setEmail] = useState(session?.user?.email || '');

	// Security settings state
	const [is2FAEnabled, setIs2FAEnabled] = useState(false);
	const [isLoading2FA, setIsLoading2FA] = useState(false);
	const [showBackupCodes, setShowBackupCodes] = useState(false);
	const [backupCodes, setBackupCodes] = useState<string[]>([]);
	const [password, setPassword] = useState('');

	// Notification settings
	const [emailNotifications, setEmailNotifications] = useState(true);
	const [pushNotifications, setPushNotifications] = useState(true);
	const [studyReminders, setStudyReminders] = useState(true);
	const [achievementAlerts, setAchievementAlerts] = useState(true);

	const handleEnable2FA = async () => {
		if (!password) {
			alert('Please enter your password');
			return;
		}

		setIsLoading2FA(true);
		try {
			const result = await authClient.twoFactor.enable({ password });
			if (result.data) {
				setBackupCodes(result.data.backupCodes);
				setShowBackupCodes(true);
				setIs2FAEnabled(true);
			} else if (result.error) {
				alert(result.error.message);
			}
		} catch (error) {
			alert('Failed to enable 2FA');
		} finally {
			setIsLoading2FA(false);
		}
	};

	const handleDisable2FA = async () => {
		if (!password) {
			alert('Please enter your password');
			return;
		}

		setIsLoading2FA(true);
		try {
			const result = await authClient.twoFactor.disable({ password });
			if (result.data) {
				setIs2FAEnabled(false);
				setShowBackupCodes(false);
				setBackupCodes([]);
			} else if (result.error) {
				alert(result.error.message);
			}
		} catch (error) {
			alert('Failed to disable 2FA');
		} finally {
			setIsLoading2FA(false);
		}
	};

	const handleRegenerateBackupCodes = async () => {
		if (!password) {
			alert('Please enter your password');
			return;
		}

		setIsLoading2FA(true);
		try {
			const result = await authClient.twoFactor.generateBackupCodes({ password });
			if (result.data) {
				setBackupCodes(result.data.backupCodes);
				setShowBackupCodes(true);
			} else if (result.error) {
				alert(result.error.message);
			}
		} catch (error) {
			alert('Failed to regenerate backup codes');
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
							<a href="/sign-in">Sign In</a>
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background p-4 md:p-8">
			<div className="max-w-4xl mx-auto">
				<h1 className="text-3xl font-bold mb-2">Settings</h1>
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
									/>
								</div>
								<div className="grid gap-2">
									<Label htmlFor="email">Email</Label>
									<Input
										id="email"
										type="email"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										placeholder="your@email.com"
										disabled
									/>
									<p className="text-xs text-muted-foreground">
										Email cannot be changed. Contact support if you need to update it.
									</p>
								</div>
								<Button>Save Changes</Button>
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
									<Smartphone className="h-5 w-5" />
									Two-Factor Authentication
								</CardTitle>
								<CardDescription>Add an extra layer of security to your account</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										{is2FAEnabled ? (
											<CheckCircle2 className="h-5 w-5 text-green-500" />
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
														{isLoading2FA && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
														Disable 2FA
													</Button>
												) : (
													<>
														<Button onClick={handleEnable2FA} disabled={isLoading2FA}>
															{isLoading2FA && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
															Enable 2FA
														</Button>
														<Button
															variant="outline"
															onClick={handleRegenerateBackupCodes}
															disabled={isLoading2FA || !is2FAEnabled}
														>
															<KeyRound className="mr-2 h-4 w-4" />
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
												⚠️ Save Your Backup Codes
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
									<Input id="currentPassword" type="password" placeholder="••••••••" />
								</div>
								<div className="grid gap-2">
									<Label htmlFor="newPassword">New Password</Label>
									<Input id="newPassword" type="password" placeholder="••••••••" />
								</div>
								<div className="grid gap-2">
									<Label htmlFor="confirmPassword">Confirm New Password</Label>
									<Input id="confirmPassword" type="password" placeholder="••••••••" />
								</div>
								<Button>Update Password</Button>
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
									<Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
								</div>
								<Separator />
								<div className="flex items-center justify-between">
									<div>
										<p className="font-medium">Push Notifications</p>
										<p className="text-sm text-muted-foreground">Receive browser notifications</p>
									</div>
									<Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
								</div>
								<Separator />
								<div className="flex items-center justify-between">
									<div>
										<p className="font-medium">Study Reminders</p>
										<p className="text-sm text-muted-foreground">Daily reminders to study</p>
									</div>
									<Switch checked={studyReminders} onCheckedChange={setStudyReminders} />
								</div>
								<Separator />
								<div className="flex items-center justify-between">
									<div>
										<p className="font-medium">Achievement Alerts</p>
										<p className="text-sm text-muted-foreground">
											Get notified when you earn achievements
										</p>
									</div>
									<Switch checked={achievementAlerts} onCheckedChange={setAchievementAlerts} />
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					{/* Privacy Tab */}
					<TabsContent value="privacy" className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Privacy Settings</CardTitle>
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
									<Switch defaultChecked />
								</div>
								<Separator />
								<div className="flex items-center justify-between">
									<div>
										<p className="font-medium">Show on Leaderboard</p>
										<p className="text-sm text-muted-foreground">
											Appear on the public leaderboard
										</p>
									</div>
									<Switch defaultChecked />
								</div>
								<Separator />
								<div className="flex items-center justify-between">
									<div>
										<p className="font-medium">Analytics Tracking</p>
										<p className="text-sm text-muted-foreground">
											Help us improve by sharing usage data
										</p>
									</div>
									<Switch defaultChecked />
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
										<p className="font-medium">Delete Account</p>
										<p className="text-sm text-muted-foreground">
											Permanently delete your account and all data
										</p>
									</div>
									<Button variant="destructive" size="sm">
										Delete Account
									</Button>
								</div>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
