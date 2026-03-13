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
					<span className="text-[10px] font-medium text-tiimo-lavender">Today's schedule</span>
				</div>
				<h1 className="text-xl sm:text-2xl font-semibold text-foreground">{today.split(',')[0]}</h1>
				<p className="text-[13px] font-semibold text-tiimo-gray-muted mt-1">
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
						<span className="text-[10px] font-medium">Snap & solve</span>
					</m.div>
				</Link>
				<m.div
					initial={{ scale: 0.9, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{ delay: 0.1 }}
					className="bg-tiimo-lavender/10 pl-2.5 pr-6 py-1.5 rounded-[2rem] border border-tiimo-lavender/20 flex items-center gap-4"
				>
					<div
						className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-tiimo"
						style={{ backgroundColor: levelInfo.color }}
					>
						<HugeiconsIcon icon={Mortarboard01Icon} className="w-4 h-4" />
					</div>
					<div>
						<p className="text-[10px] font-medium" style={{ color: levelInfo.color }}>
							Level {levelInfo.level}
						</p>
						<p className="text-[10px] font-medium text-foreground">{levelInfo.title}</p>
					</div>
				</m.div>
			</div>
		</m.header>
	);
}
