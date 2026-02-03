import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Screen } from '@/types';
import { Activity, Bookmark, Calculator, Microscope, TrendingUp, Zap } from 'lucide-react';
import { useState } from 'react';

interface BookmarksProps {
	onNavigate: (s: Screen) => void;
}

const bookmarks = [
	{
		id: 1,
		subject: 'MATH P1',
		title: 'Solve for x',
		info: 'Nov 2023 • Q2.1',
		content: 'x² - 5x + 6 = 0',
		type: 'equation',
		icon: Calculator,
		color: 'text-blue-500',
		bg: 'bg-blue-100',
	},
	{
		id: 2,
		subject: 'PHYSICS P1',
		title: 'Internal Resistance',
		info: 'May 2022 • Q8',
		content: 'Circuit Diagram Area',
		type: 'image',
		icon: Zap,
		color: 'text-purple-500',
		bg: 'bg-purple-100',
	},
	{
		id: 3,
		subject: 'MATH P1',
		title: 'Determine Maxima',
		info: 'Feb 2023 • Q9',
		content: 'Curve Graph Area', // Placeholder for graph
		type: 'graph',
		icon: TrendingUp, // Graph icon
		color: 'text-blue-500',
		bg: 'bg-blue-100',
	},
	{
		id: 4,
		subject: 'LIFE SCI P2',
		title: 'DNA Replication',
		info: 'Nov 2021 • Q3',
		content: '||| || |||', // Placeholder for DNA
		type: 'dna',
		icon: Microscope,
		color: 'text-green-500',
		bg: 'bg-green-100',
	},
];

export default function Bookmarks({ onNavigate }: BookmarksProps) {
	const [activeTab, setActiveTab] = useState('all');

	const filteredBookmarks =
		activeTab === 'all'
			? bookmarks
			: bookmarks.filter((b) => b.subject.toLowerCase().includes(activeTab.toLowerCase()));

	return (
		<div className="flex flex-col min-h-screen bg-background">
			{/* Header */}
			<header className="px-6 pt-12 pb-2 bg-white dark:bg-zinc-900 sticky top-0 z-20">
				<h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-1">Bookmarks</h1>
				<p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
					Your saved revision questions
				</p>

				<Tabs defaultValue="all" className="w-full">
					<TabsList className="w-full justify-start gap-2 bg-transparent p-0 h-auto overflow-x-auto no-scrollbar">
						{[
							{ id: 'all', label: 'All' },
							{ id: 'math', label: 'Math' },
							{ id: 'physics', label: 'Physics' },
							{ id: 'life', label: 'Life Sci' },
						].map((tab) => (
							<TabsTrigger
								key={tab.id}
								value={tab.id}
								onClick={() => setActiveTab(tab.id)}
								className="rounded-full border border-zinc-200 dark:border-zinc-800 px-6 py-2 data-[state=active]:bg-zinc-900 data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-zinc-900 bg-white dark:bg-zinc-900"
							>
								{tab.label}
							</TabsTrigger>
						))}
					</TabsList>
				</Tabs>
			</header>

			<ScrollArea className="flex-1">
				<main className="px-6 py-6 pb-32">
					<div className="grid grid-cols-2 gap-4">
						{filteredBookmarks.map((bookmark) => (
							<Card
								key={bookmark.id}
								className="p-4 hover:shadow-lg transition-all cursor-pointer rounded-3xl border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-sm flex flex-col h-56"
								onClick={() => onNavigate('QUIZ')}
							>
								<div className="flex justify-between items-start mb-4">
									<div
										className={`w-10 h-10 rounded-xl ${bookmark.bg} flex items-center justify-center`}
									>
										<bookmark.icon className={`w-5 h-5 ${bookmark.color}`} />
									</div>
									<Bookmark className={`w-5 h-5 ${bookmark.color} fill-current`} />
								</div>

								{/* Content Preview */}
								<div className="flex-1 bg-zinc-50 dark:bg-zinc-800/50 border border-dashed border-zinc-200 dark:border-zinc-700 rounded-xl mb-4 flex items-center justify-center p-2">
									{bookmark.type === 'equation' && (
										<span className="font-serif italic text-lg text-zinc-800 dark:text-zinc-200">
											{bookmark.content}
										</span>
									)}
									{bookmark.type !== 'equation' && (
										<div className="text-zinc-300 dark:text-zinc-600">
											{/* Placeholder Graphic */}
											<Activity className="w-8 h-8" />
										</div>
									)}
								</div>

								<div>
									<p
										className={`text-[10px] font-bold mb-1 uppercase tracking-wide ${bookmark.color}`}
									>
										{bookmark.subject}
									</p>
									<h3 className="text-sm font-bold text-zinc-900 dark:text-white leading-tight mb-1">
										{bookmark.title}
									</h3>
									<p className="text-[10px] text-zinc-400">{bookmark.info}</p>
								</div>
							</Card>
						))}
					</div>
				</main>
			</ScrollArea>
		</div>
	);
}
