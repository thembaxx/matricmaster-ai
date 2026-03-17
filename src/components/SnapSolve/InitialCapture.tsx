'use client';

import { Camera01Icon, Upload01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface InitialCaptureProps {
	onCameraClick: () => void;
	onUploadClick: () => void;
}

export function InitialCapture({ onCameraClick, onUploadClick }: InitialCaptureProps) {
	return (
		<m.div
			initial={{ opacity: 0, scale: 0.95 }}
			animate={{ opacity: 1, scale: 1 }}
			className="flex flex-col items-center justify-center py-12"
		>
			<Card className="p-8 text-center bg-gradient-to-br from-tiimo-lavender/10 to-purple-500/10 border-tiimo-lavender/20 max-w-md">
				<div className="w-24 h-24 bg-tiimo-lavender/20 rounded-full flex items-center justify-center mx-auto mb-6">
					<HugeiconsIcon icon={Camera01Icon} className="w-12 h-12 text-tiimo-lavender" />
				</div>
				<h2 className="text-2xl font-black text-foreground mb-2">Snap your question</h2>
				<p className="text-muted-foreground mb-8">
					Take a photo or upload an image of your question. Our AI will solve it step by step.
				</p>
				<div className="flex flex-col gap-3">
					<Button size="lg" className="w-full gap-2" onClick={onCameraClick}>
						<HugeiconsIcon icon={Camera01Icon} className="w-5 h-5" />
						Take Photo
					</Button>
					<Button size="lg" variant="outline" className="w-full gap-2" onClick={onUploadClick}>
						<HugeiconsIcon icon={Upload01Icon} className="w-5 h-5" />
						Upload Image
					</Button>
				</div>
				<p className="text-xs text-muted-foreground mt-6">
					Supports Grade 12 NSC curriculum questions
				</p>
			</Card>
		</m.div>
	);
}
