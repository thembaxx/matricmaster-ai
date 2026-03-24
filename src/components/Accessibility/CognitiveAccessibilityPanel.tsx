'use client';

import { TextIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import type { useAccessibility } from '@/hooks/useAccessibility';

interface CognitiveAccessibilityPanelProps {
	settings: ReturnType<typeof useAccessibility>['settings'];
	toggleSimplifiedLanguage: () => void;
	toggleChunkedContent: () => void;
	toggleProgressBreadcrumbs: () => void;
	toggleOneThingAtATime: () => void;
}

export function CognitiveAccessibilityPanel({
	settings,
	toggleSimplifiedLanguage,
	toggleChunkedContent,
	toggleProgressBreadcrumbs,
	toggleOneThingAtATime,
}: CognitiveAccessibilityPanelProps) {
	return (
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
						<p className="text-sm text-muted-foreground">Use simpler vocabulary in AI responses</p>
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
	);
}
