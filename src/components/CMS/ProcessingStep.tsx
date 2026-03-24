'use client';

import { SparklesIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Progress } from '@/components/ui/progress';

interface ProcessingStepProps {
	processingStatus: string;
	processingProgress: number;
}

export function ProcessingStep({ processingStatus, processingProgress }: ProcessingStepProps) {
	return (
		<div className="flex flex-col items-center justify-center py-24 px-8 gap-8">
			<div className="relative">
				<div className="absolute inset-0 bg-brand-blue/20 blur-3xl rounded-full animate-pulse" />
				<HugeiconsIcon
					icon={SparklesIcon}
					className="h-16 w-16 text-brand-blue relative z-10 animate-bounce"
				/>
			</div>
			<div className="w-full max-w-md space-y-4">
				<div className="flex justify-between items-end">
					<div className="space-y-1">
						<h3 className="text-2xl font-black  tracking-tighter">Working Magic</h3>
						<p className="text-muted-foreground font-bold text-sm">{processingStatus}</p>
					</div>
					<span className="font-black text-brand-blue">{processingProgress}%</span>
				</div>
				<Progress value={processingProgress} className="h-3 rounded-full bg-muted" />
			</div>
		</div>
	);
}
