'use client';

import { EyeIcon, EyeOffIcon, HandIcon, TextIcon, Volume2Icon, VolumeXIcon } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { useAccessibility } from '@/hooks/useAccessibility';
import { useSession } from '@/lib/auth-client';

function PreviewPanel({ settings }: { settings: ReturnType<typeof useAccessibility>['settings'] }) {
	const previewStyle: React.CSSProperties = {
		fontSize: `${1 * (settings.textSize === 'large' ? 1.25 : settings.textSize === 'x-large' ? 1.5 : settings.textSize === 'xx-large' ? 2 : 1)}rem`,
	};

	if (settings.highContrast) {
		previewStyle.backgroundColor = '#000000';
		previewStyle.color = '#ffffff';
		previewStyle.border = '2px solid #ffffff';
	}

	return (
		<div className="p-4 rounded-lg border-2 transition-all" style={previewStyle}>
			<p className="font-semibold mb-2">Preview Text</p>
			<p className="text-sm opacity-80">
				This is how your content will appear with current settings.
			</p>
			<div className="mt-4 flex gap-2">
				<button
					type="button"
					className="px-3 py-1 rounded transition-all"
					style={{
						padding: settings.largerTargets ? '12px 24px' : '8px 16px',
						outline: settings.focusIndicators ? '3px solid #6366f1' : 'none',
					}}
				>
					Button
				</button>
			</div>
		</div>
	);
}

