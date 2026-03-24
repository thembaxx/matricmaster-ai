'use client';

import { Volume2Icon, VolumeXIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import type { useAccessibility } from '@/hooks/useAccessibility';

interface HearingAccessibilityPanelProps {
	settings: ReturnType<typeof useAccessibility>['settings'];
	toggleTtsEnabled: () => void;
	toggleVisualSoundIndicators: () => void;
	isSpeaking: boolean;
	testSpeak: () => void;
}

export function HearingAccessibilityPanel({
	settings,
	toggleTtsEnabled,
	toggleVisualSoundIndicators,
	isSpeaking,
	testSpeak,
}: HearingAccessibilityPanelProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Volume2Icon className="h-5 w-5" />
					Hearing Accessibility
				</CardTitle>
				<CardDescription>Audio-based accessibility features</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="flex items-center justify-between">
					<div className="space-y-1">
						<Label htmlFor="tts-enabled">Text-to-Speech</Label>
						<p className="text-sm text-muted-foreground">Enable audio reading of content</p>
					</div>
					<div className="flex items-center gap-2">
						<Button variant="outline" size="sm" onClick={testSpeak} disabled={!settings.ttsEnabled}>
							{isSpeaking ? (
								<>
									<VolumeXIcon className="h-4 w-4 mr-2" />
									Stop
								</>
							) : (
								<>
									<Volume2Icon className="h-4 w-4 mr-2" />
									Test
								</>
							)}
						</Button>
						<Switch
							id="tts-enabled"
							checked={settings.ttsEnabled}
							onCheckedChange={toggleTtsEnabled}
						/>
					</div>
				</div>

				<Separator />

				<div className="flex items-center justify-between">
					<div className="space-y-1">
						<Label htmlFor="visual-sound-indicators">Visual Sound Indicators</Label>
						<p className="text-sm text-muted-foreground">Show visual cues for notifications</p>
					</div>
					<Switch
						id="visual-sound-indicators"
						checked={settings.visualSoundIndicators}
						onCheckedChange={toggleVisualSoundIndicators}
					/>
				</div>
			</CardContent>
		</Card>
	);
}
