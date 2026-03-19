'use client';

import { useMemo } from 'react';

interface MotionGraphProps {
	type: 'position' | 'velocity' | 'acceleration';
	data: { t: number; value: number }[];
	width?: number;
	height?: number;
	showGrid?: boolean;
}

export function MotionGraph({
	type,
	data,
	width = 400,
	height = 200,
	showGrid = true,
}: MotionGraphProps) {
	const { points, xMax: graphXMax } = useMemo(() => {
		if (data.length === 0) {
			return { points: '', xMin: 0, xMax: 10, yMin: -10, yMax: 10 };
		}
		const ts = data.map((d) => d.t);
		const vs = data.map((d) => d.value);
		const xMin = Math.min(...ts);
		const xMax = Math.max(...ts);
		const yMin = Math.min(...vs) - 1;
		const yMax = Math.max(...vs) + 1;
		const scaleX = width / (xMax - xMin || 1);
		const scaleY = height / (yMax - yMin || 1);
		const toSvgX = (t: number) => (t - xMin) * scaleX;
		const toSvgY = (v: number) => height - (v - yMin) * scaleY;
		const pts = data.map((d) => `${toSvgX(d.t)},${toSvgY(d.value)}`).join(' L ');
		return { points: pts, xMin, xMax, yMin, yMax };
	}, [data, width, height]);

	const axisColor = 'currentColor';
	const gridColor = 'currentColor';
	const lineColor = type === 'position' ? '#8B5CF6' : type === 'velocity' ? '#06B6D4' : '#F97316';

	return (
		<div className="bg-card rounded-xl p-4 border border-border">
			<div className="text-xs font-medium mb-2 capitalize text-muted-foreground">
				{type} vs Time
			</div>
			<svg
				width={width}
				height={height}
				className="bg-background rounded-lg"
				style={{ maxWidth: '100%', height: 'auto' }}
				role="img"
				aria-label={`${type} vs time graph`}
			>
				<title>{type} vs Time</title>
				{showGrid && (
					<defs>
						<pattern
							id="motion-grid"
							width={width / 10}
							height={height / 8}
							patternUnits="userSpaceOnUse"
						>
							<path
								d={`M ${width / 10} 0 L 0 0 0 ${height / 8}`}
								fill="none"
								stroke={gridColor}
								strokeOpacity="0.1"
							/>
						</pattern>
					</defs>
				)}
				{showGrid && <rect width={width} height={height} fill="url(#motion-grid)" />}

				<line
					x1={0}
					y1={height / 2}
					x2={width}
					y2={height / 2}
					stroke={axisColor}
					strokeWidth="1"
				/>
				<line
					x1={width * 0.1}
					y1={0}
					x2={width * 0.1}
					y2={height}
					stroke={axisColor}
					strokeWidth="1"
				/>

				{points && <path d={`M ${points}`} fill="none" stroke={lineColor} strokeWidth="2" />}

				<text x={width - 30} y={height - 5} fontSize="10" fill={axisColor}>
					t
				</text>
				<text x={5} y={15} fontSize="10" fill={axisColor}>
					{type.charAt(0).toUpperCase()}
				</text>
			</svg>
			<div className="flex justify-between text-xs font-mono mt-2 text-muted-foreground">
				<span>0s</span>
				<span>{graphXMax.toFixed(1)}s</span>
			</div>
		</div>
	);
}
