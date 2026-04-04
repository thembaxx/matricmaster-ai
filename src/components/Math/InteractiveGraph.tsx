'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useGraphingEngine } from '@/stores/useGraphingEngine';

interface InteractiveGraphProps {
	width?: number;
	height?: number;
	initialEquation?: string;
}

export function InteractiveGraph({
	width = 600,
	height = 400,
	initialEquation = 'x^2',
}: InteractiveGraphProps) {
	const [equation, setEquation] = useState(() => initialEquation);
	const [hoverPoint, setHoverPoint] = useState<{ x: number; y: number } | null>(null);
	const [zoom, setZoom] = useState(1);
	const svgRef = useRef<SVGSVGElement>(null);
	const cachedRect = useRef<DOMRect | null>(null);

	useEffect(() => {
		const handleResize = () => {
			if (svgRef.current) {
				cachedRect.current = svgRef.current.getBoundingClientRect();
			}
		};
		handleResize();
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	const { viewport, getPoints, calculateDerivative } = useGraphingEngine();

	const points = useMemo(() => {
		try {
			return getPoints(equation, [viewport.xMin, viewport.xMax]);
		} catch (error) {
			console.warn('Failed to get points for graph:', error);
			return [];
		}
	}, [equation, viewport, getPoints]);

	const derivativeEq = useMemo(
		() => calculateDerivative(equation),
		[equation, calculateDerivative]
	);

	const viewWidth = (viewport.xMax - viewport.xMin) / zoom;
	const viewHeight = (viewport.yMax - viewport.yMin) / zoom;
	const centerX = (viewport.xMin + viewport.xMax) / 2;
	const centerY = (viewport.yMin + viewport.yMax) / 2;

	const toSvgX = (x: number) => ((x - (centerX - viewWidth / 2)) / viewWidth) * width;
	const toSvgY = (y: number) => height - ((y - (centerY - viewHeight / 2)) / viewHeight) * height;

	const handleMouseMove = useCallback(
		(e: React.MouseEvent<SVGSVGElement>) => {
			const rect = cachedRect.current ?? e.currentTarget.getBoundingClientRect();
			const svgX = e.clientX - rect.left;
			const svgY = e.clientY - rect.top;

			const graphX = (svgX / width) * viewWidth + (centerX - viewWidth / 2);
			const graphY = ((height - svgY) / height) * viewHeight + (centerY - viewHeight / 2);

			setHoverPoint({ x: graphX, y: graphY });
		},
		[width, height, viewWidth, viewHeight, centerX, centerY]
	);

	const handleMouseLeave = () => setHoverPoint(null);

	return (
		<div className="flex flex-col gap-4 p-4 bg-card rounded-2xl border border-border">
			<div className="flex items-center gap-4">
				<input
					type="text"
					value={equation}
					onChange={(e) => setEquation(e.target.value)}
					placeholder="Enter equation (e.g., x^2)"
					className="flex-1 px-4 py-2 rounded-xl bg-background border border-border focus:border-primary focus:outline-none font-mono"
				/>
				<div className="flex gap-2">
					<Button
						type="button"
						variant="outline"
						size="icon"
						onClick={() => setZoom((z) => z * 1.5)}
					>
						+
					</Button>
					<Button
						type="button"
						variant="outline"
						size="icon"
						onClick={() => setZoom((z) => Math.max(0.5, z / 1.5))}
					>
						-
					</Button>
				</div>
			</div>

			<div className="relative">
				<svg
					ref={svgRef}
					width={width}
					height={height}
					onMouseMove={handleMouseMove}
					onMouseLeave={handleMouseLeave}
					className="bg-background rounded-xl cursor-crosshair"
					style={{ maxWidth: '100%', height: 'auto' }}
					role="img"
					aria-label={`Graph of ${equation}`}
				>
					<title>Graph of {equation}</title>
					<defs>
						<pattern
							id="grid"
							width={viewWidth / 10}
							height={viewHeight / 10}
							patternUnits="userSpaceOnUse"
						>
							<path
								d={`M ${viewWidth / 10} 0 L 0 0 0 ${viewHeight / 10}`}
								fill="none"
								stroke="currentColor"
								strokeOpacity="0.1"
							/>
						</pattern>
					</defs>

					<rect width={width} height={height} fill="url(#grid)" />

					<line
						x1={toSvgX(0)}
						y1={0}
						x2={toSvgX(0)}
						y2={height}
						stroke="currentColor"
						strokeWidth="1"
					/>
					<line
						x1={0}
						y1={toSvgY(0)}
						x2={width}
						y2={toSvgY(0)}
						stroke="currentColor"
						strokeWidth="1"
					/>

					{points.length > 1 && (
						<path
							d={`M ${points.map((p) => `${toSvgX(p.x)},${toSvgY(p.y)}`).join(' L ')}`}
							fill="none"
							stroke="#8B5CF6"
							strokeWidth="2"
						/>
					)}

					{hoverPoint && (
						<>
							<circle cx={toSvgX(hoverPoint.x)} cy={toSvgY(hoverPoint.y)} r="4" fill="#8B5CF6" />
							<line
								x1={toSvgX(hoverPoint.x)}
								y1={toSvgY(hoverPoint.y)}
								x2={toSvgX(hoverPoint.x)}
								y2={height}
								stroke="#8B5CF6"
								strokeDasharray="4"
								strokeOpacity="0.5"
							/>
							<line
								x1={0}
								y1={toSvgY(hoverPoint.y)}
								x2={toSvgX(hoverPoint.x)}
								y2={toSvgY(hoverPoint.y)}
								stroke="#8B5CF6"
								strokeDasharray="4"
								strokeOpacity="0.5"
							/>
						</>
					)}
				</svg>

				{hoverPoint && (
					<div className="absolute top-2 right-2 bg-card/90 backdrop-blur px-3 py-1 rounded-lg text-xs font-mono border border-border">
						x: {hoverPoint.x.toFixed(2)}, y: {hoverPoint.y.toFixed(2)}
					</div>
				)}
			</div>

			<div className="flex gap-4 text-sm text-muted-foreground">
				<div>
					<span className="font-medium">f(x)</span> = {equation}
				</div>
				<div>
					<span className="font-medium">f'(x)</span> = {derivativeEq}
				</div>
			</div>
		</div>
	);
}
