'use client';

import { Calendar01Icon, Clock01Icon, SparklesIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { NotificationBell } from '@/components/Notifications/NotificationBell';

interface BriefingGreetingProps {
	userName?: string | null;
	completedCount: number;
	totalCount: number;
	streakDays: number;
	suggestedSubject?: string | null;
}

export function BriefingGreeting({
	userName,
	completedCount,
	totalCount,
	streakDays,
	suggestedSubject,
}: BriefingGreetingProps) {
	const [greeting, setGreeting] = useState('Good day');

	useEffect(() => {
		const updateGreeting = () => {
			const hour = new Date().getHours();
			if (hour < 12) setGreeting('Good morning');
			else if (hour < 18) setGreeting('Good afternoon');
			else setGreeting('Good evening');
		};

		updateGreeting();
	}, []);

	const completionRate = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
	const firstName = userName?.split(' ')[0] || 'Scholar';

	return (
		<m.section
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			className="relative overflow-hidden pt-4 pb-8"
		>
			<div className="flex flex-col gap-6">
				{/* Top Row: Greeting & Time */}
				<div className="flex items-center justify-between">
					<div className="space-y-1">
						<div className="flex items-center gap-2 mb-1">
							<div className="w-2 h-2 rounded-full bg-tiimo-lavender animate-pulse" />
							<span className="label-sm text-tiimo-lavender">{greeting}</span>
						</div>
						<h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
							Hey, {firstName}
						</h1>
					</div>
					<div className="flex items-center gap-3">
						<NotificationBell />
					</div>
				</div>

				{/* Briefing Cards Row */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					{/* Goals Card */}
					<m.div
						whileHover={{ y: -4 }}
						className="tiimo-card p-6 flex flex-col justify-between h-40 relative group overflow-hidden"
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
							<p className="text-xs font-bold text-tiimo-gray-muted uppercase tracking-widest mb-1">
								Goals
							</p>
							<div className="flex items-baseline gap-2">
								<span className="text-3xl font-black">{completedCount}</span>
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

					{/* Streak Card */}
					<m.div
						whileHover={{ y: -4 }}
						className="tiimo-card p-6 flex flex-col justify-between relative group overflow-hidden"
					>
						<div className="absolute -right-4 -top-4 w-24 h-24 bg-tiimo-orange/10 rounded-full blur-2xl group-hover:bg-tiimo-orange/20 transition-all" />

						<div className="flex items-center justify-between z-10">
							<div className="p-2 bg-tiimo-orange/10 rounded-xl text-tiimo-orange">
								<TrendingUp className="w-5 h-5" />
							</div>
							<span className="text-xs font-bold text-tiimo-orange bg-tiimo-orange/10 px-2 py-1 rounded-lg">
								🔥 Fire
							</span>
						</div>
						<div className="z-10 mt-4">
							<p className="text-xs font-bold text-tiimo-gray-muted uppercase tracking-widest mb-1">
								Streak
							</p>
							<div className="flex items-baseline gap-2">
								<span className="text-3xl font-black">{streakDays}</span>
								<span className="text-lg font-bold text-tiimo-gray-muted">days</span>
							</div>
						</div>
						<p className="text-[10px] text-tiimo-gray-muted mt-4 z-10">
							Keep it up! You're on a roll.
						</p>
					</m.div>

					{/* Next Action Card */}
					<m.div
						whileHover={{ y: -4 }}
						className="p-6 flex flex-col justify-between relative group overflow-hidden bg-tiimo-lavender rounded-[var(--radius-lg)] shadow-tiimo text-white cursor-pointer transition-all hover:brightness-110"
					>
						<div className="absolute right-0 bottom-0 opacity-20 transform translate-x-1/4 translate-y-1/4">
							<HugeiconsIcon icon={SparklesIcon} className="w-32 h-32" />
						</div>

						<div className="flex items-center justify-between z-10 py-2">
							<div className="p-2 bg-white/20 rounded-xl">
								<HugeiconsIcon icon={Clock01Icon} className="w-5 h-5" />
							</div>
							<span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2 py-1 rounded-lg">
								Action
							</span>
						</div>
						<div className="z-10 pt-4">
							<p className="text-xs font-bold text-white/70 uppercase tracking-widest mb-1">
								Pick up where you left off
							</p>
							<h3 className="text-xl font-black leading-tight">
								{suggestedSubject || 'General Studies'}
							</h3>
						</div>
						<div className="flex items-center gap-2 mt-4 z-10">
							<span className="text-[10px] font-bold bg-white text-tiimo-lavender px-2 py-0.5 rounded-md">
								PROMPT
							</span>
							<span className="text-[10px] font-medium text-white/80 italic">Ready to finish?</span>
						</div>
					</m.div>
				</div>
			</div>
		</m.section>
	);
}
