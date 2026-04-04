'use client';

import { FolderOpenIcon, HomeIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
	title?: string;
	description?: string;
	showHome?: boolean;
}

export function EmptyState({
	title = 'No past papers found',
	description = 'Try adjusting your filters or search query',
	showHome = false,
}: EmptyStateProps) {
	return (
		<div className="flex flex-col items-center justify-center py-16 text-center gap-6">
			<div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
				<HugeiconsIcon icon={FolderOpenIcon} className="w-10 h-10 text-muted-foreground" />
			</div>
			<div className="space-y-2">
				<h3 className="text-xl font-bold text-foreground">{title}</h3>
				<p className="text-sm text-muted-foreground max-w-xs">{description}</p>
			</div>
			{showHome && (
				<Link href="/dashboard" transitionTypes={['fade']}>
					<Button className="gap-2">
						<HugeiconsIcon icon={HomeIcon} className="w-4 h-4" />
						Go to Dashboard
					</Button>
				</Link>
			)}
		</div>
	);
}
