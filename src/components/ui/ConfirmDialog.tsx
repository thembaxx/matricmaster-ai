'use client';

import { Warning2Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';

interface ConfirmDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
	title: string;
	description: string;
	confirmLabel?: string;
	cancelLabel?: string;
	variant?: 'default' | 'destructive';
	isLoading?: boolean;
}

export function ConfirmDialog({
	open,
	onOpenChange,
	onConfirm,
	title,
	description,
	confirmLabel = 'Confirm',
	cancelLabel = 'Cancel',
	variant = 'default',
	isLoading = false,
}: ConfirmDialogProps) {
	const [isProcessing, setIsProcessing] = useState(false);

	const handleConfirm = async () => {
		setIsProcessing(true);
		try {
			await onConfirm();
			onOpenChange(false);
		} finally {
			setIsProcessing(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<div className="flex items-center gap-3">
						{variant === 'destructive' && (
							<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
								<HugeiconsIcon icon={Warning2Icon} className="h-5 w-5 text-destructive" />
							</div>
						)}
						<div>
							<DialogTitle className="text-left">{title}</DialogTitle>
							<DialogDescription className="text-left mt-1">{description}</DialogDescription>
						</div>
					</div>
				</DialogHeader>
				<DialogFooter className="flex-row justify-end gap-2 sm:gap-2">
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={isProcessing || isLoading}
						className="flex-1"
					>
						{cancelLabel}
					</Button>
					<Button
						variant={variant === 'destructive' ? 'destructive' : 'default'}
						onClick={handleConfirm}
						disabled={isProcessing || isLoading}
						className="flex-1"
					>
						{isProcessing || isLoading ? 'Processing...' : confirmLabel}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
