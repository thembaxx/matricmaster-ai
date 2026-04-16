'use client';

import { Plus, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';

interface AIExplanationModalProps {
	isOpen: boolean;
	onClose: () => void;
	questionText: string;
	explanation: string;
	questionId: string;
	quizId?: string;
}

export function AIExplanationModal({
	isOpen,
	onClose,
	questionText,
	explanation,
	questionId,
	quizId,
}: AIExplanationModalProps) {
	const [isLoading, setIsLoading] = useState(false);

	const handleSaveFlashcard = async () => {
		setIsLoading(true);
		try {
			const response = await fetch('/api/learning-loop/generate-flashcards', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					questionId,
					quizId,
					explanation,
				}),
			});

			if (!response.ok) {
				throw new Error('Failed to generate flashcard');
			}

			toast.success('Flashcard added to queue');
			onClose();
		} catch {
			toast.error('Failed to generate flashcard');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="max-w-md font-sans">
				<DialogHeader>
					<DialogTitle className="text-base font-medium">Explanation</DialogTitle>
					<DialogDescription className="sr-only">
						View the AI explanation for this question
					</DialogDescription>
				</DialogHeader>

				<div className="flex flex-col gap-4">
					<div className="rounded-lg bg-muted p-4">
						<p className="text-sm text-muted-foreground">{questionText}</p>
					</div>

					<div className="rounded-lg border border-border p-4">
						<p className="text-sm leading-relaxed whitespace-pre-wrap">{explanation}</p>
					</div>
				</div>

				<DialogFooter className="mt-4">
					<Button variant="secondary" onClick={onClose} className="flex-1" disabled={isLoading}>
						<X className="mr-2 size-4" />
						Close
					</Button>
					<Button onClick={handleSaveFlashcard} className="flex-1" loading={isLoading}>
						<Plus className="mr-2 size-4" />
						Save as Flashcard
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
