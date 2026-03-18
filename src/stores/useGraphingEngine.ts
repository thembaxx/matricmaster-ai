import { create } from 'zustand';

interface GraphFunction {
	id: string;
	expression: string;
	color: string;
	visible: boolean;
}

interface Viewport {
	xMin: number;
	xMax: number;
	yMin: number;
	yMax: number;
}

interface GraphState {
	functions: GraphFunction[];
	viewport: Viewport;
	params: Record<string, number>;
	showGrid: boolean;
	showTrace: boolean;
	tracePoint: { x: number; y: number } | null;

	addFunction: (expression: string) => void;
	removeFunction: (id: string) => void;
	toggleVisibility: (id: string) => void;
	setParam: (key: string, value: number) => void;
	setViewport: (viewport: Partial<Viewport>) => void;
	toggleGrid: () => void;
	setTracePoint: (point: { x: number; y: number } | null) => void;
	clear: () => void;
}

const COLORS = ['#8B5CF6', '#F97316', '#06B6D4', '#10B981', '#EF4444'];

export const useGraphingEngine = create<GraphState>((set, get) => ({
	functions: [],
	viewport: { xMin: -10, xMax: 10, yMin: -10, yMax: 10 },
	params: { a: 1, b: 0, c: 0, m: 1, k: 1 },
	showGrid: true,
	showTrace: false,
	tracePoint: null,

	addFunction: (expression) => {
		const { functions } = get();
		const id = `fn-${Date.now()}`;
		const color = COLORS[functions.length % COLORS.length];
		set({ functions: [...functions, { id, expression, color, visible: true }] });
	},

	removeFunction: (id) => {
		set((state) => ({ functions: state.functions.filter((f) => f.id !== id) }));
	},

	toggleVisibility: (id) => {
		set((state) => ({
			functions: state.functions.map((f) => (f.id === id ? { ...f, visible: !f.visible } : f)),
		}));
	},

	setParam: (key, value) => {
		set((state) => ({ params: { ...state.params, [key]: value } }));
	},

	setViewport: (viewport) => {
		set((state) => ({ viewport: { ...state.viewport, ...viewport } }));
	},

	toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
	setTracePoint: (point) => set({ tracePoint: point }),
	clear: () => set({ functions: [], params: { a: 1, b: 0, c: 0, m: 1, k: 1 } }),
}));
