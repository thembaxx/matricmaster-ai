'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';

interface NotificationsTabProps {
	emailNotifications: boolean;
	pushNotifications: boolean;
	studyReminders: boolean;
	achievementAlerts: boolean;
	whatsappNotifications: boolean;
	handleNotificationChange: (key: string, value: boolean) => void;
}

export function NotificationsTab({
	emailNotifications,
	pushNotifications,
	studyReminders,
	achievementAlerts,
	whatsappNotifications,
	handleNotificationChange,
}: NotificationsTabProps) {
	return (
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
				<div className="flex items-center">
					<div className="grow">
						<p className="font-medium">Push Notifications</p>
						<p className="text-sm text-muted-foreground">Receive browser notifications</p>
					</div>
					<Switch
						size="default"
						checked={pushNotifications}
						onCheckedChange={(v) => handleNotificationChange('pushNotifications', v)}
					/>
				</div>
				<Separator />
				<div className="flex items-center justify-between">
					<div>
						<p className="font-medium">WhatsApp Notifications</p>
						<p className="text-sm text-muted-foreground">Receive updates via WhatsApp</p>
					</div>
					<Switch
						checked={whatsappNotifications}
						onCheckedChange={(v) => handleNotificationChange('whatsappNotifications', v)}
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
						<p className="text-sm text-muted-foreground">Get notified when you earn achievements</p>
					</div>
					<Switch
						checked={achievementAlerts}
						onCheckedChange={(v) => handleNotificationChange('achievementAlerts', v)}
					/>
				</div>
			</CardContent>
		</Card>
	);
}
