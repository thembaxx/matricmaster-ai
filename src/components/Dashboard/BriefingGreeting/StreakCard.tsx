'use client';

import { m } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

interface StreakCardProps {
	streakDays: number;
	isNewUser?: boolean;
	onClick?: () => void;
}

export function StreakCard({ streakDays, isNewUser = false, onClick }: StreakCardProps) {
	const displayStreakDays = Math.max(0, streakDays);

	if (isNewUser) {
		return (
			<m.div
				whileHover={{ y: -4 }}
				whileTap={{ scale: 0.98 }}
				onClick={onClick}
				className="tiimo-card p-6 flex flex-col justify-between relative group overflow-hidden cursor-pointer"
			>
				<div className="absolute -right-4 -top-4 w-24 h-24 bg-tiimo-green/10 rounded-full blur-2xl group-hover:bg-tiimo-green/20 transition-all" />

				<div className="flex items-center justify-between z-10">
					<div className="p-2 bg-tiimo-green/10 rounded-xl text-tiimo-green">
						<span className="text-lg">✨</span>
					</div>
					<span className="text-xs font-bold text-tiimo-green bg-tiimo-green/10 px-2 py-1 rounded-lg">
						welcome!
					</span>
				</div>
				<div className="z-10 mt-4">
					<p className="text-xs font-bold text-tiimo-gray-muted tracking-wide mb-1">
						welcome aboard!
					</p>
					<div className="flex items-baseline gap-2">
						<span className="text-3xl font-black">start</span>
						<span className="text-lg font-bold text-tiimo-gray-muted">journey</span>
					</div>
				</div>
				<p className="text-[10px] text-tiimo-gray-muted mt-4 z-10">
					complete your profile to get personalized recommendations
				</p>
			</m.div>
		);
	}

	return (
		<m.div
			whileHover={{ y: -4 }}
			whileTap={{ scale: 0.98 }}
			onClick={onClick}
			className="tiimo-card p-6 flex flex-col justify-between relative group overflow-hidden cursor-pointer"
		>
			<div className="absolute -right-4 -top-4 w-24 h-24 bg-tiimo-orange/10 rounded-full blur-2xl group-hover:bg-tiimo-orange/20 transition-all" />

			<div className="flex items-center justify-between z-10">
				<div className="p-2 bg-tiimo-orange/10 rounded-xl text-tiimo-orange">
					<TrendingUp className="w-5 h-5" />
				</div>
				<span className="text-xs font-bold text-tiimo-orange bg-tiimo-orange/10 px-2 py-1 rounded-lg">
					🔥 fire
				</span>
			</div>
			<div className="z-10 mt-4">
				<p className="text-xs font-bold text-tiimo-gray-muted tracking-wide mb-1">streak</p>
				<div className="flex items-baseline gap-2">
					<span className="text-3xl font-black tabular-nums font-mono">{displayStreakDays}</span>
					<span className="text-lg font-bold text-tiimo-gray-muted">days</span>
				</div>
			</div>
			<p className="text-[10px] text-tiimo-gray-muted mt-4 z-10">
				keep it up! you&apos;re on a roll.
			</p>
		</m.div>
	);
}
