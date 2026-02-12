'use client';

import { CheckCircle2, ChevronRight, Clock, History, X, Zap } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function LessonComplete() {
	const router = useRouter();
	const [xpCurrent] = useState(1250);
	const [xpNext] = useState(2000);
	const xpProgress = (xpCurrent / xpNext) * 100;

	return (
		<div className="flex flex-col h-full bg-[#fcfdfa] dark:bg-[#0a0f18] font-inter">
			{/* Header */}
			<header className="px-6 py-6 flex items-center justify-between shrink-0">
				<Button
					variant="ghost"
					size="icon"
					onClick={() => router.push('/dashboard')}
					className="rounded-full text-zinc-900 dark:text-white"
				>
					<X className="w-6 h-6" />
				</Button>
				<h1 className="text-xl font-bold text-zinc-900 dark:text-white">Success</h1>
				<div className="w-10" /> {/* Spacer */}
			</header>

			<ScrollArea className="flex-1">
				<main className="px-6 py-4 flex flex-col items-center pb-32">
					{/* Trophy Section */}
					<div className="relative mb-8 w-48 h-48 flex items-center justify-center">
						<div className="absolute inset-0 bg-[#fde68a] dark:bg-yellow-900/20 rounded-3xl opacity-20" />
						<Image
							src="https://images.unsplash.com/photo-1579546671584-62dcfaf35ad0?w=400&h=400&fit=crop"
							alt="Trophy"
							width={160}
							height={160}
							className="object-contain rounded-2xl shadow-xl shadow-yellow-500/10"
						/>
						{/* Stylized Trophy Alternative since unsplash might vary */}
						{/* <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
							<div className="w-32 h-32 rounded-full bg-gradient-to-b from-yellow-300 to-yellow-500 flex items-center justify-center shadow-lg">
								<Trophy className="w-16 h-16 text-white" />
							</div>
						</div> */}
					</div>

					{/* Title Group */}
					<div className="text-center space-y-2 mb-8">
						<h2 className="text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
							Lesson Complete!
						</h2>
						<p className="text-zinc-500 dark:text-zinc-400 font-medium text-lg">
							Great job, Thabo! You crushed it.
						</p>
					</div>

					{/* Stats Cards Grid */}
					<div className="grid grid-cols-3 gap-3 w-full max-w-md mb-8">
						{/* Accuracy */}
						<div className="bg-white dark:bg-[#111827] p-4 rounded-2xl flex flex-col items-center shadow-sm border border-zinc-100 dark:border-zinc-800">
							<div className="w-10 h-10 rounded-full bg-yellow-50 dark:bg-yellow-900/20 flex items-center justify-center mb-3">
								<CheckCircle2 className="w-6 h-6 text-[#efb036]" />
							</div>
							<span className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">
								90%
							</span>
							<span className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 tracking-wider">
								Accuracy
							</span>
						</div>

						{/* Time */}
						<div className="bg-white dark:bg-[#111827] p-4 rounded-2xl flex flex-col items-center shadow-sm border border-zinc-100 dark:border-zinc-800">
							<div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-3">
								<Clock className="w-6 h-6 text-blue-500" />
							</div>
							<span className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">
								12m
							</span>
							<span className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 tracking-wider">
								Time
							</span>
						</div>

						{/* XP */}
						<div className="bg-white dark:bg-[#111827] p-4 rounded-2xl flex flex-col items-center shadow-sm border border-zinc-100 dark:border-zinc-800">
							<div className="w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center mb-3">
								<Zap className="w-6 h-6 text-orange-500" />
							</div>
							<span className="text-xl font-bold text-orange-500 tracking-tight">+150</span>
							<span className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 tracking-wider">
								XP Gained
							</span>
						</div>
					</div>

					{/* Rewards Section */}
					<div className="w-full max-w-md space-y-3 mb-8">
						<h3 className="text-lg font-bold text-zinc-900 dark:text-white text-left ml-1">
							Rewards Unlocked
						</h3>
						<div className="bg-white dark:bg-[#111827] p-5 rounded-2xl flex items-center gap-4 shadow-sm border border-zinc-100 dark:border-zinc-800">
							<div className="w-16 h-16 bg-[#0a0f18] rounded-xl overflow-hidden shrink-0">
								<Image
									src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=100&h=100&fit=crop"
									alt="Badge"
									width={64}
									height={64}
									className="w-full h-full object-cover opacity-80"
								/>
							</div>
							<div className="flex-1">
								<p className="text-[10px] font-extrabold text-[#efb036] uppercase tracking-widest mb-0.5">
									New Badge
								</p>
								<h4 className="text-xl font-bold text-zinc-900 dark:text-white">Physics Pioneer</h4>
								<p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
									Master of motion and forces
								</p>
							</div>
						</div>
					</div>

					{/* Progress Section */}
					<div className="w-full max-w-md space-y-3 mb-10 px-1">
						<div className="flex justify-between items-end">
							<span className="text-base font-bold text-zinc-900 dark:text-white">Level 12</span>
							<span className="text-xs font-bold text-zinc-400 dark:text-zinc-500">
								{xpCurrent.toLocaleString()} / {xpNext.toLocaleString()} XP
							</span>
						</div>
						<div className="h-2.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
							<div
								className="h-full bg-[#efb036] rounded-full transition-all duration-500"
								style={{ width: `${xpProgress}%` }}
							/>
						</div>
						<div className="flex justify-end">
							<span className="text-xs font-bold text-zinc-400 dark:text-zinc-500">
								Next: Level 13
							</span>
						</div>
					</div>

					{/* Action Buttons */}
					<div className="w-full max-w-md space-y-4">
						<Button
							className="w-full h-14 bg-[#efb036] hover:bg-[#d99d2b] text-zinc-900 rounded-2xl text-lg font-bold shadow-lg shadow-yellow-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
							onClick={() => router.push('/dashboard')}
						>
							Keep Going
							<ChevronRight className="w-5 h-5" />
						</Button>
						<Button
							variant="ghost"
							className="w-full h-12 rounded-full font-bold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center gap-2"
							onClick={() => router.push('/quiz')}
						>
							<History className="w-5 h-5" />
							Review Mistakes
						</Button>
					</div>
				</main>
			</ScrollArea>
		</div>
	);
}
