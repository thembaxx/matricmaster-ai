import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Screen } from '@/types';
import {
	BarChart3,
	Bell,
	BookOpen,
	ChevronRight,
	Flame,
	GraduationCap,
	Home,
	Target,
	Trophy,
	User,
	Zap,
} from 'lucide-react';
import { useState } from 'react';

interface DashboardProps {
	onNavigate: (s: Screen) => void;
}

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const today = 2; // Wednesday

export default function Dashboard({ onNavigate }: DashboardProps) {
	const [activeTab, setActiveTab] = useState('home');

	return (
		<div className="flex flex-col min-h-screen bg-background">
			{/* Header */}
			<header className="px-6 pt-12 pb-4 bg-white dark:bg-zinc-900 sticky top-0 z-20 border-b border-zinc-100 dark:border-zinc-800">
				<div className="flex justify-between items-center">
					<div>
						<h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
							Welcome back, Thabo!
						</h1>
						<p className="text-sm text-zinc-500">Ready to crush your goals today?</p>
					</div>
					<div className="relative">
						<Button variant="ghost" size="icon" className="rounded-full">
							<Bell className="w-5 h-5 text-zinc-600" />
						</Button>
						<span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
					</div>
				</div>
			</header>

			<ScrollArea className="flex-1">
				<main className="px-6 py-6 space-y-6 pb-24">
					{/* Streak Counter */}
					<Card className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-200 dark:border-orange-800">
						<div className="flex items-center gap-4">
							<div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center">
								<Flame className="w-6 h-6 text-white" />
							</div>
							<div>
								<div className="flex items-center gap-2">
									<span className="text-2xl font-bold text-zinc-900 dark:text-white">12</span>
									<span className="text-sm text-zinc-600 dark:text-zinc-400">day streak!</span>
								</div>
								<p className="text-xs text-orange-600 font-medium">You're on fire! Keep it up</p>
							</div>
						</div>
					</Card>

					{/* Weekly Calendar */}
					<div>
						<div className="flex justify-between items-center mb-3">
							<h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">This Week</h2>
							<Button variant="ghost" size="sm" className="text-xs text-zinc-500">
								View All
							</Button>
						</div>
						<div className="flex justify-between gap-2">
							{weekDays.map((day, idx) => (
								<div
									key={day}
									className={`flex-1 py-3 rounded-2xl flex flex-col items-center gap-1 ${
										idx === today
											? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
											: 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
									}`}
								>
									<span className="text-[10px] font-medium uppercase">{day}</span>
									<span className="text-lg font-bold">{12 + idx}</span>
									{idx <= today && (
										<div
											className={`w-1.5 h-1.5 rounded-full ${idx === today ? 'bg-green-400' : 'bg-green-500'}`}
										/>
									)}
								</div>
							))}
						</div>
					</div>

					{/* Daily Goal Card */}
					<Card className="p-6 bg-gradient-to-br from-zinc-900 to-zinc-800 dark:from-zinc-100 dark:to-white text-white dark:text-zinc-900">
						<div className="flex justify-between items-start mb-4">
							<div>
								<Badge
									variant="secondary"
									className="bg-white/20 text-white dark:bg-zinc-900/20 dark:text-zinc-900 mb-2"
								>
									Daily Goal
								</Badge>
								<h3 className="text-xl font-bold">Master Algebra</h3>
								<p className="text-sm text-zinc-300 dark:text-zinc-600">
									2/3 solved • 66% complete
								</p>
							</div>
							<div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
								<Target className="w-7 h-7" />
							</div>
						</div>
						<Progress value={66} className="h-2 bg-white/20 mb-4" />
						<Button
							className="w-full bg-white text-zinc-900 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800"
							onClick={() => onNavigate('QUIZ')}
						>
							Continue Quest
							<ChevronRight className="w-4 h-4 ml-2" />
						</Button>
					</Card>

					{/* Recommended Challenges */}
					<div>
						<h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">
							Recommended Challenges
						</h2>
						<div className="space-y-3">
							{[
								{
									title: 'Differentiation Rules',
									subject: 'Mathematics',
									difficulty: 'Medium',
									color: 'bg-blue-500',
								},
								{
									title: "Newton's Second Law",
									subject: 'Physics',
									difficulty: 'Hard',
									color: 'bg-purple-500',
								},
								{
									title: 'Poetry Analysis',
									subject: 'English',
									difficulty: 'Easy',
									color: 'bg-pink-500',
								},
							].map((challenge, idx) => (
								<Card key={idx} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
									<div className="flex items-center gap-4">
										<div
											className={`w-12 h-12 rounded-xl ${challenge.color} flex items-center justify-center`}
										>
											<BookOpen className="w-6 h-6 text-white" />
										</div>
										<div className="flex-1">
											<h4 className="font-semibold text-zinc-900 dark:text-white">
												{challenge.title}
											</h4>
											<p className="text-xs text-zinc-500">{challenge.subject}</p>
										</div>
										<Badge
											variant={
												challenge.difficulty === 'Hard'
													? 'destructive'
													: challenge.difficulty === 'Medium'
														? 'default'
														: 'secondary'
											}
											className="text-xs"
										>
											{challenge.difficulty}
										</Badge>
									</div>
								</Card>
							))}
						</div>
					</div>

					{/* Quick Stats */}
					<div className="grid grid-cols-2 gap-4">
						<Card className="p-4">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
									<Trophy className="w-5 h-5 text-yellow-600" />
								</div>
								<div>
									<p className="text-lg font-bold text-zinc-900 dark:text-white">1,250</p>
									<p className="text-xs text-zinc-500">Total XP</p>
								</div>
							</div>
						</Card>
						<Card className="p-4">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
									<Zap className="w-5 h-5 text-green-600" />
								</div>
								<div>
									<p className="text-lg font-bold text-zinc-900 dark:text-white">85%</p>
									<p className="text-xs text-zinc-500">Accuracy</p>
								</div>
							</div>
						</Card>
					</div>
				</main>
			</ScrollArea>

			{/* Bottom Navigation */}
			<nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 px-6 py-3">
				<div className="flex justify-around items-center">
					{[
						{ id: 'home', icon: Home, label: 'Home' },
						{ id: 'courses', icon: GraduationCap, label: 'Courses' },
						{ id: 'rank', icon: BarChart3, label: 'Rank' },
						{ id: 'profile', icon: User, label: 'Profile' },
					].map((item) => (
						<button
							type="button"
							key={item.id}
							onClick={() => {
								setActiveTab(item.id);
								if (item.id === 'profile') onNavigate('PROFILE');
								if (item.id === 'rank') onNavigate('LEADERBOARD');
							}}
							className={`flex flex-col items-center gap-1 ${
								activeTab === item.id ? 'text-zinc-900 dark:text-white' : 'text-zinc-400'
							}`}
						>
							<item.icon className="w-5 h-5" />
							<span className="text-[10px] font-medium">{item.label}</span>
						</button>
					))}
				</div>
			</nav>
		</div>
	);
}
