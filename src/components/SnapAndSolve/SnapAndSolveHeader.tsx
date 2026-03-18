'use client';

import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Button } from '@/components/ui/button';

interface SnapAndSolveHeaderProps {
	onBack: () => void;
}

export function SnapAndSolveHeader({ onBack }: SnapAndSolveHeaderProps) {
	return (
		<header className="px-6 pt-12 pb-6 flex items-center justify-between shrink-0 max-w-2xl mx-auto w-full">
			<Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
				<HugeiconsIcon icon={ArrowLeft01Icon} className="w-6 h-6" />
			</Button>
			<h1 className="text-xl font-black uppercase tracking-tight">Snap & Solve</h1>
			<div className="w-10" />
		</header>
	);
}
