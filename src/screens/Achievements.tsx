import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Screen } from '@/types';
import { ArrowLeft, Atom, BookOpen, Check, Crown, Lock, Microscope, Moon, Zap } from 'lucide-react';
import { useState } from 'react';

interface AchievementsProps {
	onNavigate: (s: Screen) => void;
}

const badges = [
	{
		id: '1',
		name: 'Night Owl',
		icon: Moon,
		color: 'bg-indigo-500',
		unlocked: true,
		category: 'all',
	},
	{
		id: '2',
		name: 'Physics Master',
		icon: Atom,
		color: 'bg-purple-500',
		unlocked: true,
		category: 'science',
	},
	{
		id: '3',
		name: 'Fast Finisher',
		icon: Zap,
		color: 'bg-yellow-500',
		unlocked: true,
		category: 'all',
	},
	{
		id: '4',
		name: 'Book Worm',
		icon: BookOpen,
		color: 'bg-green-500',
		unlocked: true,
		category: 'all',
	},
	{
		id: '5',
		name: 'Calculus King',
		icon: Crown,
		color: 'bg-blue-500',
		unlocked: false,
		category: 'math',
	},
	{
		id: '6',
		name: 'Bio Whiz',
		icon: Microscope,
		color: 'bg-pink-500',
		unlocked: false,
		category: 'science',
	},
	{
		id: '7',
		name: 'Math Wizard',
		icon: Crown,
		color: 'bg-red-500',
		unlocked: false,
		category: 'math',
	},
	{
		id: '8',
		name: 'History Buff',
		icon: BookOpen,
		color: 'bg-amber-600',
		unlocked: false,
		category: 'history',
	},
];

export default function Achievements({ onNavigate }: AchievementsProps) {
	const [activeTab, setActiveTab] = useState('all');

	const filteredBadges =
		activeTab === 'all' ? badges : badges.filter((b) => b.category === activeTab);

	const unlockedCount = badges.filter((b) => b.unlocked).length;
	const progress = (unlockedCount / badges.length) * 100;

	return (
		<div className="flex flex-col min-h-screen bg-background">
			{/* Header */}
			<header className="px-6 pt-12 pb-4 bg-white dark:bg-zinc-900 sticky top-0 z-20 border-b border-zinc-100 dark:border-zinc-800">
				<div className="flex items-center gap-4 mb-4">
					<Button variant="ghost" size="icon" onClick={() => onNavigate('DASHBOARD')}>
						<ArrowLeft className="w-5 h-5" />
					</Button>
					<h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Achievements</h1>
				</div>

				{/* Mastery Level Card */}
				<Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-700 text-white border-0">
					<div className="flex justify-between items-end mb-2">
						<div>
							<p className="text-xs font-medium opacity-80 mb-1">Mastery Level</p>
							<h2 className="text-3xl font-bold">Level 4</h2>
						</div>
						<span className="text-2xl font-bold">24%</span>
					</div>
					<div className="flex justify-between items-center mb-2">
						<span className="text-sm">
							{unlockedCount} / {badges.length} Badges
						</span>
					</div>
					<Progress value={progress} className="h-2 bg-white/20" />
					<p className="text-xs mt-2 opacity-80">Keep it up! Next reward at 15 badges.</p>
				</Card>
			</header>

			<ScrollArea className="flex-1">
				<main className="px-6 py-6 pb-24">
					{/* Filter Tabs */}
					<Tabs defaultValue="all" className="w-full mb-6">
						<TabsList className="grid grid-cols-4 w-full">
							<TabsTrigger value="all" onClick={() => setActiveTab('all')}>
								All
							</TabsTrigger>
							<TabsTrigger value="science" onClick={() => setActiveTab('science')}>
								Science
							</TabsTrigger>
							<TabsTrigger value="math" onClick={() => setActiveTab('math')}>
								Math
							</TabsTrigger>
							<TabsTrigger value="history" onClick={() => setActiveTab('history')}>
								History
							</TabsTrigger>
						</TabsList>
					</Tabs>

					{/* Badges Grid */}
					<div className="grid grid-cols-3 gap-4">
						{filteredBadges.map((badge) => (
							<div
								key={badge.id}
								className={`flex flex-col items-center gap-3 p-4 rounded-2xl transition-opacity ${
									badge.unlocked ? 'opacity-100' : 'opacity-50'
								}`}
							>
								<div
									className={`relative w-20 h-20 rounded-full ${badge.color} flex items-center justify-center ${
										badge.unlocked
											? 'shadow-lg'
											: 'border-2 border-dashed border-zinc-400 bg-zinc-100'
									}`}
								>
									{badge.unlocked ? (
										<>
											<badge.icon className="w-10 h-10 text-white" />
											<div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
												<Check className="w-3 h-3 text-white" />
											</div>
										</>
									) : (
										<Lock className="w-8 h-8 text-zinc-400" />
									)}
								</div>
								<div className="text-center">
									<p className="text-xs font-semibold text-zinc-900 dark:text-white">
										{badge.name}
									</p>
									<p
										className={`text-[10px] mt-1 ${badge.unlocked ? 'text-blue-500' : 'text-zinc-400'}`}
									>
										{badge.unlocked ? 'Unlocked' : 'Locked'}
									</p>
								</div>
							</div>
						))}
					</div>
				</main>
			</ScrollArea>
		</div>
	);
}
