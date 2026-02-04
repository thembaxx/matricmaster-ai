import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
// import type { Screen } from '@/types'; // Removed unused import
import { ChevronRight, Clock, RotateCcw, Star, Target, Trophy, Zap } from 'lucide-react';
import { useState } from 'react';

import { useRouter } from 'next/navigation';

export default function LessonComplete() {
	const router = useRouter();
	const [showConfetti] = useState(true);
	const xpCurrent = 1250;
	const xpNext = 2000;
	const xpProgress = (xpCurrent / xpNext) * 100;

	return (
		<div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950 font-lexend overflow-hidden">
			{/* Confetti Animation Background */}
			{showConfetti && (
				<div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
					{[...Array(30)].map((_, i) => (
						<div
							// biome-ignore lint/suspicious/noArrayIndexKey: stable list for animation
							key={`confetti-${i}`}
							className="absolute w-3 h-3 rounded-full opacity-60 animate-bounce"
							style={{
								backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'][i % 5],
								left: `${Math.random() * 100}%`,
								top: `${Math.random() * 100}%`,
								animationDelay: `${Math.random() * 3}s`,
								animationDuration: `${3 + Math.random() * 2}s`,
							}}
						/>
					))}
				</div>
			)}

			<main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 max-w-lg mx-auto w-full">
				{/* Trophy */}
				<div className="relative mb-8">
					<div className="w-32 h-32 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center animate-bounce">
						<Trophy className="w-16 h-16 text-yellow-500" />
					</div>
					<div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
						<Star className="w-6 h-6 text-white fill-white" />
					</div>
				</div>

				{/* Title */}
				<h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">Lesson Complete!</h1>
				<p className="text-zinc-500 mb-8">Great job, Thabo! You crushed it.</p>

				{/* Stats Grid */}
				<div className="grid grid-cols-3 gap-4 w-full max-w-sm mb-10">
					<div className="p-5 text-center bg-white dark:bg-zinc-900 rounded-[2rem] shadow-sm">
						<div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-3">
							<Target className="w-5 h-5 text-green-600" />
						</div>
						<p className="text-2xl font-black text-zinc-900 dark:text-white">90%</p>
						<p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Accuracy</p>
					</div>
					<div className="p-5 text-center bg-white dark:bg-zinc-900 rounded-[2rem] shadow-sm">
						<div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-3">
							<Clock className="w-5 h-5 text-blue-600" />
						</div>
						<p className="text-2xl font-black text-zinc-900 dark:text-white">12m</p>
						<p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Time</p>
					</div>
					<div className="p-5 text-center bg-white dark:bg-zinc-900 rounded-[2rem] shadow-sm border-2 border-yellow-400/20">
						<div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mx-auto mb-3">
							<Zap className="w-5 h-5 text-yellow-600" />
						</div>
						<p className="text-2xl font-black text-yellow-600">+150</p>
						<p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">XP</p>
					</div>
				</div>

				{/* New Badge */}
				<Card className="w-full max-w-sm p-6 mb-10 bg-gradient-to-br from-purple-500 to-indigo-600 border-none rounded-[2.5rem] shadow-xl shadow-purple-500/20 text-white">
					<div className="flex items-center gap-5">
						<div className="w-20 h-20 rounded-[1.5rem] bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
							<Star className="w-10 h-10 text-white fill-white" />
						</div>
						<div>
							<Badge className="bg-white/20 text-white border-none mb-2 rounded-full px-3">
								New Achievement!
							</Badge>
							<h3 className="font-black text-xl leading-tight">Physics Pioneer</h3>
							<p className="text-sm text-purple-100 font-medium">5 lessons completed</p>
						</div>
					</div>
				</Card>

				{/* XP Progress */}
				<div className="w-full max-w-sm mb-12">
					<div className="flex justify-between items-end mb-3 px-1">
						<div className="flex flex-col">
							<span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
								Current Rank
							</span>
							<span className="text-lg font-black text-zinc-900 dark:text-white">Level 12</span>
						</div>
						<span className="text-sm font-bold text-zinc-500">
							{xpCurrent.toLocaleString()} / {xpNext.toLocaleString()} XP
						</span>
					</div>
					<Progress value={xpProgress} className="h-4 rounded-full bg-zinc-200 dark:bg-zinc-800" />
				</div>

				{/* Actions */}
				<div className="w-full max-w-sm space-y-4">
					<Button
						className="w-full h-16 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-[2rem] text-lg font-bold shadow-xl shadow-zinc-900/10 active:scale-[0.98] transition-all"
						onClick={() => router.push('/dashboard')}
					>
						Continue Learning
						<ChevronRight className="w-5 h-5 ml-2" />
					</Button>
					<Button
						variant="ghost"
						className="w-full h-12 rounded-full font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
						onClick={() => router.push('/quiz')}
					>
						<RotateCcw className="w-4 h-4 mr-2" />
						Review My Mistakes
					</Button>
				</div>
			</main>
		</div>
	);
}
