import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Screen } from '@/types';
import {
	ArrowRight,
	Bell,
	Flame,
	Play,
} from 'lucide-react';

interface DashboardProps {
	onNavigate: (s: Screen) => void;
}

const weekDays = [
	{ day: 'MON', date: 9, status: 'complete' },
	{ day: 'TUE', date: 10, status: 'complete' },
	{ day: 'WED', date: 11, status: 'complete' },
	{ day: 'THU', date: 12, status: 'active' }, // Today
	{ day: 'FRI', date: 13, status: 'upcoming' },
	{ day: 'SAT', date: 14, status: 'upcoming' },
	{ day: 'SUN', date: 15, status: 'upcoming' },
];

export default function Dashboard({ onNavigate }: DashboardProps) {
	return (
		<div className="flex flex-col min-h-screen bg-background">
			{/* Header */}
			<header className="px-6 pt-12 pb-4 bg-white dark:bg-zinc-900 sticky top-0 z-20">
				<div className="flex justify-between items-center mb-6">
					<div className="flex items-center gap-3">
						<Avatar className="w-12 h-12 border-2 border-green-500">
							<AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Thabo" />
							<AvatarFallback>TM</AvatarFallback>
						</Avatar>
						<div>
							<p className="text-xs text-zinc-500 font-medium">Welcome back,</p>
							<h1 className="text-xl font-bold text-zinc-900 dark:text-white">Thabo</h1>
						</div>
					</div>
					<Button
						variant="ghost"
						size="icon"
						className="rounded-full bg-white dark:bg-zinc-800 shadow-sm border border-zinc-100 dark:border-zinc-700 relative"
					>
						<Bell className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
						<span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-zinc-800" />
					</Button>
				</div>
			</header>

			<ScrollArea className="flex-1">
				<main className="px-6 pb-28 space-y-6">
					{/* Streak Card */}
					<Card className="p-4 flex items-center justify-between border-zinc-100 dark:border-zinc-800 shadow-sm">
						<div>
							<div className="flex items-baseline gap-1">
								<span className="text-4xl font-bold text-zinc-900 dark:text-white">12</span>
								<span className="text-zinc-400 font-medium">days</span>
							</div>
							<div className="flex items-center gap-1 text-orange-500 text-sm font-medium">
								You're on fire! <Flame className="w-4 h-4 fill-current" /> Keep it up!
							</div>
						</div>
						<div className="w-16 h-16 bg-orange-50 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
							<Flame className="w-8 h-8 text-orange-500 fill-orange-500/20" />
						</div>
					</Card>

					{/* Weekly Calendar */}
					<div className="space-y-4">
						<div className="flex justify-between items-center">
							<h2 className="font-bold text-zinc-900 dark:text-white">This Week</h2>
							<button type="button" className="text-xs text-orange-500 font-medium">
								View Calendar
							</button>
						</div>
						<div className="flex justify-between gap-2 overflow-x-auto no-scrollbar py-1">
							{weekDays.map((d) => (
								<div
									key={d.day}
									className={`flex flex-col items-center gap-2 min-w-[3rem] p-2 rounded-2xl border transition-all ${
										d.status === 'active'
											? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/30'
											: d.status === 'complete'
												? 'bg-orange-100 dark:bg-orange-900/20 border-transparent text-orange-700 dark:text-orange-300'
												: 'bg-white dark:bg-zinc-800 border-transparent text-zinc-400'
									}`}
								>
									<span className="text-[10px] font-bold tracking-wider">{d.day}</span>
									<span
										className={`text-sm font-bold w-6 h-6 flex items-center justify-center rounded-full ${
											d.status === 'active' ? 'bg-white/20' : ''
										}`}
									>
										{d.date}
									</span>
								</div>
							))}
						</div>
					</div>

					{/* Daily Goal */}
					<div className="space-y-4">
						<Badge className="bg-orange-100 text-orange-600 hover:bg-orange-100 border-none rounded-md px-2 py-1 text-[10px] tracking-wider font-bold uppercase">
							Daily Goal
						</Badge>
						<Card className="p-6 border-none shadow-xl bg-white dark:bg-zinc-900 relative overflow-hidden">
							<div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full -mr-10 -mt-10 blur-2xl" />
							
							<div className="flex justify-between items-start mb-6">
								<div>
									<h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
										Master Algebra
									</h3>
									<p className="text-zinc-500 text-sm">Complete 3 quiz questions</p>
								</div>
								<div className="w-16 h-16 bg-gradient-to-br from-yellow-100 to-orange-50 rounded-2xl flex items-center justify-center border border-orange-100">
									<div className="text-3xl">🏆</div> {/* Emoji placeholder for trophy image */}
								</div>
							</div>

							<div className="flex items-end justify-between mb-2">
								<span className="font-bold text-zinc-900 dark:text-white">2/3 Solved</span>
								<span className="font-bold text-orange-500">66%</span>
							</div>
							<Progress value={66} className="h-3 bg-zinc-100 dark:bg-zinc-800 mb-6" />

							<Button
								className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold h-12 rounded-xl text-md shadow-lg shadow-orange-500/20"
								onClick={() => onNavigate('QUIZ')}
							>
								Continue Quest
								<ArrowRight className="w-5 h-5 ml-2" />
							</Button>
						</Card>
					</div>

					{/* Recommended Challenges */}
					<div>
						<h2 className="font-bold text-zinc-900 dark:text-white mb-4">
							Recommended Challenges
						</h2>
						<div className="space-y-3">
							{[
								{
									title: 'Differentiation Rules',
									time: '10m',
									difficulty: 'Medium',
									color: 'bg-blue-100 text-blue-600',
									icon: 'Σ',
								},
								{
									title: "Newton's Second Law",
									time: '20m',
									difficulty: 'Hard',
									color: 'bg-purple-100 text-purple-600',
									icon: '⚡', // Using placeholder icon
								},
								{
									title: 'Poetry Analysis',
									time: '5m',
									difficulty: 'Easy',
									color: 'bg-green-100 text-green-600',
									icon: '📖',
								},
							].map((challenge) => (
								<Card
									key={challenge.title}
									className="p-4 py-5 flex items-center gap-4 border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-white dark:bg-zinc-900 rounded-2xl"
									onClick={() => onNavigate('QUIZ')}
								>
									<div className={`w-12 h-12 rounded-2xl ${challenge.color} flex items-center justify-center text-xl font-bold`}>
										{challenge.icon}
									</div>
									<div className="flex-1">
										<h4 className="font-bold text-zinc-900 dark:text-white mb-1">
											{challenge.title}
										</h4>
										<div className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
											<div className="flex items-center gap-1">
												<span className="w-3 h-3 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-[8px]">clock</span>
												{challenge.time}
											</div>
											<span>•</span>
											<span className={`${
												challenge.difficulty === 'Hard' ? 'text-red-500 bg-red-50' :
												challenge.difficulty === 'Medium' ? 'text-orange-500 bg-orange-50' :
												'text-green-500 bg-green-50'
											} px-2 py-0.5 rounded text-[10px]`}>
												{challenge.difficulty}
											</span>
										</div>
									</div>
									<div className="w-8 h-8 rounded-full bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center">
										<Play className="w-3 h-3 text-zinc-400 fill-zinc-400" />
									</div>
								</Card>
							))}
						</div>
					</div>
				</main>
			</ScrollArea>
		</div>
	);
}
