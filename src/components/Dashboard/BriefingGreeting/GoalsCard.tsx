'use client';

import { Calendar01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';

interface GoalsCardProps {
	completedCount: number;
	totalCount: number;
	onClick?: () => void;
}

export function GoalsCard({ completedCount, totalCount, onClick }: GoalsCardProps) {
	const completionRate = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

	return (
		<m.div
			whileHover={{ y: -4 }}
			whileTap={{ scale: 0.98 }}
			onClick={onClick}
			className="tiimo-card p-6 flex flex-col justify-between h-40 relative group overflow-hidden cursor-pointer"
		>
			<div className="absolute -right-4 -top-4 w-24 h-24 bg-tiimo-lavender/10 rounded-full blur-2xl group-hover:bg-tiimo-lavender/20 transition-all" />

			<div className="flex items-center justify-between z-10">
				<div className="p-2 bg-tiimo-lavender/10 rounded-xl text-tiimo-lavender">
					<HugeiconsIcon icon={Calendar01Icon} className="w-5 h-5" />
				</div>
				<span className="text-xs font-bold text-tiimo-gray-muted bg-secondary px-2 py-1 rounded-lg">
					Today
				</span>
			</div>
			<div className="z-10 mt-4">
				<p className="text-xs font-bold text-tiimo-gray-muted tracking-wide mb-1">Goals</p>
				<div className="flex items-baseline gap-2">
					<span className="text-3xl font-black tabular-nums">{completedCount}</span>
					<span className="text-lg font-bold text-tiimo-gray-muted">/ {totalCount}</span>
				</div>
			</div>
			<div className="w-full h-1.5 bg-secondary rounded-full mt-4 overflow-hidden z-10">
				<m.div
					initial={{ width: 0 }}
					animate={{ width: `${completionRate}%` }}
					className="h-full bg-tiimo-lavender"
				/>
			</div>
		</m.div>
	);
}
