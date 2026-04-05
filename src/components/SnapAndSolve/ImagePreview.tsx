'use client';

import { Cancel01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { memo } from 'react';
import { SafeImage } from '@/components/SafeImage';

interface ImagePreviewProps {
	preview: string;
	onRemove: () => void;
}

export const ImagePreview = memo(function ImagePreview({ preview, onRemove }: ImagePreviewProps) {
	return (
		<div className="relative w-full aspect-video rounded-[2.5rem] overflow-hidden border-4 border-card shadow-soft-lg">
			<SafeImage src={preview} alt="Question preview" className="w-full h-full object-cover" />
			<button
				type="button"
				onClick={onRemove}
				className="absolute top-4 right-4 w-10 h-10 bg-black/50 backdrop-blur-md text-white rounded-full flex items-center justify-center"
			>
				<HugeiconsIcon icon={Cancel01Icon} className="w-5 h-5" />
			</button>
		</div>
	);
});
