'use client';

import { Camera01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { motion as m } from 'motion/react';
import { Button } from '@/components/ui/button';

interface SnapAndSolveImageUploaderProps {
	fileInputRef: React.RefObject<HTMLInputElement | null>;
	onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function SnapAndSolveImageUploader({
	fileInputRef,
	onImageChange,
}: SnapAndSolveImageUploaderProps) {
	return (
		<m.div
			initial={{ opacity: 0, scale: 0.9 }}
			animate={{ opacity: 1, scale: 1 }}
			className="w-full aspect-square max-w-md bg-card rounded-[3rem] border-4 border-dashed border-border flex flex-col items-center justify-center p-12 text-center gap-6"
		>
			<div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary">
				<HugeiconsIcon icon={Camera01Icon} className="w-12 h-12" />
			</div>
			<div className="space-y-2">
				<h3 className="text-xl font-black  tracking-tight">Snap your question</h3>
				<p className="text-sm text-muted-foreground font-medium">
					Take a clear photo of any textbook or handwritten question.
				</p>
			</div>
			<input
				type="file"
				accept="image/*"
				capture="environment"
				className="hidden"
				ref={fileInputRef}
				onChange={onImageChange}
			/>
			<Button
				onClick={() => fileInputRef.current?.click()}
				className="rounded-full px-8 h-14 font-black  text-xs tracking-widest shadow-xl shadow-primary/20"
			>
				Open Camera
			</Button>
		</m.div>
	);
}
