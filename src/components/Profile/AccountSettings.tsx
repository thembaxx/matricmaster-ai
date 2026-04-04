'use client';

import {
	AlertCircleIcon,
	CalendarIcon,
	Delete02Icon,
	LockIcon,
	Logout04Icon,
	Mail01Icon,
	MoonIcon,
	Notification01Icon,
	PencilEdit01Icon,
	SaveIcon,
	SchoolReportCardIcon,
	SunIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { motion as m } from 'framer-motion';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

interface UserSession {
	name?: string;
	email?: string;
	image?: string;
	school?: string;
	createdAt?: string;
}

interface AccountSettingsProps {
	session?: {
		user: UserSession;
	};
	onLogout?: () => void;
	onDeleteAccount?: () => void;
}

export default function AccountSettings({
	session,
	onLogout = () => {},
	onDeleteAccount = () => {},
}: AccountSettingsProps) {
	const user = session?.user;

	const [isEditing, setIsEditing] = useState(false);
	const [editForm, setEditForm] = useState({
		name: user?.name || '',
		school: user?.school || '',
	});
	const [isSaving, setIsSaving] = useState(false);

	const [preferences, setPreferences] = useState({
		darkMode: false,
		quizReminders: true,
		achievementAlerts: true,
		weeklySummary: false,
	});

	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

	const handleSaveProfile = async () => {
		setIsSaving(true);
		try {
			await new Promise((resolve) => setTimeout(resolve, 1000));
			setIsEditing(false);
		} finally {
			setIsSaving(false);
		}
	};

	const formatDate = (dateString?: string) => {
		if (!dateString) return 'Unknown';
		const date = new Date(dateString);
		return date.toLocaleDateString('en-ZA', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});
	};

	return (
		<div className="space-y-6">
			<m.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4 }}
			>
				<Card className="rounded-[2rem] bg-card/50 backdrop-blur-sm border border-border/50">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-base font-black tracking-tight">
							<HugeiconsIcon icon={PencilEdit01Icon} className="w-4 h-4" />
							profile settings
						</CardTitle>
						<CardDescription>Update your personal information</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						{isEditing ? (
							<div className="space-y-4">
								<div className="space-y-2">
									<label
										htmlFor="settingsName"
										className="text-[10px] font-black text-muted-foreground tracking-widest ml-1"
									>
										display name
									</label>
									<Input
										id="settingsName"
										type="text"
										value={editForm.name}
										onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
										className="rounded-2xl"
									/>
								</div>
								<div className="space-y-2">
									<label
										htmlFor="settingsSchool"
										className="text-[10px] font-black text-muted-foreground tracking-widest ml-1"
									>
										school
									</label>
									<Input
										id="settingsSchool"
										type="text"
										value={editForm.school}
										onChange={(e) => setEditForm({ ...editForm, school: e.target.value })}
										placeholder="e.g. Pretoria Boys High"
										className="rounded-2xl"
									/>
								</div>
								<div className="flex gap-2 pt-2">
									<Button
										onClick={handleSaveProfile}
										disabled={isSaving}
										size="sm"
										className="rounded-full gap-2"
									>
										<HugeiconsIcon icon={SaveIcon} className="w-3 h-3" />
										{isSaving ? 'saving...' : 'save'}
									</Button>
									<Button
										variant="ghost"
										onClick={() => setIsEditing(false)}
										disabled={isSaving}
										size="sm"
										className="rounded-full"
									>
										cancel
									</Button>
								</div>
							</div>
						) : (
							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-xs font-black text-foreground">
											{user?.name?.toLowerCase() || 'Not set'}
										</p>
										<p className="text-[10px] text-muted-foreground">display name</p>
									</div>
									<Button
										variant="ghost"
										size="icon-xs"
										onClick={() => setIsEditing(true)}
										className="rounded-full"
									>
										<HugeiconsIcon icon={PencilEdit01Icon} className="w-3 h-3" />
									</Button>
								</div>
								<div className="flex items-center gap-2 text-muted-foreground">
									<HugeiconsIcon icon={SchoolReportCardIcon} className="w-3 h-3" />
									<span className="text-xs font-medium">
										{user?.school?.toLowerCase() || 'Not set'}
									</span>
								</div>
							</div>
						)}
					</CardContent>
				</Card>
			</m.div>

			<m.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4, delay: 0.1 }}
			>
				<Card className="rounded-[2rem] bg-card/50 backdrop-blur-sm border border-border/50">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-base font-black tracking-tight">
							<HugeiconsIcon icon={Mail01Icon} className="w-4 h-4" />
							account info
						</CardTitle>
						<CardDescription>Your account details</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
									<HugeiconsIcon icon={Mail01Icon} className="w-4 h-4 text-muted-foreground" />
								</div>
								<div>
									<p className="text-xs font-medium text-foreground">{user?.email}</p>
									<p className="text-[10px] text-muted-foreground">email</p>
								</div>
							</div>
						</div>
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
									<HugeiconsIcon icon={CalendarIcon} className="w-4 h-4 text-muted-foreground" />
								</div>
								<div>
									<p className="text-xs font-medium text-foreground">
										{formatDate(user?.createdAt)}
									</p>
									<p className="text-[10px] text-muted-foreground">member since</p>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</m.div>

			<m.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4, delay: 0.2 }}
			>
				<Card className="rounded-[2rem] bg-card/50 backdrop-blur-sm border border-border/50">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-base font-black tracking-tight">
							<HugeiconsIcon icon={Notification01Icon} className="w-4 h-4" />
							preferences
						</CardTitle>
						<CardDescription>Customize your experience</CardDescription>
					</CardHeader>
					<CardContent className="space-y-5">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
									<HugeiconsIcon
										icon={preferences.darkMode ? MoonIcon : SunIcon}
										className="w-4 h-4 text-muted-foreground"
									/>
								</div>
								<div>
									<p className="text-xs font-medium text-foreground">dark mode</p>
									<p className="text-[10px] text-muted-foreground">toggle theme</p>
								</div>
							</div>
							<Switch
								checked={preferences.darkMode}
								onCheckedChange={(checked) => setPreferences({ ...preferences, darkMode: checked })}
							/>
						</div>

						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
									<HugeiconsIcon
										icon={Notification01Icon}
										className="w-4 h-4 text-muted-foreground"
									/>
								</div>
								<div>
									<p className="text-xs font-medium text-foreground">quiz reminders</p>
									<p className="text-[10px] text-muted-foreground">get notified</p>
								</div>
							</div>
							<Switch
								checked={preferences.quizReminders}
								onCheckedChange={(checked) =>
									setPreferences({ ...preferences, quizReminders: checked })
								}
							/>
						</div>

						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
									<HugeiconsIcon
										icon={Notification01Icon}
										className="w-4 h-4 text-muted-foreground"
									/>
								</div>
								<div>
									<p className="text-xs font-medium text-foreground">achievement alerts</p>
									<p className="text-[10px] text-muted-foreground">badge notifications</p>
								</div>
							</div>
							<Switch
								checked={preferences.achievementAlerts}
								onCheckedChange={(checked) =>
									setPreferences({ ...preferences, achievementAlerts: checked })
								}
							/>
						</div>

						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
									<HugeiconsIcon
										icon={Notification01Icon}
										className="w-4 h-4 text-muted-foreground"
									/>
								</div>
								<div>
									<p className="text-xs font-medium text-foreground">weekly summary</p>
									<p className="text-[10px] text-muted-foreground">progress emails</p>
								</div>
							</div>
							<Switch
								checked={preferences.weeklySummary}
								onCheckedChange={(checked) =>
									setPreferences({ ...preferences, weeklySummary: checked })
								}
							/>
						</div>
					</CardContent>
				</Card>
			</m.div>

			<m.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4, delay: 0.3 }}
			>
				<Card className="rounded-[2rem] bg-card/50 backdrop-blur-sm border border-border/50">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-base font-black tracking-tight">
							<HugeiconsIcon icon={LockIcon} className="w-4 h-4" />
							security
						</CardTitle>
						<CardDescription>Manage your account security</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-xs font-medium text-foreground">change password</p>
								<p className="text-[10px] text-muted-foreground">update your password</p>
							</div>
							<Button variant="outline" size="sm" className="rounded-full">
								change
							</Button>
						</div>
						<div className="flex items-center justify-between pt-2">
							<div>
								<p className="text-xs font-medium text-foreground">sign out</p>
								<p className="text-[10px] text-muted-foreground">log out of your account</p>
							</div>
							<Button variant="outline" size="sm" onClick={onLogout} className="rounded-full gap-2">
								<HugeiconsIcon icon={Logout04Icon} className="w-3 h-3" />
								logout
							</Button>
						</div>
					</CardContent>
				</Card>
			</m.div>

			<m.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4, delay: 0.4 }}
			>
				<Card className="rounded-[2rem] bg-destructive/5 backdrop-blur-sm border border-destructive/20">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-base font-black tracking-tight text-destructive">
							<HugeiconsIcon icon={AlertCircleIcon} className="w-4 h-4" />
							danger zone
						</CardTitle>
						<CardDescription>Irreversible actions</CardDescription>
					</CardHeader>
					<CardContent>
						{showDeleteConfirm ? (
							<div className="space-y-4">
								<p className="text-xs text-destructive font-medium">
									Are you sure you want to delete your account? This action cannot be undone and all
									your data will be permanently deleted.
								</p>
								<div className="flex gap-2">
									<Button
										variant="destructive"
										size="sm"
										onClick={onDeleteAccount}
										className="rounded-full gap-2"
									>
										<HugeiconsIcon icon={Delete02Icon} className="w-3 h-3" />
										confirm delete
									</Button>
									<Button
										variant="ghost"
										size="sm"
										onClick={() => setShowDeleteConfirm(false)}
										className="rounded-full"
									>
										cancel
									</Button>
								</div>
							</div>
						) : (
							<div className="flex items-center justify-between">
								<div>
									<p className="text-xs font-medium text-foreground">delete account</p>
									<p className="text-[10px] text-muted-foreground">remove all data permanently</p>
								</div>
								<Button
									variant="destructive"
									size="sm"
									onClick={() => setShowDeleteConfirm(true)}
									className="rounded-full gap-2"
								>
									<HugeiconsIcon icon={Delete02Icon} className="w-3 h-3" />
									delete
								</Button>
							</div>
						)}
					</CardContent>
				</Card>
			</m.div>
		</div>
	);
}
