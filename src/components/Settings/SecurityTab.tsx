'use client';

import {
	CancelCircleIcon,
	CheckmarkCircle02Icon,
	Key01Icon,
	Loading03Icon,
	SmartPhone01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

interface SecurityTabProps {
	is2FAEnabled: boolean;
	isLoading2FA: boolean;
	showBackupCodes: boolean;
	setShowBackupCodes: (show: boolean) => void;
	backupCodes: string[];
	password: string;
	setPassword: (p: string) => void;
	currentPassword: string;
	setCurrentPassword: (p: string) => void;
	newPassword: string;
	setNewPassword: (p: string) => void;
	confirmPassword: string;
	setConfirmPassword: (p: string) => void;
	isPendingPassword: boolean;
	handleEnable2FA: () => void;
	handleDisable2FA: () => void;
	handleRegenerateBackupCodes: () => void;
	handlePasswordChange: () => void;
}

export function SecurityTab({
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
}: SecurityTabProps) {
	return (
		<div className="flex flex-col gap-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<HugeiconsIcon icon={SmartPhone01Icon} className="h-5 w-5" />
						Two-Factor Authentication
					</CardTitle>
					<CardDescription>Add an extra layer of security to your account</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col gap-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							{is2FAEnabled ? (
								<HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-5 w-5 text-green-500" />
							) : (
								<HugeiconsIcon icon={CancelCircleIcon} className="h-5 w-5 text-muted-foreground" />
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
							<div className="flex flex-col gap-4">
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
											{isLoading2FA && (
												<HugeiconsIcon icon={Loading03Icon} className="mr-2 h-4 w-4 animate-spin" />
											)}
											Disable 2FA
										</Button>
									) : (
										<>
											<Button onClick={handleEnable2FA} disabled={isLoading2FA}>
												{isLoading2FA && (
													<HugeiconsIcon
														icon={Loading03Icon}
														className="mr-2 h-4 w-4 animate-spin"
													/>
												)}
												Enable 2FA
											</Button>
											<Button
												variant="outline"
												onClick={handleRegenerateBackupCodes}
												disabled={isLoading2FA || !is2FAEnabled}
											>
												<HugeiconsIcon icon={Key01Icon} className="mr-2 h-4 w-4" />
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
								<h4 className="font-semibold text-amber-800 mb-2">⚠️ Save Your Backup Codes</h4>
								<p className="text-sm text-amber-700 mb-4">
									Store these codes somewhere safe. You can use them to access your account if you
									lose your authenticator device.
								</p>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
									{backupCodes.map((code) => (
										<code
											key={`backup-${code}`}
											className="bg-white dark:bg-zinc-900 px-2 py-1 rounded text-sm font-mono"
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
				<CardContent className="flex flex-col gap-4">
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
								<HugeiconsIcon icon={Loading03Icon} className="mr-2 h-4 w-4 animate-spin" />
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
		</div>
	);
}
