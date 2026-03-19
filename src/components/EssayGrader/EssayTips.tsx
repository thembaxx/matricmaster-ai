'use client';

import { CheckmarkCircle02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Card, CardContent } from '@/components/ui/card';

export function EssayTips() {
	return (
		<Card className="mt-6 bg-muted/50">
			<CardContent className="p-6">
				<h3 className="font-semibold mb-3">Tips for Better Essays</h3>
				<div className="grid md:grid-cols-3 gap-4 text-sm text-muted-foreground">
					<div className="flex gap-2">
						<HugeiconsIcon
							icon={CheckmarkCircle02Icon}
							className="w-4 h-4 text-green-500 shrink-0 mt-0.5"
						/>
						<p>Always plan your essay before writing</p>
					</div>
					<div className="flex gap-2">
						<HugeiconsIcon
							icon={CheckmarkCircle02Icon}
							className="w-4 h-4 text-green-500 shrink-0 mt-0.5"
						/>
						<p>Use the PEEL method (Point, Evidence, Explain, Link)</p>
					</div>
					<div className="flex gap-2">
						<HugeiconsIcon
							icon={CheckmarkCircle02Icon}
							className="w-4 h-4 text-green-500 shrink-0 mt-0.5"
						/>
						<p>Proofread for grammar and spelling errors</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
