import { useEffect, useMemo, useState } from 'react';
import { AbsoluteFill, interpolate, spring } from 'remotion';
import { TIIMO_COLORS } from './tokens';

interface QuizOptionFeedbackProps {
	isCorrect: boolean;
	isSelected: boolean;
	isChecked: boolean;
}

const FPS = 30;

export function QuizOptionFeedback({ isCorrect, isSelected, isChecked }: QuizOptionFeedbackProps) {
	const [animateKey, setAnimateKey] = useState(0);

	const scale = useMemo(
		() =>
			spring({
				frame: animateKey,
				fps: FPS,
				from: 0,
				to: 1,
				config: { stiffness: 300, damping: 20 },
			}),
		[animateKey]
	);

	const shakeX = useMemo(
		() =>
			isCorrect
				? 0
				: spring({
						frame: animateKey,
						fps: FPS,
						from: 0,
						to: 1,
						config: { stiffness: 300, damping: 10, mass: 1, overshootClamping: false },
					}),
		[animateKey, isCorrect]
	);

	const glowOpacity = useMemo(
		() =>
			isCorrect
				? spring({
						frame: animateKey,
						fps: FPS,
						from: 0,
						to: 1,
						config: { stiffness: 300, damping: 20 },
					})
				: 0,
		[animateKey, isCorrect]
	);

	useEffect(() => {
		if (isChecked && isSelected && !animateKey) {
			setAnimateKey(1);
		}
		if (!isChecked) {
			setAnimateKey(0);
		}
	}, [isChecked, isSelected, animateKey]);

	if (!isChecked || !isSelected) {
		return null;
	}

	const shakeOffset = interpolate(shakeX, [0, 1], [0, animateKey ? 6 : 0]) * (isCorrect ? 0 : 1);

	const backgroundColor = isCorrect ? `${TIIMO_COLORS.success}20` : `${TIIMO_COLORS.destructive}20`;
	const borderColor = isCorrect ? TIIMO_COLORS.success : TIIMO_COLORS.destructive;
	const checkmarkColor = isCorrect ? TIIMO_COLORS.success : TIIMO_COLORS.destructive;

	return (
		<AbsoluteFill
			style={{
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				transform: `translateX(${shakeOffset}px) scale(${scale})`,
				opacity: scale,
			}}
		>
			<div
				style={{
					position: 'absolute',
					inset: 0,
					borderRadius: 16,
					border: `2px solid ${borderColor}`,
					backgroundColor,
					boxShadow: isCorrect ? `0 0 20px ${TIIMO_COLORS.success}40` : 'none',
				}}
			/>

			{isCorrect && glowOpacity > 0 && (
				<div
					style={{
						position: 'absolute',
						inset: -4,
						borderRadius: 20,
						background: `radial-gradient(circle, ${TIIMO_COLORS.success}30 0%, transparent 70%)`,
						opacity: glowOpacity,
					}}
				/>
			)}

			<div
				style={{
					width: 32,
					height: 32,
					borderRadius: '50%',
					backgroundColor: checkmarkColor,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					color: '#fff',
					fontSize: 18,
					fontWeight: 700,
				}}
			>
				{isCorrect ? '✓' : '✗'}
			</div>

			{isCorrect &&
				[...Array(6)].map((_, i) => (
					<div
						key={i}
						style={{
							position: 'absolute',
							width: 6,
							height: 6,
							borderRadius: '50%',
							backgroundColor: TIIMO_COLORS.lavender,
							transform: `translate(${Math.cos((i * Math.PI) / 3) * 40}px, ${Math.sin((i * Math.PI) / 3) * 40}px)`,
							opacity: interpolate(glowOpacity, [0, 1], [0, 0.8]),
						}}
					/>
				))}
		</AbsoluteFill>
	);
}
