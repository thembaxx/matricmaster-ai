import { AbsoluteFill, interpolate, spring, useCurrentFrame } from 'remotion';
import { TIIMO_COLORS, TIIMO_RADIUS } from './tokens';

const FPS = 30;

function LogoReveal() {
	const frame = useCurrentFrame();
	const logoScale = spring({
		frame,
		fps: FPS,
		from: 0,
		to: 1,
		config: { stiffness: 120, damping: 14 },
	});
	const logoOpacity = interpolate(frame, [0, 15], [0, 1]);
	const glowOpacity = interpolate(frame, [15, 45], [0, 1], { extrapolateRight: 'clamp' });

	return (
		<div
			style={{
				flex: 1,
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				backgroundColor: TIIMO_COLORS.cream,
				padding: 40,
			}}
		>
			<div
				style={{
					width: 200 * logoScale,
					height: 200 * logoScale,
					borderRadius: TIIMO_RADIUS.xl,
					backgroundColor: TIIMO_COLORS.lavender,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					opacity: logoOpacity,
					boxShadow: `0 0 ${60 * glowOpacity}px ${TIIMO_COLORS.lavender}`,
				}}
			>
				<span
					style={{
						fontSize: 80 * logoScale,
						fontWeight: 700,
						color: TIIMO_COLORS.white,
						fontFamily: 'Georgia, serif',
					}}
				>
					M
				</span>
			</div>
			<h1
				style={{
					marginTop: 40,
					fontSize: 56,
					fontWeight: 700,
					color: TIIMO_COLORS.grayDark,
					fontFamily: 'Georgia, serif',
					opacity: logoOpacity,
				}}
			>
				MatricMaster AI
			</h1>
		</div>
	);
}

