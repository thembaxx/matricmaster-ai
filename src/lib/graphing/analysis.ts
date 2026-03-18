import { evaluateExpression } from './parser';

export interface Intersection {
	x: number;
	y: number;
	functions: [string, string];
}

export function findIntersections(
	expr1: string,
	expr2: string,
	params: Record<string, number>,
	xMin = -10,
	xMax = 10
): Intersection[] {
	const intersections: Intersection[] = [];
	const step = 0.1;

	let prevDiff = evaluateExpression(expr1, xMin, params) - evaluateExpression(expr2, xMin, params);

	for (let x = xMin + step; x <= xMax; x += step) {
		const diff = evaluateExpression(expr1, x, params) - evaluateExpression(expr2, x, params);

		if (prevDiff * diff < 0) {
			// Sign change - root exists in this interval
			const root = newtonRaphson(expr1, expr2, x - step, params);
			if (root !== null) {
				const y = evaluateExpression(expr1, root, params);
				intersections.push({ x: root, y, functions: [expr1, expr2] });
			}
		}
		prevDiff = diff;
	}

	return intersections;
}

function newtonRaphson(
	expr1: string,
	expr2: string,
	x0: number,
	params: Record<string, number>,
	tolerance = 1e-6,
	maxIter = 100
): number | null {
	let x = x0;

	for (let i = 0; i < maxIter; i++) {
		const h = 0.0001;
		const f = evaluateExpression(expr1, x, params) - evaluateExpression(expr2, x, params);
		const fPrime =
			(evaluateExpression(expr1, x + h, params) - evaluateExpression(expr2, x + h, params) - f) / h;

		if (Math.abs(fPrime) < 1e-10) return null;

		const xNew = x - f / fPrime;
		if (Math.abs(xNew - x) < tolerance) return xNew;
		x = xNew;
	}

	return null;
}

export function findRoots(
	expression: string,
	params: Record<string, number>,
	xMin = -10,
	xMax = 10
): { x: number; y: number }[] {
	return findIntersections(expression, '0', params, xMin, xMax).map((i) => ({ x: i.x, y: 0 }));
}
