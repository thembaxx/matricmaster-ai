'use client';

import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';

interface StudyBlockFormActionsProps {
	onCancel: () => void;
	isSubmitting: boolean;
	isEditing: boolean;
}

export function StudyBlockFormActions({
	onCancel,
	isSubmitting,
	isEditing,
}: StudyBlockFormActionsProps) {
	return (
		<DialogFooter className="gap-3 py-2 flex flex-col">
			<Button
				type="button"
				size="sm"
				variant="secondary"
				onClick={onCancel}
				className="h-11 shrink-0 rounded-xl border-border/50"
			>
				Cancel
			</Button>
			<Button
				type="submit"
				size="sm"
				disabled={isSubmitting}
				className="h-11 shrink-0 rounded-xl font-semibold"
			>
				{isSubmitting
					? isEditing
						? 'Updating...'
						: 'Adding...'
					: isEditing
						? 'Update Block'
						: 'Add Block'}
			</Button>
		</DialogFooter>
	);
}
