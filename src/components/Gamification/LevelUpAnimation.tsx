'use client';

import { StarIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { AnimatePresence, m, useAnimation } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

interface LevelUpAnimationProps {
	isVisible: boolean;
	level: number;
	topicName: string;
	onComplete?: () => void;
}

export function LevelUpAnimation({
	isVisible,
	level,
	topicName,
	onComplete,
}: LevelUpAnimationProps) {
	const controls = useAnimation();
	const hasAnimated = useRef(false);
	const prevVisible = useRef(isVisible);

	if (isVisible && !prevVisible.current && !hasAnimated.current) {
		hasAnimated.current = true;
		controls.start({
			scale: [0, 1.2, 1],
			rotate: [0, 360],
			opacity: [0, 1, 1, 1, 0],
		});
		setTimeout(() => {
			onComplete?.();
			hasAnimated.current = false;
		}, 3000);
	}

	prevVisible.current = isVisible;

	if (!isVisible) return null;

	return (
		<AnimatePresence>
			{isVisible && (
				<m.div
					initial={{ scale: 0.95, opacity: 0 }}
					animate={controls}
					exit={{ scale: 0.95, opacity: 0 }}
					className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
				>
					<div className="text-center">
						<m.div
							animate={{
								boxShadow: ['0 0 0 0 rgba(147, 51, 234, 0.7)', '0 0 0 20px rgba(147, 51, 234, 0)'],
							}}
							transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
							className="w-32 h-32 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-4"
						>
							<m.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.5, repeat: 2 }}>
								<HugeiconsIcon icon={StarIcon} className="w-16 h-16 text-white" />
							</m.div>
						</m.div>
						<m.h2
							initial={{ y: 20, opacity: 0 }}
							animate={{ y: 0, opacity: 1 }}
							transition={{ delay: 0.3 }}
							className="text-4xl font-black text-violet-600"
						>
							LEVEL UP!
						</m.h2>
						<m.p
							initial={{ y: 20, opacity: 0 }}
							animate={{ y: 0, opacity: 1 }}
							transition={{ delay: 0.5 }}
							className="text-lg font-bold text-foreground mt-2"
						>
							{topicName}
						</m.p>
						<m.p
							initial={{ y: 20, opacity: 0 }}
							animate={{ y: 0, opacity: 1 }}
							transition={{ delay: 0.7 }}
							className="text-6xl font-black text-purple-600 mt-4"
						>
							{level}
						</m.p>
						<m.div
							initial={{ scale: 0.95, opacity: 0 }}
							animate={{ scale: [0.95, 1.5, 1], opacity: [0, 1, 1] }}
							transition={{ delay: 0.9, type: 'spring' }}
							className="flex justify-center gap-1 mt-2"
						>
							{Array.from({ length: 5 }).map((_, i) => (
								<m.div
									key={`star-${i}`}
									animate={{
										rotate: [0, -15, 15, 0],
										y: [0, -5, 0],
									}}
									transition={{
										delay: 1 + i * 0.1,
										duration: 0.5,
										repeat: 2,
									}}
								>
									<HugeiconsIcon icon={StarIcon} className="w-6 h-6 text-yellow-500" />
								</m.div>
							))}
						</m.div>
					</div>
				</m.div>
			)}
		</AnimatePresence>
	);
}

interface TopicMasteryBadgeProps {
	progress: number;
	previousProgress: number;
	threshold?: number;
	showAnimation?: boolean;
}

export function TopicMasteryBadge({
	progress,
	previousProgress,
	threshold = 80,
	showAnimation = true,
}: TopicMasteryBadgeProps) {
	const [showLevelUp, setShowLevelUp] = useState(false);
	const [level] = useState(Math.floor(progress / 20) + 1);
	const [prevLevel] = useState(Math.floor(previousProgress / 20) + 1);

	useEffect(() => {
		const crossedThreshold = previousProgress < threshold && progress >= threshold;
		const leveledUp = level > prevLevel;

		if (showAnimation && (crossedThreshold || leveledUp)) {
			setShowLevelUp(true);
		}
	}, [progress, previousProgress, threshold, level, prevLevel, showAnimation]);

	const getStatusColor = () => {
		if (progress >= threshold) return 'bg-tiimo-green';
		if (progress >= threshold / 2) return 'bg-tiimo-lavender';
		if (progress > 0) return 'bg-tiimo-yellow';
		return 'bg-muted';
	};

	const getStatusLabel = () => {
		if (progress >= threshold) return 'Exam Ready';
		if (progress >= threshold / 2) return 'In Progress';
		if (progress > 0) return 'Needs Work';
		return 'Not Started';
	};

	return (
		<>
			<div
				className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${getStatusColor()} text-white text-xs font-bold`}
			>
				{progress >= threshold && <HugeiconsIcon icon={StarIcon} className="w-3 h-3" />}
				<span>{getStatusLabel()}</span>
				<span className="opacity-75">({Math.round(progress)}%)</span>
			</div>

			<LevelUpAnimation
				isVisible={showLevelUp}
				level={level}
				topicName={`Mastery: ${progress}%`}
				onComplete={() => setShowLevelUp(false)}
			/>
		</>
	);
}
