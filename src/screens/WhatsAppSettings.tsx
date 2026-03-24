'use client';

import { Loader2, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
	DisconnectedState,
	MessageDisplay,
	NotificationSoundSection,
	NotificationTypesSection,
	PhoneVerificationSection,
	QuietHoursSection,
	ReminderFrequencySection,
	useWhatsAppSettings,
} from '@/components/WhatsAppSettings';

export function WhatsAppSettings() {
	const {
		phoneNumber,
		setPhoneNumber,
		verificationCode,
		setVerificationCode,
		isVerified,
		isOptedIn,
		setIsOptedIn,
		isLoading,
		notificationTypes,
		quietHoursStart,
		setQuietHoursStart,
		quietHoursEnd,
		setQuietHoursEnd,
		reminderFrequency,
		setReminderFrequency,
		showVerification,
		message,
		handleSendCode,
		handleVerify,
		handleSavePreferences,
		handleDisconnect,
		handleNotificationToggle,
	} = useWhatsAppSettings();

	const Spinner = Loader2;

	if (!isOptedIn) {
		return <DisconnectedState onConnect={() => setIsOptedIn(true)} />;
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
					{message && <MessageDisplay message={message} />}

					<PhoneVerificationSection
						phoneNumber={phoneNumber}
						onPhoneChange={setPhoneNumber}
						verificationCode={verificationCode}
						onVerificationCodeChange={setVerificationCode}
						isVerified={isVerified}
						isLoading={isLoading}
						showVerification={showVerification}
						onSendCode={handleSendCode}
						onVerify={handleVerify}
					/>

					<Separator />

					<NotificationTypesSection
						enabledTypes={notificationTypes}
						onToggle={handleNotificationToggle}
					/>

					<Separator />

					<QuietHoursSection
						startTime={quietHoursStart}
						endTime={quietHoursEnd}
						onStartChange={setQuietHoursStart}
						onEndChange={setQuietHoursEnd}
					/>

					<Separator />

					<ReminderFrequencySection value={reminderFrequency} onChange={setReminderFrequency} />

					<Separator />

					<NotificationSoundSection enabled={isOptedIn} onToggle={setIsOptedIn} />

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
