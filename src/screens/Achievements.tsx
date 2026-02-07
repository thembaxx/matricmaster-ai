'use client';

import { Lock, Trophy } from 'lucide-react';
import { useState } from 'react';

import { ScrollArea } from '@/components/ui/scroll-area';

const badges = [
	{
		id: '1',
		name: 'Night Owl',
		imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=200&h=200&fit=crop',
		iconBg: '#1a1a2e',
		unlocked: true,
		category: 'all',
	},
	{
		id: '2',
		name: 'Physics Master',
		icon: '⚛️',
		iconBg: '#f0f4f8',
		unlocked: true,
		category: 'science',
	},
	{
		id: '3',
		name: 'Fast Finisher',
		icon: '⚡',
		iconBg: '#e6f7f0',
		unlocked: true,
		category: 'all',
	},
	{
		id: '4',
		name: 'Book Worm',
		icon: '📖',
		iconBg: '#fce4ec',
		unlocked: true,
		category: 'all',
	},
	{
		id: '5',
		name: 'Calculus King',
		icon: '👑',
		iconBg: '#f0f4f8',
		unlocked: false,
		category: 'math',
	},
	{
		id: '6',
		name: 'Bio Whiz',
		icon: '🔬',
		iconBg: '#f0f4f8',
		unlocked: false,
		category: 'science',
	},
	{
		id: '7',
		name: 'History Buff',
		icon: '📜',
		iconBg: '#f0f4f8',
		unlocked: false,
		category: 'history',
	},
	{
		id: '8',
		name: 'Chem Wiz',
		icon: '🧪',
		iconBg: '#f0f4f8',
		unlocked: false,
		category: 'science',
	},
	{
		id: '9',
		name: 'Code Ninja',
		icon: '💻',
		iconBg: '#f0f4f8',
		unlocked: false,
		category: 'all',
	},
];

const categories = [
	{ id: 'all', label: 'All Badges' },
	{ id: 'science', label: 'Science' },
	{ id: 'math', label: 'Math' },
	{ id: 'history', label: 'History' },
];

export default function Achievements() {
	const [activeTab, setActiveTab] = useState('all');

	const filteredBadges =
		activeTab === 'all' ? badges : badges.filter((b) => b.category === activeTab);

	const unlockedCount = badges.filter((b) => b.unlocked).length;
	const totalBadges = 50;
	const progress = (unlockedCount / totalBadges) * 100;

	return (
		<div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-[#0a0f18]">
			<ScrollArea className="flex-1">
				<main className="px-4 pb-32">
					{/* Mastery Level Card */}
					<div className="px-4">
						<div
							className="rounded-3xl p-6 mb-6 relative overflow-hidden"
							style={{
								background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)',
							}}
						>
							{/* Trophy Icon */}
							<div className="absolute top-4 right-4">
								<div
									className="w-14 h-14 rounded-full flex items-center justify-center"
									style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
								>
									<Trophy className="w-7 h-7 text-white" />
								</div>
							</div>

							<div className="space-y-4">
								<div>
									<p
										className="text-xs font-semibold uppercase tracking-wider mb-1"
										style={{ color: 'rgba(255, 255, 255, 0.7)' }}
									>
										Mastery Level
									</p>
									<h2 className="text-4xl font-bold text-white">Level 4</h2>
								</div>

								<div className="flex items-center justify-between">
									<p className="text-white text-lg">
										<span className="font-bold">{unlockedCount}</span>
										<span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
											{' '}
											/ {totalBadges} Badges
										</span>
									</p>
									<span className="text-white font-bold text-lg">{Math.round(progress)}%</span>
								</div>

								{/* Progress Bar */}
								<div
									className="w-full h-2 rounded-full overflow-hidden"
									style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }}
								>
									<div
										className="h-full rounded-full transition-all duration-500"
										style={{
											width: `${progress}%`,
											backgroundColor: '#ffffff',
										}}
									/>
								</div>

								<p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
									Keep it up! Next reward at 15 badges.
								</p>
							</div>
						</div>
					</div>

					{/* Filter Tabs */}
					<div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-2">
						{categories.map((category) => (
							<button
								key={category.id}
								type="button"
								onClick={() => setActiveTab(category.id)}
								className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
									activeTab === category.id
										? 'bg-blue-500 text-white'
										: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
								}`}
							>
								{category.label}
							</button>
						))}
					</div>

					{/* Badges Grid */}
					<div className="grid grid-cols-3 gap-4">
						{filteredBadges.map((badge) => (
							<div
								key={badge.id}
								className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-white dark:bg-zinc-900"
							>
								{/* Badge Icon */}
								<div
									className={`w-20 h-20 rounded-full flex items-center justify-center relative ${
										badge.unlocked ? '' : 'opacity-50'
									}`}
									style={{
										backgroundColor: badge.unlocked ? badge.iconBg : 'rgb(243, 244, 246)',
										border: badge.unlocked ? 'none' : '2px dashed rgb(209, 213, 219)',
									}}
								>
									{badge.unlocked ? (
										badge.imageUrl ? (
											<img
												src={badge.imageUrl}
												alt={badge.name}
												className="w-full h-full rounded-full object-cover"
											/>
										) : (
											<span className="text-3xl">{badge.icon}</span>
										)
									) : (
										<Lock className="w-6 h-6 text-zinc-400 dark:text-zinc-500" />
									)}
								</div>

								{/* Badge Info */}
								<div className="text-center">
									<p
										className={`text-sm font-medium ${
											badge.unlocked
												? 'text-zinc-900 dark:text-white'
												: 'text-zinc-400 dark:text-zinc-500'
										}`}
									>
										{badge.name}
									</p>
									<p
										className={`text-xs font-medium uppercase tracking-wide ${
											badge.unlocked
												? 'text-blue-500 dark:text-blue-400'
												: 'text-zinc-400 dark:text-zinc-500'
										}`}
									>
										{badge.unlocked ? 'UNLOCKED' : 'LOCKED'}
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