export function AccessibilitySettings() {
	const { data: session } = useSession();
	const accessibility = useAccessibility(session?.user?.id as string | undefined);
	const [activePreview, setActivePreview] = useState(false);

	const {
		settings,
		toggleHighContrast,
		setTextSize,
		toggleReducedMotion,
		setColorBlindMode,
		toggleSimplifiedLanguage,
		toggleTtsEnabled,
		toggleLargerTargets,
		toggleKeyboardNavigation,
		toggleChunkedContent,
		toggleProgressBreadcrumbs,
		toggleOneThingAtATime,
		toggleSkipLinks,
		toggleHoldToClick,
		toggleFocusIndicators,
		toggleVisualSoundIndicators,
		reset,
		speak,
		stopSpeaking,
		isSpeaking,
		textSizeOptions,
		colorBlindOptions,
	} = accessibility;

	const testSpeak = useCallback(() => {
		if (isSpeaking) {
			stopSpeaking();
		} else {
			speak('Hello! This is a test of the text to speech feature.');
		}
	}, [isSpeaking, speak, stopSpeaking]);

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold">Accessibility Settings</h2>
					<p className="text-muted-foreground">Customize your learning experience</p>
				</div>
				<Button variant="outline" onClick={reset}>
					Reset to Defaults
				</Button>
			</div>

			{activePreview && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<EyeIcon className="h-5 w-5" />
							Live Preview
						</CardTitle>
						<CardDescription>See how your settings affect the interface</CardDescription>
					</CardHeader>
					<CardContent>
						<PreviewPanel settings={settings} />
					</CardContent>
				</Card>
			)}

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<EyeIcon className="h-5 w-5" />
						Visual Accessibility
					</CardTitle>
					<CardDescription>Customize how content is displayed</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="flex items-center justify-between">
						<div className="space-y-1">
							<Label htmlFor="high-contrast">High Contrast Mode</Label>
							<p className="text-sm text-muted-foreground">Increase contrast for easier reading</p>
						</div>
						<Switch
							id="high-contrast"
							checked={settings.highContrast}
							onCheckedChange={toggleHighContrast}
						/>
					</div>

					<Separator />

					<div className="space-y-3">
						<Label>Text Size</Label>
						<Select
							value={settings.textSize}
							onValueChange={(v) => setTextSize(v as 'normal' | 'large' | 'x-large' | 'xx-large')}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{textSizeOptions.map((option) => (
									<SelectItem key={option.value} value={option.value}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<Separator />

					<div className="flex items-center justify-between">
						<div className="space-y-1">
							<Label htmlFor="reduced-motion">Reduced Motion</Label>
							<p className="text-sm text-muted-foreground">Minimize animations and transitions</p>
						</div>
						<Switch
							id="reduced-motion"
							checked={settings.reducedMotion}
							onCheckedChange={toggleReducedMotion}
						/>
					</div>

					<Separator />

					<div className="space-y-3">
						<Label>Color Blind Mode</Label>
						<Select
							value={settings.colorBlindMode}
							onValueChange={(v) =>
								setColorBlindMode(v as 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia')
							}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{colorBlindOptions.map((option) => (
									<SelectItem key={option.value} value={option.value}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<Separator />

					<div className="flex items-center justify-between">
						<div className="space-y-1">
							<Label htmlFor="focus-indicators">Enhanced Focus Indicators</Label>
							<p className="text-sm text-muted-foreground">
								Show stronger outlines when focusing elements
							</p>
						</div>
						<Switch
							id="focus-indicators"
							checked={settings.focusIndicators}
							onCheckedChange={toggleFocusIndicators}
						/>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<TextIcon className="h-5 w-5" />
						Cognitive Accessibility
					</CardTitle>
					<CardDescription>Help with comprehension and focus</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="flex items-center justify-between">
						<div className="space-y-1">
							<Label htmlFor="simplified-language">Simplified Language</Label>
							<p className="text-sm text-muted-foreground">
								Use simpler vocabulary in AI responses
							</p>
						</div>
						<Switch
							id="simplified-language"
							checked={settings.simplifiedLanguage}
							onCheckedChange={toggleSimplifiedLanguage}
						/>
					</div>

					<Separator />

					<div className="flex items-center justify-between">
						<div className="space-y-1">
							<Label htmlFor="chunked-content">Chunked Content</Label>
							<p className="text-sm text-muted-foreground">
								Break long passages into smaller sections
							</p>
						</div>
						<Switch
							id="chunked-content"
							checked={settings.chunkedContent}
							onCheckedChange={toggleChunkedContent}
						/>
					</div>

					<Separator />

					<div className="flex items-center justify-between">
						<div className="space-y-1">
							<Label htmlFor="progress-breadcrumbs">Progress Breadcrumbs</Label>
							<p className="text-sm text-muted-foreground">Show clear path indicators</p>
						</div>
						<Switch
							id="progress-breadcrumbs"
							checked={settings.progressBreadcrumbs}
							onCheckedChange={toggleProgressBreadcrumbs}
						/>
					</div>

					<Separator />

					<div className="flex items-center justify-between">
						<div className="space-y-1">
							<Label htmlFor="one-thing-at-a-time">One Thing at a Time</Label>
							<p className="text-sm text-muted-foreground">Hide secondary information</p>
						</div>
						<Switch
							id="one-thing-at-a-time"
							checked={settings.oneThingAtATime}
							onCheckedChange={toggleOneThingAtATime}
						/>
					</div>
				</CardContent>
			</Card>

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
							<Button
								variant="outline"
								size="sm"
								onClick={testSpeak}
								disabled={!settings.ttsEnabled}
							>
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

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<HandIcon className="h-5 w-5" />
						Motor Accessibility
					</CardTitle>
					<CardDescription>Help with navigation and interaction</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="flex items-center justify-between">
						<div className="space-y-1">
							<Label htmlFor="larger-targets">Larger Click Targets</Label>
							<p className="text-sm text-muted-foreground">
								Increase button and interactive element size by 40%
							</p>
						</div>
						<Switch
							id="larger-targets"
							checked={settings.largerTargets}
							onCheckedChange={toggleLargerTargets}
						/>
					</div>

					<Separator />

					<div className="flex items-center justify-between">
						<div className="space-y-1">
							<Label htmlFor="keyboard-navigation">Enhanced Keyboard Navigation</Label>
							<p className="text-sm text-muted-foreground">Improve keyboard navigation support</p>
						</div>
						<Switch
							id="keyboard-navigation"
							checked={settings.keyboardNavigation}
							onCheckedChange={toggleKeyboardNavigation}
						/>
					</div>

					<Separator />

					<div className="flex items-center justify-between">
						<div className="space-y-1">
							<Label htmlFor="skip-links">Skip Links</Label>
							<p className="text-sm text-muted-foreground">Allow jumping to main content</p>
						</div>
						<Switch
							id="skip-links"
							checked={settings.skipLinks}
							onCheckedChange={toggleSkipLinks}
						/>
					</div>

					<Separator />

					<div className="flex items-center justify-between">
						<div className="space-y-1">
							<Label htmlFor="hold-to-click">Hold-to-Click</Label>
							<p className="text-sm text-muted-foreground">
								Hold button instead of clicking (for motor difficulties)
							</p>
						</div>
						<Switch
							id="hold-to-click"
							checked={settings.holdToClick}
							onCheckedChange={toggleHoldToClick}
						/>
					</div>
				</CardContent>
			</Card>

			<Button
				className="w-full"
				variant={activePreview ? 'default' : 'outline'}
				onClick={() => setActivePreview(!activePreview)}
			>
				{activePreview ? (
					<>
						<EyeOffIcon className="h-4 w-4 mr-2" />
						Hide Preview
					</>
				) : (
					<>
						<EyeIcon className="h-4 w-4 mr-2" />
						Show Live Preview
					</>
				)}
			</Button>
		</div>
	);
}
