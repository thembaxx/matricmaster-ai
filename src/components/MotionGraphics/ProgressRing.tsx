import { useMemo } from 'react';
import { interpolate, spring } from 'remotion';
import { TIIMO_COLORS } from './tokens';

interface ProgressRingProps {
	progress: number;
	size?: number;
	strokeWidth?: number;
	color?: string;
	backgroundColor?: string;
	fps?: number;
}

export function ProgressRing({
	progress,
	size = 80,
	strokeWidth = 8,
	color = TIIMO_COLORS.lavender,
	backgroundColor = TIIMO_COLORS.graySubtle,
	fps = 30,
}: ProgressRingProps) {
	const radius = size / 2 - strokeWidth / 2;
	const circumference = 2 * Math.PI * radius;

	const animatedProgress = useMemo(
		() => spring({ frame: 0, fps, from: 0, to: progress, config: { stiffness: 100, damping: 20 } }),
		[fps, progress]
	);

	const strokeDashoffset = interpolate(animatedProgress, [0, 100], [circumference, 0]);

	return (
		<svg
			width={size}
			height={size}
			style={{ transform: 'rotate(-90deg)' }}
			role="img"
			aria-label="Progress ring"
		>
			<title>Progress indicator</title>
			<circle
				cx={size / 2}
				cy={size / 2}
				r={radius}
				fill="none"
				stroke={backgroundColor}
				strokeWidth={strokeWidth}
			/>
			<circle
				cx={size / 2}
				cy={size / 2}
				r={radius}
				fill="none"
				stroke={color}
				strokeWidth={strokeWidth}
				strokeLinecap="round"
				strokeDasharray={circumference}
				strokeDashoffset={strokeDashoffset}
				style={{
					transition: 'stroke-dashoffset 0.3s ease',
				}}
			/>
		</svg>
	);
}
