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
		color: 'bg-brand-purple',
		unlocked: true,
		category: 'all',
	},
	{
		id: '2',
		name: 'Physics Master',
		icon: Atom,
		color: 'bg-brand-blue',
		unlocked: true,
		category: 'science',
	},
	{
		id: '3',
		name: 'Fast Finisher',
		icon: Zap,
		color: 'bg-brand-amber',
		unlocked: true,
		category: 'all',
	},
	{
		id: '4',
		name: 'Book Worm',
		icon: BookOpen,
		color: 'bg-brand-green',
		unlocked: true,
		category: 'all',
	},
	{
		id: '5',
		name: 'Calculus King',
		icon: Crown,
		color: 'bg-brand-blue',
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
		color: 'bg-brand-red',
		unlocked: false,
		category: 'math',
	},
	{
		id: '8',
		name: 'History Buff',
		icon: BookOpen,
		color: 'bg-brand-orange',
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
		<div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950 font-lexend">
			{/* Header */}
			<header className="px-6 pt-12 pb-6 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl sticky top-0 z-20 border-b border-zinc-100 dark:border-zinc-800">
				<div className="max-w-2xl mx-auto w-full space-y-6">
					<div className="flex items-center gap-4">
						<Button
							variant="ghost"
							size="icon"
							onClick={() => onNavigate('PROFILE')}
							className="rounded-full"
						>
							<ArrowLeft className="w-5 h-5" />
						</Button>
						<h1 className="text-2xl font-black text-zinc-900 dark:text-white">Achievements</h1>
					</div>

					{/* Mastery Level Card */}
					<Card className="p-8 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-none rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
						<div className="absolute top-0 right-0 w-32 h-32 bg-white/10 dark:bg-zinc-900/5 rounded-full -mr-8 -mt-8 blur-3xl group-hover:scale-110 transition-transform" />

						<div className="flex justify-between items-end mb-6 relative z-10">
							<div>
								<p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1">
									Mastery Rank
								</p>
								<h2 className="text-4xl font-black italic">Level 4</h2>
							</div>
							<div className="text-right">
								<span className="text-3xl font-black text-brand-blue italic">24%</span>
							</div>
						</div>

						<div className="space-y-3 relative z-10">
							<div className="flex justify-between items-center px-1">
								<span className="text-xs font-bold text-zinc-400">
									{unlockedCount} / {badges.length} Badges Earned
								</span>
							</div>
							<Progress
								value={progress}
								className="h-3 bg-white/10 dark:bg-zinc-100 rounded-full"
							/>
						</div>
					</Card>
				</div>
			</header>

			<ScrollArea className="flex-1">
				<main className="px-6 py-8 pb-32 max-w-2xl mx-auto w-full">
					{/* Filter Tabs */}
					<div className="bg-zinc-100 dark:bg-zinc-900 p-1.5 rounded-2xl mb-8">
						<Tabs defaultValue="all" className="w-full">
							<TabsList className="grid grid-cols-4 w-full bg-transparent border-none">
								{['all', 'science', 'math', 'history'].map((tab) => (
									<TabsTrigger
										key={tab}
										value={tab}
										onClick={() => setActiveTab(tab)}
										className="rounded-xl font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm transition-all"
									>
										{tab}
									</TabsTrigger>
								))}
							</TabsList>
						</Tabs>
					</div>

					{/* Badges Grid */}
					<div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
						{filteredBadges.map((badge) => (
							<div
								key={badge.id}
								className={`flex flex-col items-center gap-4 p-6 rounded-[2.5rem] bg-white dark:bg-zinc-900 shadow-sm transition-all hover:shadow-md ${
									badge.unlocked ? 'opacity-100 scale-100' : 'opacity-40 grayscale'
								}`}
							>
								<div
									className={`relative w-24 h-24 rounded-[2rem] ${badge.color} flex items-center justify-center shadow-inner`}
								>
									<div className="absolute inset-0 bg-white/10 rounded-[2rem]" />
									{badge.unlocked ? (
										<>
											<badge.icon className="w-12 h-12 text-white relative z-10" />
											<div className="absolute -top-2 -right-2 w-8 h-8 bg-brand-green rounded-full flex items-center justify-center border-4 border-white dark:border-zinc-900 shadow-lg animate-in zoom-in">
												<Check className="w-4 h-4 text-white" strokeWidth={4} />
											</div>
										</>
									) : (
										<Lock className="w-10 h-10 text-white/50 relative z-10" />
									)}
								</div>
								<div className="text-center space-y-1">
									<p className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight">
										{badge.name}
									</p>
									<p
										className={`text-[10px] font-black uppercase tracking-widest ${badge.unlocked ? 'text-brand-blue' : 'text-zinc-400'}`}
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
