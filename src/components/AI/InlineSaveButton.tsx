'use client';

import { Square01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Button } from '@/components/ui/button';

interface InlineSaveButtonProps {
	onClick: () => void;
	className?: string;
}

export function InlineSaveButton({ onClick, className }: InlineSaveButtonProps) {
	return (
		<Button
			variant="ghost"
			size="icon"
			className={className}
			onClick={(e) => {
				e.stopPropagation();
				onClick();
			}}
			aria-label="Save as flashcard"
			title="Save as flashcard"
		>
			<HugeiconsIcon icon={Square01Icon} className="h-4 w-4" />
		</Button>
	);
}
