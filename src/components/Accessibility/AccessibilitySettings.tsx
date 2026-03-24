'use client';

import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAccessibility } from '@/hooks/useAccessibility';
import { useSession } from '@/lib/auth-client';
import { CognitiveAccessibilityPanel } from './CognitiveAccessibilityPanel';
import { HearingAccessibilityPanel } from './HearingAccessibilityPanel';
import { MotorAccessibilityPanel } from './MotorAccessibilityPanel';
import { PreviewPanel } from './PreviewPanel';
import { VisualAccessibilityPanel } from './VisualAccessibilityPanel';

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

			<VisualAccessibilityPanel
				settings={settings}
				toggleHighContrast={toggleHighContrast}
				setTextSize={setTextSize}
				toggleReducedMotion={toggleReducedMotion}
				setColorBlindMode={setColorBlindMode}
				toggleFocusIndicators={toggleFocusIndicators}
				textSizeOptions={textSizeOptions}
				colorBlindOptions={colorBlindOptions}
			/>

			<CognitiveAccessibilityPanel
				settings={settings}
				toggleSimplifiedLanguage={toggleSimplifiedLanguage}
				toggleChunkedContent={toggleChunkedContent}
				toggleProgressBreadcrumbs={toggleProgressBreadcrumbs}
				toggleOneThingAtATime={toggleOneThingAtATime}
			/>

			<HearingAccessibilityPanel
				settings={settings}
				toggleTtsEnabled={toggleTtsEnabled}
				toggleVisualSoundIndicators={toggleVisualSoundIndicators}
				isSpeaking={isSpeaking}
				testSpeak={testSpeak}
			/>

			<MotorAccessibilityPanel
				settings={settings}
				toggleLargerTargets={toggleLargerTargets}
				toggleKeyboardNavigation={toggleKeyboardNavigation}
				toggleSkipLinks={toggleSkipLinks}
				toggleHoldToClick={toggleHoldToClick}
			/>

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
