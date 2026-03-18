'use client';

import { ArrowLeft02Icon, Loading03Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';

const PdfViewer = dynamic(() => import('@/components/PdfViewer'), {
	ssr: false,
	loading: () => (
		<div className="flex items-center justify-center h-full">
			<HugeiconsIcon icon={Loading03Icon} className="w-8 h-8 animate-spin text-brand-blue" />
		</div>
	),
});

interface PdfViewerWrapperProps {
	url: string;
	title: string;
	onClose: () => void;
}

export function PdfViewerWrapper({ url, title, onClose }: PdfViewerWrapperProps) {
	return (
		<div className="fixed inset-0 z-[200] bg-background overflow-hidden animate-in fade-in duration-300">
			<div className="absolute top-0 left-0 right-0 z-10 px-6 py-4 bg-gradient-to-b from-background to-transparent">
				<div className="flex items-center justify-between max-w-4xl mx-auto">
					<Button
						variant="ghost"
						size="icon"
						onClick={onClose}
						className="rounded-full bg-background/80 backdrop-blur-sm"
					>
						<HugeiconsIcon icon={ArrowLeft02Icon} className="w-5 h-5" />
					</Button>
					<h2 className="text-sm font-bold text-foreground truncate">{title}</h2>
					<div className="w-10" />
				</div>
			</div>
			<PdfViewer url={url} title={title} onClose={onClose} />
		</div>
	);
}
