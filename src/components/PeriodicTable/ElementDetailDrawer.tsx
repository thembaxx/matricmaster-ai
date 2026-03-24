'use client';

import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
} from '@/components/ui/drawer';
import type { ElementDetailState } from '@/hooks/usePeriodicTableState';
import { ElementDetailContent } from './ElementDetail';

interface ElementDetailDrawerProps {
	elementDetailState: ElementDetailState;
	onClose: () => void;
	handleCheckAnswer: () => void;
}

export function ElementDetailDrawer({
	elementDetailState,
	onClose,
	handleCheckAnswer,
}: ElementDetailDrawerProps) {
	if (!elementDetailState.selectedElement) return null;

	return (
		<Drawer open={!!elementDetailState.selectedElement} onClose={onClose}>
			<DrawerContent className="max-h-[85vh]">
				<DrawerHeader className="text-left">
					<DrawerTitle className="text-xl font-black tracking-tight">
						{elementDetailState.selectedElement.name}
					</DrawerTitle>
					<DrawerDescription className="text-sm">
						{elementDetailState.selectedElement.category}
					</DrawerDescription>
				</DrawerHeader>
				<div className="px-4 pb-6 overflow-y-auto max-h-[calc(85vh-120px)]">
					<ElementDetailContent
						element={elementDetailState.selectedElement}
						selectedAnswer={elementDetailState.selectedAnswer}
						setSelectedAnswer={(_a) => {}}
						showAnswer={elementDetailState.showAnswer}
						handleCheckAnswer={handleCheckAnswer}
					/>
				</div>
			</DrawerContent>
		</Drawer>
	);
}
