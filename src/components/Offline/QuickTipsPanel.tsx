'use client';

import { LightbulbIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAllTips, type QuickTip } from '@/lib/offline/quick-tips';

const FALLBACK_TIPS = [
	'Download content while on WiFi to save mobile data',
	'Clear old cache monthly to free up storage space',
	'Review downloaded flashcards even when offline',
	'Watch lesson recordings anytime, even without internet',
];

export function QuickTipsPanel() {
	const [tips, setTips] = useState<string[]>(FALLBACK_TIPS);

	useEffect(() => {
		getAllTips()
			.then((dbTips) => {
				if (dbTips.length > 0) {
					const tipTexts = dbTips.slice(0, 4).map((t: QuickTip) => t.content);
					if (tipTexts.length > 0) {
						setTips(tipTexts);
					}
				}
			})
			.catch(() => {
				// Keep fallback tips
			});
	}, []);

	return (
		<Card>
			<CardHeader className="pb-3">
				<CardTitle className="flex items-center gap-2 text-base">
					<LightbulbIcon className="h-4 w-4 text-amber-500" />
					Quick Tips
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-2">
				{tips.map((tip, index) => (
					<div key={index} className="flex gap-2 text-sm">
						<span className="text-amber-500 shrink-0">•</span>
						<p className="text-muted-foreground">{tip}</p>
					</div>
				))}
			</CardContent>
		</Card>
	);
}
