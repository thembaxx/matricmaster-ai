import { Settings01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface SettingsCardProps {
	warningMinutes: number;
	enableSound: boolean;
	onWarningMinutesChange: (minutes: number) => void;
	onEnableSoundChange: (enabled: boolean) => void;
}

export function SettingsCard({
	warningMinutes,
	enableSound,
	onWarningMinutesChange,
	onEnableSoundChange,
}: SettingsCardProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<HugeiconsIcon icon={Settings01Icon} className="w-5 h-5" />
					Timer Settings
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex items-center justify-between">
					<div>
						<Label htmlFor="warning-alert">Warning Alert</Label>
						<p className="text-sm text-muted-foreground">Get notified when time is running low</p>
					</div>
					<select
						id="warning-alert"
						value={warningMinutes}
						onChange={(e) => onWarningMinutesChange(Number(e.target.value))}
						className="h-9 px-3 rounded-lg border bg-background text-sm focus:ring-2 focus:ring-primary"
					>
						<option value={5}>5 minutes</option>
						<option value={10}>10 minutes</option>
						<option value={15}>15 minutes</option>
						<option value={30}>30 minutes</option>
					</select>
				</div>

				<div className="flex items-center justify-between">
					<div>
						<Label htmlFor="sound-alerts">Sound Alerts</Label>
						<p className="text-sm text-muted-foreground">Play sound when time is up</p>
					</div>
					<Switch id="sound-alerts" checked={enableSound} onCheckedChange={onEnableSoundChange} />
				</div>
			</CardContent>
		</Card>
	);
}
