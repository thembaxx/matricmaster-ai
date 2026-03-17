'use client';

import { Setting05Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useZModeStore } from '@/stores/useZModeStore';

export function ZModeToggle() {
	const { isZMode, toggleZMode } = useZModeStore();

	return (
		<Card className="p-4 flex items-center justify-between">
			<div className="flex items-center gap-3">
				<div className="p-2 bg-primary/10 rounded-lg">
					<HugeiconsIcon icon={Setting05Icon} className="w-5 h-5 text-primary" />
				</div>
				<div>
					<Label htmlFor="zmode-toggle" className="font-black text-sm">
						Z-Mode
					</Label>
					<p className="text-xs text-muted-foreground">
						Save data: disable animations, reduce images, text-only AI
					</p>
				</div>
			</div>
			<Switch id="zmode-toggle" checked={isZMode} onCheckedChange={toggleZMode} />
		</Card>
	);
}