function QuizInteraction() {
	const frame = useCurrentFrame();
	const questionOpacity = interpolate(frame, [0, 15], [0, 1]);
	const optionScale = interpolate(frame, [15, 30], [0.9, 1], { extrapolateRight: 'clamp' });
	const progressFill = interpolate(frame, [30, 60], [0, 75], { extrapolateRight: 'clamp' });

	return (
		<div
			style={{
				flex: 1,
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				backgroundColor: TIIMO_COLORS.cream,
				padding: 40,
			}}
		>
			<div style={{ fontSize: 24, color: TIIMO_COLORS.grayMuted, marginBottom: 20 }}>
				Question 3 of 4
			</div>
			<div
				style={{
					width: '100%',
					height: 12,
					backgroundColor: TIIMO_COLORS.graySubtle,
					borderRadius: 6,
					overflow: 'hidden',
				}}
			>
				<div
					style={{
						width: `${progressFill}%`,
						height: '100%',
						backgroundColor: TIIMO_COLORS.lavender,
						borderRadius: 6,
					}}
				/>
			</div>
			<div
				style={{
					marginTop: 40,
					fontSize: 28,
					fontWeight: 600,
					color: TIIMO_COLORS.grayDark,
					opacity: questionOpacity,
				}}
			>
				What is the derivative of x²?
			</div>
			<div
				style={{
					display: 'grid',
					gridTemplateColumns: '1fr 1fr',
					gap: 16,
					marginTop: 30,
					width: '100%',
					maxWidth: 600,
				}}
			>
				{['A: x', 'B: 2x', 'C: x²', 'D: 2'].map((option, i) => {
					const isCorrect = i === 1;
					const showCorrect = frame > 30 && isCorrect;
					const bgColor = showCorrect ? `${TIIMO_COLORS.success}20` : TIIMO_COLORS.white;
					const borderColor = showCorrect ? TIIMO_COLORS.success : TIIMO_COLORS.graySubtle;
					return (
						<div
							key={option}
							style={{
								padding: 24,
								borderRadius: TIIMO_RADIUS.md,
								border: `2px solid ${borderColor}`,
								backgroundColor: bgColor,
								fontSize: 24,
								fontWeight: 500,
								color: TIIMO_COLORS.grayDark,
								transform: `scale(${optionScale})`,
								opacity: questionOpacity,
								boxShadow: showCorrect ? `0 0 20px ${TIIMO_COLORS.success}40` : 'none',
							}}
						>
							{option}{' '}
							{showCorrect && (
								<span style={{ marginLeft: 12, color: TIIMO_COLORS.success }}>✓</span>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}

function CardHoverDemo() {
	const frame = useCurrentFrame();
	const cardY = interpolate(frame, [0, 30], [20, 0], { extrapolateRight: 'clamp' });
	const cardOpacity = interpolate(frame, [0, 15], [0, 1]);
	const hoverScale = interpolate(frame, [30, 60], [1, 1.05], { extrapolateRight: 'clamp' });
	const glowOpacity = interpolate(frame, [45, 60], [0, 0.3], { extrapolateRight: 'clamp' });

	const subjects = [
		{ name: 'Mathematics', color: TIIMO_COLORS.math.DEFAULT, icon: '∑' },
		{ name: 'Physics', color: TIIMO_COLORS.physics.DEFAULT, icon: 'Ω' },
		{ name: 'Life Sciences', color: TIIMO_COLORS.lifeSciences.DEFAULT, icon: '♨' },
		{ name: 'Chemistry', color: TIIMO_COLORS.chemistry.DEFAULT, icon: '⚛' },
	];

	return (
		<div
			style={{
				flex: 1,
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				backgroundColor: TIIMO_COLORS.cream,
				padding: 40,
			}}
		>
			<h2
				style={{
					fontSize: 36,
					fontWeight: 700,
					color: TIIMO_COLORS.grayDark,
					fontFamily: 'Georgia, serif',
					marginBottom: 40,
					opacity: cardOpacity,
				}}
			>
				Your Subjects
			</h2>
			<div
				style={{
					display: 'grid',
					gridTemplateColumns: '1fr 1fr',
					gap: 20,
					width: '100%',
					maxWidth: 700,
				}}
			>
				{subjects.map((subject, i) => (
					<div
						key={subject.name}
						style={{
							padding: 30,
							borderRadius: TIIMO_RADIUS.lg,
							backgroundColor: TIIMO_COLORS.white,
							border: `1px solid ${TIIMO_COLORS.graySubtle}`,
							transform: `translateY(${cardY}px) scale(${hoverScale})`,
							opacity: cardOpacity,
							boxShadow: `0 8px 32px -4px rgba(70, 70, 68, 0.08), 0 0 20px ${subject.color}${Math.round(
								glowOpacity * 255
							)
								.toString(16)
								.padStart(2, '0')}`,
						}}
					>
						<div style={{ fontSize: 40, marginBottom: 12 }}>{subject.icon}</div>
						<div style={{ fontSize: 22, fontWeight: 600, color: TIIMO_COLORS.grayDark }}>
							{subject.name}
						</div>
						<div
							style={{
								marginTop: 16,
								height: 6,
								backgroundColor: TIIMO_COLORS.graySubtle,
								borderRadius: 3,
								overflow: 'hidden',
							}}
						>
							<div
								style={{
									width: `${70 + i * 5}%`,
									height: '100%',
									backgroundColor: subject.color,
									borderRadius: 3,
								}}
							/>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

function FocusModeDemo() {
	const frame = useCurrentFrame();
	const timerOpacity = interpolate(frame, [0, 15], [0, 1]);
	const pulse = interpolate(Math.sin(frame * 0.15), [-1, 1], [1, 1.03]);
	const progressCircle = interpolate(frame, [15, 75], [0, 100], { extrapolateRight: 'clamp' });

	return (
		<div
			style={{
				flex: 1,
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				backgroundColor: TIIMO_COLORS.cream,
				padding: 40,
			}}
		>
			<div
				style={{
					fontSize: 24,
					color: TIIMO_COLORS.grayMuted,
					marginBottom: 20,
					opacity: timerOpacity,
				}}
			>
				Focus Session
			</div>
			<div
				style={{
					position: 'relative',
					width: 280,
					height: 280,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				<svg
					width={280}
					height={280}
					style={{ transform: 'rotate(-90deg)', position: 'absolute' }}
					role="img"
					aria-label="Progress circle"
				>
					<title>Focus timer progress</title>
					<circle
						cx={140}
						cy={140}
						r={120}
						fill="none"
						stroke={TIIMO_COLORS.graySubtle}
						strokeWidth={12}
					/>
					<circle
						cx={140}
						cy={140}
						r={120}
						fill="none"
						stroke={TIIMO_COLORS.lavender}
						strokeWidth={12}
						strokeLinecap="round"
						strokeDasharray={2 * Math.PI * 120}
						strokeDashoffset={2 * Math.PI * 120 * (1 - progressCircle / 100)}
					/>
				</svg>
				<div
					style={{
						fontSize: 72,
						fontWeight: 700,
						fontFamily: 'monospace',
						color: TIIMO_COLORS.grayDark,
						transform: `scale(${pulse})`,
						opacity: timerOpacity,
					}}
				>
					25:00
				</div>
			</div>
			<div style={{ marginTop: 40, display: 'flex', gap: 16, opacity: timerOpacity }}>
				<div
					style={{
						padding: '16px 32px',
						borderRadius: TIIMO_RADIUS.md,
						backgroundColor: TIIMO_COLORS.lavender,
						color: TIIMO_COLORS.white,
						fontSize: 20,
						fontWeight: 600,
					}}
				>
					Pause
				</div>
				<div
					style={{
						padding: '16px 32px',
						borderRadius: TIIMO_RADIUS.md,
						border: `2px solid ${TIIMO_COLORS.graySubtle}`,
						color: TIIMO_COLORS.grayDark,
						fontSize: 20,
						fontWeight: 600,
					}}
				>
					End
				</div>
			</div>
		</div>
	);
}

function AchievementsDemo() {
	const frame = useCurrentFrame();
	const badgeScale = spring({
		frame: Math.max(0, frame - 15),
		fps: FPS,
		from: 0,
		to: 1,
		config: { stiffness: 180, damping: 12 },
	});
	const streakGlow = interpolate(frame, [30, 60], [0, 1], { extrapolateRight: 'clamp' });

	return (
		<div
			style={{
				flex: 1,
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				backgroundColor: TIIMO_COLORS.cream,
				padding: 40,
			}}
		>
			<div style={{ fontSize: 28, color: TIIMO_COLORS.grayMuted, marginBottom: 20 }}>
				Achievement Unlocked!
			</div>
			<div
				style={{
					width: 180 * badgeScale,
					height: 180 * badgeScale,
					borderRadius: '50%',
					backgroundColor: TIIMO_COLORS.yellow,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					boxShadow: `0 0 ${40 * streakGlow}px ${TIIMO_COLORS.yellow}`,
				}}
			>
				<span style={{ fontSize: 80 * badgeScale }}>🔥</span>
			</div>
			<h2
				style={{
					marginTop: 30,
					fontSize: 40,
					fontWeight: 700,
					color: TIIMO_COLORS.grayDark,
					fontFamily: 'Georgia, serif',
				}}
			>
				7 Day Streak!
			</h2>
			<p style={{ marginTop: 12, fontSize: 22, color: TIIMO_COLORS.grayMuted }}>
				Keep learning every day to maintain your streak
			</p>
			<div style={{ marginTop: 40, display: 'flex', gap: 8 }}>
				{[...Array(7)].map((_, i) => (
					<div
						key={i}
						style={{
							width: 32,
							height: 32,
							borderRadius: '50%',
							backgroundColor: i < 6 ? TIIMO_COLORS.green : TIIMO_COLORS.graySubtle,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							color: i < 6 ? TIIMO_COLORS.white : TIIMO_COLORS.grayMuted,
							fontSize: 16,
							fontWeight: 600,
						}}
					>
						✓
					</div>
				))}
			</div>
		</div>
	);
}

function Outro() {
	const frame = useCurrentFrame();
	const opacity = interpolate(frame, [0, 20], [0, 1]);
	const ctaScale = spring({
		frame: Math.max(0, frame - 20),
		fps: FPS,
		from: 0.8,
		to: 1,
		config: { stiffness: 150, damping: 15 },
	});

	return (
		<div
			style={{
				flex: 1,
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				backgroundColor: TIIMO_COLORS.lavender,
				padding: 40,
			}}
		>
			<h1
				style={{
					fontSize: 56,
					fontWeight: 700,
					color: TIIMO_COLORS.white,
					fontFamily: 'Georgia, serif',
					textAlign: 'center',
					opacity,
				}}
			>
				Start Your Journey
			</h1>
			<p
				style={{
					marginTop: 20,
					fontSize: 28,
					color: TIIMO_COLORS.white,
					opacity: opacity * 0.9,
					textAlign: 'center',
				}}
			>
				AI-powered learning for NSC Grade 12 success
			</p>
			<div
				style={{
					marginTop: 50,
					padding: '20px 50px',
					borderRadius: TIIMO_RADIUS.md,
					backgroundColor: TIIMO_COLORS.white,
					color: TIIMO_COLORS.lavender,
					fontSize: 24,
					fontWeight: 700,
					transform: `scale(${ctaScale})`,
					opacity,
				}}
			>
				Get Started
			</div>
		</div>
	);
}

export function DemoReel() {
	const frame = useCurrentFrame();
	const segmentDuration = 90;
	const segment =
		frame < segmentDuration
			? 0
			: frame < segmentDuration * 2
				? 1
				: frame < segmentDuration * 3
					? 2
					: frame < segmentDuration * 4
						? 3
						: frame < segmentDuration * 5
							? 4
							: 5;

	return (
		<AbsoluteFill style={{ backgroundColor: TIIMO_COLORS.cream }}>
			{segment === 0 && <LogoReveal />}
			{segment === 1 && <QuizInteraction />}
			{segment === 2 && <CardHoverDemo />}
			{segment === 3 && <FocusModeDemo />}
			{segment === 4 && <AchievementsDemo />}
			{segment === 5 && <Outro />}
		</AbsoluteFill>
	);
}
