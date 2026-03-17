'use client';

import { Cancel01Icon, Download01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useOfflineAIStore } from '@/stores/useOfflineAIStore';

export function WebLLMDownloader() {
	const { isModelReady, downloadProgress, initialize } = useOfflineAIStore();
	const [dismissed, setDismissed] = useState(false);

	useEffect(() => {
		if (!isModelReady && !dismissed) {
			initialize();
		}
	}, [isModelReady, dismissed, initialize]);

	if (isModelReady || dismissed) return null;

	return (
		<div className="fixed bottom-24 left-4 right-4 max-w-md mx-auto z-50">
			<div className="bg-card border border-border rounded-2xl p-4 shadow-xl">
				<div className="flex items-start gap-3">
					<div className="p-2 bg-primary/10 rounded-lg">
						<HugeiconsIcon icon={Download01Icon} className="w-5 h-5 text-primary" />
					</div>
					<div className="flex-1">
						<h4 className="font-black text-sm">Downloading Offline AI</h4>
						<p className="text-xs text-muted-foreground mt-1">
							{downloadProgress < 100
								? `Downloading Llama-3-8B... ${downloadProgress}%`
								: 'Almost ready!'}
						</p>
						<div className="w-full bg-muted rounded-full h-2 mt-2 overflow-hidden">
							<div
								className="bg-primary h-full transition-all duration-300"
								style={{ width: `${downloadProgress}%` }}
							/>
						</div>
					</div>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => setDismissed(true)}
						className="h-8 w-8"
					>
						<HugeiconsIcon icon={Cancel01Icon} className="w-4 h-4" />
					</Button>
				</div>
			</div>
		</div>
	);
}
