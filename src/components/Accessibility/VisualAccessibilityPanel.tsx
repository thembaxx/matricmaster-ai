'use client';

import { EyeIcon } from 'lucide-react';
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
import type { useAccessibility } from '@/hooks/useAccessibility';

interface VisualAccessibilityPanelProps {
	settings: ReturnType<typeof useAccessibility>['settings'];
	toggleHighContrast: () => void;
	setTextSize: (size: 'normal' | 'large' | 'x-large' | 'xx-large') => void;
	toggleReducedMotion: () => void;
	setColorBlindMode: (mode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia') => void;
	toggleFocusIndicators: () => void;
	textSizeOptions: ReturnType<typeof useAccessibility>['textSizeOptions'];
	colorBlindOptions: ReturnType<typeof useAccessibility>['colorBlindOptions'];
}

export function VisualAccessibilityPanel({
	settings,
	toggleHighContrast,
	setTextSize,
	toggleReducedMotion,
	setColorBlindMode,
	toggleFocusIndicators,
	textSizeOptions,
	colorBlindOptions,
}: VisualAccessibilityPanelProps) {
	return (
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
	);
}
