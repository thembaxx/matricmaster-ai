'use client';

import { Check, Loader2, Shield, Smartphone, Volume2, VolumeX } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
	cancelReminder,
	generateVerificationCode,
	getUserPreferences,
	updateReminderPreferences,
	verifyPhoneNumber,
} from '@/services/whatsapp-reminder-service';
import { sendVerificationCode } from '@/services/whatsapp-service';

const NOTIFICATION_TYPES = [
	{
		id: 'study_reminder',
		label: 'Study Reminders',
		icon: '🔔',
		description: 'Get reminded to study',
	},
	{
		id: 'achievement_share',
		label: 'Achievements',
		icon: '🏆',
		description: 'Share your achievements',
	},
	{
		id: 'buddy_update',
		label: 'Buddy Updates',
		icon: '👥',
		description: 'Know when friends beat your score',
	},
	{ id: 'daily_tip', label: 'Daily Tips', icon: '💡', description: 'Study tips and motivation' },
];

export function WhatsAppSettings() {
	const [phoneNumber, setPhoneNumber] = useState('');
	const [verificationCode, setVerificationCode] = useState('');
	const [isVerified, setIsVerified] = useState(false);
	const [isOptedIn, setIsOptedIn] = useState(true);
	const [isLoading, setIsLoading] = useState(false);
	const [notificationTypes, setNotificationTypes] = useState<string[]>([]);
	const [quietHoursStart, setQuietHoursStart] = useState('22:00');
	const [quietHoursEnd, setQuietHoursEnd] = useState('08:00');
	const [reminderFrequency, setReminderFrequency] = useState('daily');
	const [showVerification, setShowVerification] = useState(false);
	const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

	const Spinner = Loader2;

	const _loadPreferences = useCallback(async () => {
		try {
			const userPrefs = await getUserPreferences('current-user');
			if (userPrefs) {
				setPhoneNumber(userPrefs.phoneNumber || '');
				setNotificationTypes(userPrefs.notificationTypes || []);
				setQuietHoursStart(userPrefs.quietHoursStart || '22:00');
				setQuietHoursEnd(userPrefs.quietHoursEnd || '08:00');
			}
		} catch (error) {
			console.error('Error loading preferences:', error);
		}
	}, []);

	useEffect(() => {
		_loadPreferences();
	}, [_loadPreferences]);

	async function handleSendCode() {
		if (!phoneNumber) return;

		setIsLoading(true);
		setMessage(null);
		try {
			const code = await generateVerificationCode('current-user');
			if (code) {
				await sendVerificationCode(phoneNumber, code);
				setShowVerification(true);
				setMessage({ type: 'success', text: 'Code sent to your WhatsApp!' });
			}
		} catch {
			setMessage({ type: 'error', text: 'Failed to send code' });
		} finally {
			setIsLoading(false);
		}
	}

	async function handleVerify() {
		if (!verificationCode || verificationCode.length !== 6) return;

		setIsLoading(true);
		setMessage(null);
		try {
			const isValid = await verifyPhoneNumber(phoneNumber, verificationCode);
			if (isValid) {
				setIsVerified(true);
				setMessage({ type: 'success', text: 'Phone verified successfully!' });
			} else {
				setMessage({ type: 'error', text: 'Invalid verification code' });
			}
		} catch {
			setMessage({ type: 'error', text: 'Verification failed' });
		} finally {
			setIsLoading(false);
		}
	}

	async function handleSavePreferences() {
		setIsLoading(true);
		try {
			await updateReminderPreferences('current-user', {
				notificationTypes,
				quietHoursStart,
				quietHoursEnd,
				frequency: reminderFrequency as 'daily' | 'weekly' | 'custom',
			});
			setMessage({ type: 'success', text: 'Preferences saved!' });
		} catch {
			setMessage({ type: 'error', text: 'Failed to save preferences' });
		} finally {
			setIsLoading(false);
		}
	}

	async function handleDisconnect() {
		setIsLoading(true);
		try {
			await cancelReminder('current-user');
			setIsOptedIn(false);
			setMessage({ type: 'success', text: 'WhatsApp disconnected' });
		} catch {
			setMessage({ type: 'error', text: 'Failed to disconnect' });
		} finally {
			setIsLoading(false);
		}
	}

	function handleNotificationToggle(typeId: string, enabled: boolean) {
		if (enabled) {
			setNotificationTypes([...notificationTypes, typeId]);
		} else {
			setNotificationTypes(notificationTypes.filter((t) => t !== typeId));
		}
	}

	if (!isOptedIn) {
		return (
			<div className="container mx-auto py-8 max-w-2xl">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Smartphone className="h-5 w-5" />
							WhatsApp Settings
						</CardTitle>
						<CardDescription>Connect WhatsApp to receive study reminders</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="text-center py-8">
							<Smartphone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
							<p className="text-muted-foreground">WhatsApp is not connected</p>
							<Button className="mt-4" onClick={() => setIsOptedIn(true)}>
								Connect WhatsApp
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="container mx-auto py-8 max-w-2xl">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Smartphone className="h-5 w-5" />
						WhatsApp Settings
					</CardTitle>
					<CardDescription>Manage your WhatsApp notifications and preferences</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					{message && (
						<div
							className={`p-3 rounded-md text-sm ${
								message.type === 'success'
									? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
									: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
							}`}
						>
							{message.text}
						</div>
					)}

					<div className="space-y-4">
						<h3 className="font-medium flex items-center gap-2">
							<Shield className="h-4 w-4" />
							Phone Verification
						</h3>

						{!isVerified ? (
							<div className="space-y-3">
								<Label htmlFor="phone">Phone Number</Label>
								<div className="flex gap-2">
									<Input
										id="phone"
										type="tel"
										placeholder="+27 81 234 5678"
										value={phoneNumber}
										onChange={(e) => setPhoneNumber(e.target.value)}
									/>
									<Button onClick={handleSendCode} disabled={!phoneNumber || isLoading}>
										{isLoading ? <Spinner className="h-4 w-4 animate-spin" /> : 'Send Code'}
									</Button>
								</div>

								{showVerification && (
									<div className="space-y-3">
										<Label htmlFor="code">Verification Code</Label>
										<div className="flex gap-2">
											<Input
												id="code"
												type="text"
												placeholder="123456"
												value={verificationCode}
												onChange={(e) => setVerificationCode(e.target.value)}
												maxLength={6}
												className="w-32"
											/>
											<Button onClick={handleVerify} disabled={!verificationCode || isLoading}>
												{isLoading ? <Spinner className="h-4 w-4 animate-spin" /> : 'Verify'}
											</Button>
										</div>
									</div>
								)}
							</div>
						) : (
							<div className="flex items-center gap-2 p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
								<Check className="h-5 w-5 text-green-600" />
								<span className="text-green-800 dark:text-green-400">{phoneNumber} verified</span>
							</div>
						)}
					</div>

					<Separator />

					<div className="space-y-4">
						<h3 className="font-medium">Notification Types</h3>
						<div className="space-y-3">
							{NOTIFICATION_TYPES.map((type) => (
								<div key={type.id} className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<span>{type.icon}</span>
										<div>
											<p className="font-medium text-sm">{type.label}</p>
											<p className="text-xs text-muted-foreground">{type.description}</p>
										</div>
									</div>
									<Switch
										checked={notificationTypes.includes(type.id)}
										onCheckedChange={(checked) => handleNotificationToggle(type.id, checked)}
									/>
								</div>
							))}
						</div>
					</div>

					<Separator />

					<div className="space-y-4">
						<h3 className="font-medium">Quiet Hours</h3>
						<div className="flex items-center gap-4">
							<div className="flex-1">
								<Label htmlFor="quietStart">Start</Label>
								<Input
									id="quietStart"
									type="time"
									value={quietHoursStart}
									onChange={(e) => setQuietHoursStart(e.target.value)}
								/>
							</div>
							<div className="flex-1">
								<Label htmlFor="quietEnd">End</Label>
								<Input
									id="quietEnd"
									type="time"
									value={quietHoursEnd}
									onChange={(e) => setQuietHoursEnd(e.target.value)}
								/>
							</div>
						</div>
					</div>

					<Separator />

					<div className="space-y-4">
						<h3 className="font-medium">Reminder Frequency</h3>
						<Select value={reminderFrequency} onValueChange={setReminderFrequency}>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="hourly">Hourly</SelectItem>
								<SelectItem value="twice_daily">Twice Daily</SelectItem>
								<SelectItem value="daily">Daily</SelectItem>
								<SelectItem value="weekly">Weekly</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<Separator />

					<div className="space-y-4">
						<h3 className="font-medium flex items-center gap-2">
							{isOptedIn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
							Notification Sound
						</h3>
						<div className="flex items-center justify-between">
							<span>Enable notification sound</span>
							<Switch checked={isOptedIn} onCheckedChange={setIsOptedIn} />
						</div>
					</div>

					<div className="flex gap-2 pt-4">
						<Button onClick={handleSavePreferences} disabled={isLoading}>
							{isLoading ? <Spinner className="h-4 w-4 animate-spin mr-2" /> : null}
							Save Preferences
						</Button>
						<Button variant="destructive" onClick={handleDisconnect} disabled={isLoading}>
							Disconnect
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
