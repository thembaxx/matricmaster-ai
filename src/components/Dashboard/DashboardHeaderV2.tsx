'use client';

import { Calendar01Icon, Camera01Icon, Mortarboard01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import Link from 'next/link';
import { NotificationBell } from '@/components/Notifications/NotificationBell';
import { getLevelInfo } from '@/lib/level-utils';

interface DashboardHeaderProps {
	today: string;
	completedCount: number;
	totalCount: number;
	initialXp?: number;
}

export function DashboardHeader({
	today,
	completedCount,
	totalCount,
	initialXp = 0,
}: DashboardHeaderProps) {
	const levelInfo = getLevelInfo(initialXp);

	return (
		<m.header
			initial={{ opacity: 0, y: -20 }}
			animate={{ opacity: 1, y: 0 }}
			className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4"
		>
			<div>
				<div className="flex items-center gap-2 mb-2">
					<div className="p-1.5 bg-tiimo-lavender/10 rounded-lg">
						<HugeiconsIcon icon={Calendar01Icon} className="w-4 h-4 text-tiimo-lavender" />
					</div>
					<span className="text-[10px] font-black text-tiimo-lavender uppercase tracking-widest">
						Today's Schedule
					</span>
				</div>
				<h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tighter">
					{today.split(',')[0]}
				</h1>
				<p className="text-base font-bold text-tiimo-gray-muted mt-1">
					{completedCount} of {totalCount} goals crushed
				</p>
			</div>

			<div className="flex items-center gap-3">
				<NotificationBell />
				<Link href="/snap-and-solve">
					<m.div
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl shadow-lg shadow-primary/20 cursor-pointer"
					>
						<HugeiconsIcon icon={Camera01Icon} className="w-5 h-5" />
						<span className="text-[10px] font-black uppercase tracking-widest">Snap & Solve</span>
					</m.div>
				</Link>
				<m.div
					initial={{ scale: 0.9, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{ delay: 0.1 }}
					className="bg-tiimo-lavender/10 px-6 py-4 rounded-[2rem] border border-tiimo-lavender/20 flex items-center gap-4"
				>
					<div
						className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-tiimo"
						style={{ backgroundColor: levelInfo.color }}
					>
						<HugeiconsIcon icon={Mortarboard01Icon} className="w-7 h-7" />
					</div>
					<div>
						<p
							className="text-[10px] font-black uppercase tracking-widest"
							style={{ color: levelInfo.color }}
						>
							Level {levelInfo.level}
						</p>
						<p className="text-sm font-black text-foreground">{levelInfo.title}</p>
					</div>
				</m.div>
			</div>
		</m.header>
	);
}
