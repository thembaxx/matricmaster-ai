'use client';

import { create } from 'zustand';

export interface DragState {
	draggedBlockId: string | null;
	draggedOverBlockId: string | null;
	draggedOverDate: Date | null;
	isDragging: boolean;
}

interface DragActions {
	startDrag: (blockId: string) => void;
	setDragOver: (blockId: string | null, date: Date | null) => void;
	endDrag: () => void;
	resetDrag: () => void;
}

type DragStore = DragState & DragActions;

const initialState: DragState = {
	draggedBlockId: null,
	draggedOverBlockId: null,
	draggedOverDate: null,
	isDragging: false,
};

export const useDragStore = create<DragStore>((set) => ({
	...initialState,

	startDrag: (blockId) => set({ draggedBlockId: blockId, isDragging: true }),

	setDragOver: (blockId, date) => set({ draggedOverBlockId: blockId, draggedOverDate: date }),

	endDrag: () =>
		set({
			draggedBlockId: null,
			draggedOverBlockId: null,
			draggedOverDate: null,
			isDragging: false,
		}),

	resetDrag: () => set(initialState),
}));
