import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { Screen } from '@/types';
import { ChevronRight, Clock, RotateCcw, Star, Target, Trophy, Zap } from 'lucide-react';
import { useState } from 'react';

interface LessonCompleteProps {
	onNavigate: (s: Screen) => void;
}

export default function LessonComplete({ onNavigate }: LessonCompleteProps) {
	const [showConfetti] = useState(true);
	const xpCurrent = 1250;
	const xpNext = 2000;
	const xpProgress = (xpCurrent / xpNext) * 100;

	return (
		<div className="flex flex-col min-h-screen bg-background">
			{/* Confetti Animation Background */}
			{showConfetti && (
				<div className="fixed inset-0 pointer-events-none overflow-hidden">
					{Array.from({ length: 20 }).map((_, i) => (
						<div
							key={i}
							className="absolute w-3 h-3 rounded-full animate-bounce"
							style={{
								backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'][i % 5],
								left: `${Math.random() * 100}%`,
								top: `${Math.random() * 50}%`,
								animationDelay: `${Math.random() * 2}s`,
								animationDuration: `${2 + Math.random() * 2}s`,
							}}
						/>
					))}
				</div>
			)}

			<main className="flex-1 flex flex-col items-center justify-center p-6">
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
				<div className="grid grid-cols-3 gap-4 w-full max-w-sm mb-8">
					<Card className="p-4 text-center">
						<div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-2">
							<Target className="w-5 h-5 text-green-600" />
						</div>
						<p className="text-2xl font-bold text-zinc-900 dark:text-white">90%</p>
						<p className="text-xs text-zinc-500 uppercase tracking-wide">Accuracy</p>
					</Card>
					<Card className="p-4 text-center">
						<div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-2">
							<Clock className="w-5 h-5 text-blue-600" />
						</div>
						<p className="text-2xl font-bold text-zinc-900 dark:text-white">12m</p>
						<p className="text-xs text-zinc-500 uppercase tracking-wide">Time</p>
					</Card>
					<Card className="p-4 text-center">
						<div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mx-auto mb-2">
							<Zap className="w-5 h-5 text-yellow-600" />
						</div>
						<p className="text-2xl font-bold text-yellow-600">+150</p>
						<p className="text-xs text-zinc-500 uppercase tracking-wide">XP</p>
					</Card>
				</div>

				{/* New Badge */}
				<Card className="w-full max-w-sm p-4 mb-8 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800">
					<div className="flex items-center gap-4">
						<div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
							<Star className="w-8 h-8 text-white" />
						</div>
						<div>
							<Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 mb-1">
								New Badge Earned!
							</Badge>
							<h3 className="font-bold text-zinc-900 dark:text-white">Physics Pioneer</h3>
							<p className="text-sm text-zinc-500">Complete 5 Physics lessons</p>
						</div>
					</div>
				</Card>

				{/* XP Progress */}
				<div className="w-full max-w-sm mb-8">
					<div className="flex justify-between items-center mb-2">
						<span className="text-sm font-semibold">Level 12</span>
						<span className="text-sm text-zinc-500">
							{xpCurrent.toLocaleString()} / {xpNext.toLocaleString()} XP
						</span>
					</div>
					<Progress value={xpProgress} className="h-3" />
				</div>

				{/* Actions */}
				<div className="w-full max-w-sm space-y-3">
					<Button
						className="w-full h-14 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-900 text-lg"
						onClick={() => onNavigate('DASHBOARD')}
					>
						Keep Going
						<ChevronRight className="w-5 h-5 ml-2" />
					</Button>
					<Button variant="ghost" className="w-full" onClick={() => onNavigate('QUIZ')}>
						<RotateCcw className="w-4 h-4 mr-2" />
						Review Mistakes
					</Button>
				</div>
			</main>
		</div>
	);
}
