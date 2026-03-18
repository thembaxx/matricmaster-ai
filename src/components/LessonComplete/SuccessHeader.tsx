'use client';

import { Cancel01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useRouter } from 'next/navigation';
import { memo } from 'react';
import { Button } from '@/components/ui/button';

interface SuccessHeaderProps {
	title?: string;
}

export const SuccessHeader = memo(function SuccessHeader({
	title = 'Success',
}: SuccessHeaderProps) {
	const router = useRouter();

	return (
		<header className="px-6 py-12 flex items-center justify-between shrink-0 max-w-2xl mx-auto w-full">
			<Button
				variant="ghost"
				size="icon"
				onClick={() => router.push('/dashboard')}
				className="rounded-full text-foreground"
			>
				<HugeiconsIcon icon={Cancel01Icon} className="w-6 h-6" />
			</Button>
			<h1 className="text-xl font-black text-foreground tracking-tight uppercase">{title}</h1>
			<div className="w-10" />
		</header>
	);
});
