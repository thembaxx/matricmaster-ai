'use client';

import { Cancel01Icon, Download01Icon, Settings01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useOfflineAIStore } from '@/stores/useOfflineAIStore';

const MODEL_OPTIONS = [
	{
		id: 'llama-3.2-1b',
		name: 'Llama 3.2 1B',
		size: '~500MB',
		description: 'Fast, mobile-friendly',
	},
	{
		id: 'gemma-2-2b',
		name: 'Gemma 2 2B',
		size: '~1.6GB',
		description: 'Better quality, needs more storage',
	},
];

const STORAGE_KEY = 'webllm_model_preference';

export const WebLLMDownloader = memo(function WebLLMDownloader() {
	const isModelReady = useOfflineAIStore((s) => s.isModelReady);
	const downloadProgress = useOfflineAIStore((s) => s.downloadProgress);
	const initialize = useOfflineAIStore((s) => s.initialize);
	const isSupported = useOfflineAIStore((s) => s.isSupported);
	const [dismissed, setDismissed] = useState(false);
	const [showSettings, setShowSettings] = useState(false);
	const [selectedModel, setSelectedModel] = useState(
		typeof window !== 'undefined'
			? localStorage.getItem(STORAGE_KEY) || 'llama-3.2-1b'
			: 'llama-3.2-1b'
	);

	const handleDismiss = useCallback(() => setDismissed(true), []);
	const handleShowSettings = useCallback((open: boolean) => setShowSettings(open), []);
	const handleModelChange = useCallback((value: string) => {
		setSelectedModel(value);
		localStorage.setItem(STORAGE_KEY, value);
	}, []);

	useEffect(() => {
		if (!isModelReady && !dismissed && isSupported) {
			initialize();
		}
	}, [isModelReady, dismissed, isSupported, initialize]);

	const currentModel = useMemo(
		() => MODEL_OPTIONS.find((m) => m.id === selectedModel),
		[selectedModel]
	);

	if (isModelReady || dismissed || !isSupported) return null;

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
								? `Downloading ${currentModel?.name}... ${downloadProgress}%`
								: 'Almost ready!'}
						</p>
						<div className="w-full bg-muted rounded-full h-2 mt-2 overflow-hidden">
							<div
								className="bg-primary h-full transition-all duration-300"
								style={{ width: `${downloadProgress}%` }}
							/>
						</div>
					</div>
					<Dialog open={showSettings} onOpenChange={handleShowSettings}>
						<DialogTrigger asChild>
							<Button variant="ghost" size="icon" className="h-8 w-8">
								<HugeiconsIcon icon={Settings01Icon} className="w-4 h-4" />
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>AI Model Settings</DialogTitle>
								<DialogDescription>
									Choose a model that fits your device capabilities
								</DialogDescription>
							</DialogHeader>
							<RadioGroup value={selectedModel} onValueChange={handleModelChange} className="mt-4">
								{MODEL_OPTIONS.map((model) => (
									<div key={model.id} className="flex items-center space-x-2">
										<RadioGroupItem value={model.id} id={model.id} />
										<Label htmlFor={model.id} className="flex flex-col cursor-pointer">
											<span className="font-medium">
												{model.name}
												<span className="text-muted-foreground text-xs ml-2">({model.size})</span>
											</span>
											<span className="text-xs text-muted-foreground">{model.description}</span>
										</Label>
									</div>
								))}
							</RadioGroup>
						</DialogContent>
					</Dialog>
					<Button variant="ghost" size="icon" onClick={handleDismiss} className="h-8 w-8">
						<HugeiconsIcon icon={Cancel01Icon} className="w-4 h-4" />
					</Button>
				</div>
			</div>
		</div>
	);
});
