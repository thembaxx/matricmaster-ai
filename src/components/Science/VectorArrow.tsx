'use client';

interface VectorArrowProps {
	startX: number;
	startY: number;
	endX: number;
	endY: number;
	color?: string;
	strokeWidth?: number;
	label?: string;
	showHead?: boolean;
}

export function VectorArrow({
	startX,
	startY,
	endX,
	endY,
	color = '#EF4444',
	strokeWidth = 2,
	label,
	showHead = true,
}: VectorArrowProps) {
	const dx = endX - startX;
	const dy = endY - startY;
	const length = Math.sqrt(dx * dx + dy * dy);
	const angle = Math.atan2(dy, dx);

	const headSize = Math.max(8, strokeWidth * 3);
	const headAngle = Math.PI / 6;

	const head1X = endX - headSize * Math.cos(angle - headAngle);
	const head1Y = endY - headSize * Math.sin(angle - headAngle);
	const head2X = endX - headSize * Math.cos(angle + headAngle);
	const head2Y = endY - headSize * Math.sin(angle + headAngle);

	return (
		<g>
			<line
				x1={startX}
				y1={startY}
				x2={endX}
				y2={endY}
				stroke={color}
				strokeWidth={strokeWidth}
				strokeLinecap="round"
			/>
			{showHead && length > 5 && (
				<polygon points={`${endX},${endY} ${head1X},${head1Y} ${head2X},${head2Y}`} fill={color} />
			)}
			{label && (
				<text
					x={(startX + endX) / 2}
					y={(startY + endY) / 2 - 8}
					textAnchor="middle"
					fill={color}
					fontSize="12"
					fontWeight="bold"
				>
					{label}
				</text>
			)}
		</g>
	);
}
