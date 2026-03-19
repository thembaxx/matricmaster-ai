import { derivative, evaluate } from 'mathjs';
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

interface GraphConfig {
	type: 'linear' | 'quadratic' | 'trigonometric' | 'exponential';
	equation: string;
	domain: [number, number];
	showGrid: boolean;
	showDerivative: boolean;
	showIntegral: boolean;
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

	plotFunction: (config: GraphConfig) => SVGElement | null;
	calculateDerivative: (equation: string) => string;
	calculateIntegral: (equation: string, bounds: [number, number]) => number;
	evaluateAt: (equation: string, x: number) => number;
	getPoints: (
		equation: string,
		domain: [number, number],
		steps?: number
	) => { x: number; y: number }[];
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

	plotFunction: (_config) => {
		return null;
	},

	calculateDerivative: (equation) => {
		try {
			const deriv = derivative(equation, 'x');
			return deriv.toString();
		} catch {
			return 'Unable to calculate derivative';
		}
	},

	calculateIntegral: (equation, bounds) => {
		try {
			const steps = 1000;
			const stepSize = (bounds[1] - bounds[0]) / steps;
			let sum = 0;
			for (let i = 0; i < steps; i++) {
				const x = bounds[0] + i * stepSize;
				const y = evaluate(equation, { x });
				if (typeof y === 'number' && Number.isFinite(y)) {
					sum += y * stepSize;
				}
			}
			return sum;
		} catch {
			return 0;
		}
	},

	evaluateAt: (equation, x) => {
		try {
			const result = evaluate(equation, { x });
			return typeof result === 'number' ? result : Number.NaN;
		} catch {
			return Number.NaN;
		}
	},

	getPoints: (equation, domain, steps = 200) => {
		const points: { x: number; y: number }[] = [];
		const step = (domain[1] - domain[0]) / steps;
		for (let x = domain[0]; x <= domain[1]; x += step) {
			const y = evaluate(equation, { x });
			if (typeof y === 'number' && !Number.isNaN(y) && Number.isFinite(y)) {
				points.push({ x, y });
			}
		}
		return points;
	},
}));
