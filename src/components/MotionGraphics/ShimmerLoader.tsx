import { useMemo } from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { TIIMO_COLORS } from './tokens';

interface ShimmerLoaderProps {
	width: number;
	height: number;
}

export function ShimmerLoader({ width, height }: ShimmerLoaderProps) {
	const frame = useCurrentFrame();

	const shimmerPosition = useMemo(() => interpolate(frame, [0, 60], [-200, 200]) % 300, [frame]);

	return (
		<div
			style={{
				width,
				height,
				borderRadius: 10,
				overflow: 'hidden',
				backgroundColor: TIIMO_COLORS.graySubtle,
				position: 'relative',
			}}
		>
			<div
				style={{
					position: 'absolute',
					inset: 0,
					background: `linear-gradient(90deg, 
            transparent 0%, 
            ${TIIMO_COLORS.white}40 50%, 
            transparent 100%)`,
					transform: `translateX(${shimmerPosition}px)`,
					width: '60%',
				}}
			/>
		</div>
	);
}
