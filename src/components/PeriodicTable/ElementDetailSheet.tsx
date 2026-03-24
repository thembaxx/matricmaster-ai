'use client';

import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from '@/components/ui/sheet';
import type { ElementDetailState } from '@/hooks/usePeriodicTableState';
import { ElementDetailContent } from './ElementDetail';

interface ElementDetailSheetProps {
	elementDetailState: ElementDetailState;
	onClose: () => void;
	handleCheckAnswer: () => void;
}

export function ElementDetailSheet({
	elementDetailState,
	onClose,
	handleCheckAnswer,
}: ElementDetailSheetProps) {
	if (!elementDetailState.selectedElement) return null;

	return (
		<Sheet open={!!elementDetailState.selectedElement} onOpenChange={(open) => !open && onClose()}>
			<SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
				<SheetHeader className="mb-6">
					<SheetTitle className="text-xl font-black tracking-tight">
						{elementDetailState.selectedElement.name}
					</SheetTitle>
					<SheetDescription className="text-sm">
						{elementDetailState.selectedElement.category}
					</SheetDescription>
				</SheetHeader>
				<ElementDetailContent
					element={elementDetailState.selectedElement}
					selectedAnswer={elementDetailState.selectedAnswer}
					setSelectedAnswer={(_a) => {}}
					showAnswer={elementDetailState.showAnswer}
					handleCheckAnswer={handleCheckAnswer}
				/>
			</SheetContent>
		</Sheet>
	);
}
