import { evaluateExpression } from './parser';

export interface Point {
	x: number;
	y: number;
}

export interface Viewport {
	xMin: number;
	xMax: number;
	yMin: number;
	yMax: number;
}

export function worldToScreen(
	point: Point,
	viewport: Viewport,
	canvasWidth: number,
	canvasHeight: number
): Point {
	const x = ((point.x - viewport.xMin) / (viewport.xMax - viewport.xMin)) * canvasWidth;
	const y =
		canvasHeight - ((point.y - viewport.yMin) / (viewport.yMax - viewport.yMin)) * canvasHeight;
	return { x, y };
}

export function screenToWorld(
	point: Point,
	viewport: Viewport,
	canvasWidth: number,
	canvasHeight: number
): Point {
	const x = (point.x / canvasWidth) * (viewport.xMax - viewport.xMin) + viewport.xMin;
	const y =
		((canvasHeight - point.y) / canvasHeight) * (viewport.yMax - viewport.yMin) + viewport.yMin;
	return { x, y };
}

export function generatePlotPoints(
	expression: string,
	params: Record<string, number>,
	viewport: Viewport,
	_numPoints = 500
): Point[] {
	const points: Point[] = [];
	const step = (viewport.xMax - viewport.xMin) / _numPoints;

	for (let x = viewport.xMin; x <= viewport.xMax; x += step) {
		const y = evaluateExpression(expression, x, params);
		if (!Number.isNaN(y) && Number.isFinite(y)) {
			points.push({ x, y });
		}
	}

	return points;
}

export function drawGrid(
	ctx: CanvasRenderingContext2D,
	viewport: Viewport,
	width: number,
	height: number
) {
	ctx.strokeStyle = '#e5e7eb';
	ctx.lineWidth = 0.5;

	const xStep = 10 ** Math.floor(Math.log10(viewport.xMax - viewport.xMin));
	const yStep = 10 ** Math.floor(Math.log10(viewport.yMax - viewport.yMin));

	for (let x = Math.ceil(viewport.xMin / xStep) * xStep; x <= viewport.xMax; x += xStep) {
		const screen = worldToScreen({ x, y: 0 }, viewport, width, height);
		ctx.beginPath();
		ctx.moveTo(screen.x, 0);
		ctx.lineTo(screen.x, height);
		ctx.stroke();
	}

	for (let y = Math.ceil(viewport.yMin / yStep) * yStep; y <= viewport.yMax; y += yStep) {
		const screen = worldToScreen({ x: 0, y }, viewport, width, height);
		ctx.beginPath();
		ctx.moveTo(0, screen.y);
		ctx.lineTo(width, screen.y);
		ctx.stroke();
	}

	// Axes
	ctx.strokeStyle = '#374151';
	ctx.lineWidth = 1;

	const origin = worldToScreen({ x: 0, y: 0 }, viewport, width, height);
	ctx.beginPath();
	ctx.moveTo(0, origin.y);
	ctx.lineTo(width, origin.y);
	ctx.stroke();

	ctx.beginPath();
	ctx.moveTo(origin.x, 0);
	ctx.lineTo(origin.x, height);
	ctx.stroke();
}
