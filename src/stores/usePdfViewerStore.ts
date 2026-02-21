import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface Highlight {
	id: string;
	pageNumber: number;
	text: string;
	color: string;
	rects: { x: number; y: number; width: number; height: number }[];
	note?: string;
	createdAt: Date;
}

interface PdfViewerState {
	numPages: number;
	pageNumber: number;
	scale: number;
	rotation: number;
	isDarkMode: boolean;
	isFullscreen: boolean;
	showSearch: boolean;
	showNotes: boolean;
	highlights: Highlight[];
	selectedColor: string;
	containerWidth: number;

	setNumPages: (n: number) => void;
	goToPage: (n: number) => void;
	goToPrevPage: () => void;
	goToNextPage: () => void;
	zoomIn: () => void;
	zoomOut: () => void;
	setScale: (s: number) => void;
	rotate: () => void;
	toggleDarkMode: () => void;
	setDarkMode: (v: boolean) => void;
	toggleFullscreen: () => void;
	setFullscreen: (v: boolean) => void;
	toggleSearch: () => void;
	toggleNotes: () => void;
	addHighlight: (h: Highlight) => void;
	removeHighlight: (id: string) => void;
	setSelectedColor: (c: string) => void;
	setContainerWidth: (w: number) => void;
	reset: () => void;
}

const HIGHLIGHT_COLORS = ['#FEF08A', '#BBF7D0', '#BFDBFE', '#FBCFE8', '#FED7AA'];

const initialState = {
	numPages: 0,
	pageNumber: 1,
	scale: 1,
	rotation: 0,
	isDarkMode: false,
	isFullscreen: false,
	showSearch: false,
	showNotes: false,
	highlights: [] as Highlight[],
	selectedColor: HIGHLIGHT_COLORS[0],
	containerWidth: 0,
};

export const usePdfViewerStore = create<PdfViewerState>()(
	persist(
		(set) => ({
			...initialState,

			setNumPages: (n: number) => set({ numPages: n }),
			goToPage: (n: number) =>
				set((state) => ({ pageNumber: Math.min(Math.max(1, n), state.numPages || 1) })),
			goToPrevPage: () => set((state) => ({ pageNumber: Math.max(state.pageNumber - 1, 1) })),
			goToNextPage: () =>
				set((state) => ({ pageNumber: Math.min(state.pageNumber + 1, state.numPages || 1) })),

			zoomIn: () => set((state) => ({ scale: Math.min(state.scale + 0.25, 3) })),
			zoomOut: () => set((state) => ({ scale: Math.max(state.scale - 0.25, 0.5) })),
			setScale: (s: number) => set({ scale: Math.min(Math.max(0.5, s), 3) }),
			rotate: () => set((state) => ({ rotation: (state.rotation + 90) % 360 })),

			toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
			setDarkMode: (v: boolean) => set({ isDarkMode: v }),
			toggleFullscreen: () => set((state) => ({ isFullscreen: !state.isFullscreen })),
			setFullscreen: (v: boolean) => set({ isFullscreen: v }),

			toggleSearch: () => set((state) => ({ showSearch: !state.showSearch })),
			toggleNotes: () => set((state) => ({ showNotes: !state.showNotes })),

			addHighlight: (h: Highlight) => set((state) => ({ highlights: [...state.highlights, h] })),
			removeHighlight: (id: string) =>
				set((state) => ({ highlights: state.highlights.filter((h) => h.id !== id) })),

			setSelectedColor: (c: string) => set({ selectedColor: c }),
			setContainerWidth: (w: number) => set({ containerWidth: w }),

			reset: () => set(initialState),
		}),
		{
			name: 'pdf-viewer-store',
			storage: createJSONStorage(() => localStorage),
			partialize: (state) => ({
				isDarkMode: state.isDarkMode,
				highlights: state.highlights,
			}),
		}
	)
);
