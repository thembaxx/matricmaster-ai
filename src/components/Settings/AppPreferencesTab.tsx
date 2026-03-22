import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useSettings } from '@/contexts/SettingsContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function AppPreferencesTab() {
	const { dataSaverMode, setDataSaverMode, aiLanguage, setAiLanguage } = useSettings();

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<div className="flex justify-between items-start">
						<div>
							<CardTitle>Data Saver Mode</CardTitle>
							<CardDescription>
								Optimize the app for low-bandwidth connections.
							</CardDescription>
						</div>
						<Badge variant="outline">South Africa</Badge>
					</div>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="flex items-center justify-between">
						<div className="space-y-0.5">
							<Label>Enable Data Saver</Label>
							<p className="text-sm text-muted-foreground">
								Downgrades video call quality and disables auto-playing AI voice answers to save mobile data.
							</p>
						</div>
						<Switch
							checked={dataSaverMode}
							onCheckedChange={setDataSaverMode}
						/>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>AI Language Preference</CardTitle>
					<CardDescription>
						Ensure the AI strictly replies in your preferred language for localized subjects.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col space-y-2">
						<Label>Language Context</Label>
						<Select value={aiLanguage} onValueChange={(val: 'en' | 'af') => setAiLanguage(val)}>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Select language" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="en">English (Default)</SelectItem>
								<SelectItem value="af">Afrikaans</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
