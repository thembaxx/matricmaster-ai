'use client';

import { Loading03Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

export function LoadingState() {
	return (
		<div className="flex flex-col h-full bg-background relative grow overflow-hidden">
			<div className="flex-1 flex flex-col items-center justify-center p-6">
				<div className="text-center space-y-4">
					<HugeiconsIcon
						icon={Loading03Icon}
						className="w-12 h-12 animate-spin text-brand-blue mx-auto"
					/>
					<div className="space-y-2">
						<h3 className="font-bold text-foreground">Extracting Questions...</h3>
						<p className="text-sm text-muted-foreground">Using AI to parse the exam paper</p>
					</div>
				</div>
			</div>
		</div>
	);
}
