'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { drawGrid, generatePlotPoints, worldToScreen } from '@/lib/graphing/renderer';
import { useGraphingEngine } from '@/stores/useGraphingEngine';

export function GraphEngine() {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const { functions, viewport, params, showGrid, setTracePoint } = useGraphingEngine();
	const [dimensions, setDimensions] = useState({ width: 800, height: 500 });

	useEffect(() => {
		const updateDimensions = () => {
			if (containerRef.current) {
				const { width, height } = containerRef.current.getBoundingClientRect();
				setDimensions({ width: Math.floor(width), height: Math.floor(height) });
			}
		};

		updateDimensions();
		window.addEventListener('resize', updateDimensions);
		return () => window.removeEventListener('resize', updateDimensions);
	}, []);

	const draw = useCallback(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const { width, height } = dimensions;
		canvas.width = width;
		canvas.height = height;

		ctx.clearRect(0, 0, width, height);

		if (showGrid) {
			drawGrid(ctx, viewport, width, height);
		}

		functions.forEach((fn) => {
			if (!fn.visible) return;

			const points = generatePlotPoints(fn.expression, params, viewport, 500);
			ctx.strokeStyle = fn.color;
			ctx.lineWidth = 2;
			ctx.beginPath();

			let drawing = false;
			points.forEach((point) => {
				const screen = worldToScreen(point, viewport, width, height);
				if (!drawing) {
					ctx.moveTo(screen.x, screen.y);
					drawing = true;
				} else {
					ctx.lineTo(screen.x, screen.y);
				}
			});

			ctx.stroke();
		});
	}, [functions, viewport, params, showGrid, dimensions]);

	useEffect(() => {
		draw();
	}, [draw]);

	const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const rect = canvas.getBoundingClientRect();
		const x =
			((e.clientX - rect.left) / rect.width) * (viewport.xMax - viewport.xMin) + viewport.xMin;
		const y =
			((rect.height - (e.clientY - rect.top)) / rect.height) * (viewport.yMax - viewport.yMin) +
			viewport.yMin;

		setTracePoint({ x, y });
	};

	return (
		<div ref={containerRef} className="w-full h-full">
			<canvas
				ref={canvasRef}
				className="w-full h-full rounded-xl border border-border"
				onMouseMove={handleMouseMove}
			/>
		</div>
	);
}
