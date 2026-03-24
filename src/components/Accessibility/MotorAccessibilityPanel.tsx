'use client';

import { HandIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import type { useAccessibility } from '@/hooks/useAccessibility';

interface MotorAccessibilityPanelProps {
	settings: ReturnType<typeof useAccessibility>['settings'];
	toggleLargerTargets: () => void;
	toggleKeyboardNavigation: () => void;
	toggleSkipLinks: () => void;
	toggleHoldToClick: () => void;
}

export function MotorAccessibilityPanel({
	settings,
	toggleLargerTargets,
	toggleKeyboardNavigation,
	toggleSkipLinks,
	toggleHoldToClick,
}: MotorAccessibilityPanelProps) {
	return (
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
					<Switch id="skip-links" checked={settings.skipLinks} onCheckedChange={toggleSkipLinks} />
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
	);
}
