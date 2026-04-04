import { useMemo } from 'react';
import { interpolate, spring } from 'remotion';
import { TIIMO_COLORS } from './tokens';

interface TimerPulseProps {
	seconds: number;
	isUrgent?: boolean;
	fps?: number;
}

export function TimerPulse({ seconds, isUrgent = false, fps = 30 }: TimerPulseProps) {
	const pulse = useMemo(
		() => spring({ frame: 0, fps, from: 1, to: 1.03, config: { stiffness: 200, damping: 10 } }),
		[fps]
	);

	const urgencyGlow = useMemo(() => interpolate(pulse, [1, 1.03], [0, 0.3]), [pulse]);

	const formatTime = (totalSeconds: number) => {
		const mins = Math.floor(totalSeconds / 60);
		const secs = totalSeconds % 60;
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	};

	const timerColor = isUrgent
		? interpolate(urgencyGlow, [0, 0.3], [0, 1]) > 0.15
			? TIIMO_COLORS.destructive
			: TIIMO_COLORS.orange
		: TIIMO_COLORS.lavender;

	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				padding: 24,
				backgroundColor: TIIMO_COLORS.cream,
				borderRadius: 24,
				border: `2px solid ${timerColor}40`,
				boxShadow: isUrgent ? `0 0 30px ${TIIMO_COLORS.destructive}30` : 'none',
			}}
		>
			<div
				style={{
					fontSize: 48,
					fontWeight: 700,
					fontFamily: 'monospace',
					color: timerColor,
					transform: `scale(${pulse})`,
				}}
			>
				{formatTime(seconds)}
			</div>
			{isUrgent && (
				<div
					style={{
						marginTop: 8,
						fontSize: 12,
						fontWeight: 600,
						color: TIIMO_COLORS.destructive,
					}}
				>
					Time Running Out!
				</div>
			)}
		</div>
	);
}
