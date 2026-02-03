import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Screen } from '@/types';
import { ArrowLeft, Atom, Bookmark, Calculator, Microscope } from 'lucide-react';
import { useState } from 'react';

interface BookmarksProps {
	onNavigate: (s: Screen) => void;
}

const bookmarks = [
	{
		id: 1,
		subject: 'Mathematics',
		code: 'MATH P1',
		title: 'Solve for x: Quadratic equations',
		preview: 'x² - 5x + 6 = 0',
		date: '2 hours ago',
		icon: Calculator,
		color: 'bg-blue-500',
	},
	{
		id: 2,
		subject: 'Physics',
		code: 'PHYSICS P1',
		title: "Newton's Second Law application",
		preview: 'F = ma, calculate acceleration...',
		date: 'Yesterday',
		icon: Atom,
		color: 'bg-purple-500',
	},
	{
		id: 3,
		subject: 'Life Sciences',
		code: 'LIFE SCI P1',
		title: 'Cell structure and function',
		preview: 'Mitochondria, nucleus, cell membrane...',
		date: '3 days ago',
		icon: Microscope,
		color: 'bg-green-500',
	},
	{
		id: 4,
		subject: 'Mathematics',
		code: 'MATH P2',
		title: 'Calculus: Finding derivatives',
		preview: 'f(x) = 3x³ + 2x² - 5x + 1',
		date: '1 week ago',
		icon: Calculator,
		color: 'bg-blue-500',
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
			<header className="px-6 pt-12 pb-4 bg-white dark:bg-zinc-900 sticky top-0 z-20 border-b border-zinc-100 dark:border-zinc-800">
				<div className="flex items-center gap-4 mb-4">
					<Button variant="ghost" size="icon" onClick={() => onNavigate('DASHBOARD')}>
						<ArrowLeft className="w-5 h-5" />
					</Button>
					<h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Bookmarks</h1>
				</div>

				<Tabs defaultValue="all" className="w-full">
					<TabsList className="grid grid-cols-4 w-full">
						<TabsTrigger value="all" onClick={() => setActiveTab('all')}>
							All
						</TabsTrigger>
						<TabsTrigger value="math" onClick={() => setActiveTab('math')}>
							Math
						</TabsTrigger>
						<TabsTrigger value="physics" onClick={() => setActiveTab('physics')}>
							Physics
						</TabsTrigger>
						<TabsTrigger value="life" onClick={() => setActiveTab('life')}>
							Life Sci
						</TabsTrigger>
					</TabsList>
				</Tabs>
			</header>

			<ScrollArea className="flex-1">
				<main className="px-6 py-6 pb-24">
					<div className="grid grid-cols-2 gap-4">
						{filteredBookmarks.map((bookmark) => (
							<Card
								key={bookmark.id}
								className="p-4 hover:shadow-md transition-shadow cursor-pointer"
							>
								<div className="flex justify-between items-start mb-3">
									<div
										className={`w-10 h-10 rounded-xl ${bookmark.color} flex items-center justify-center`}
									>
										<bookmark.icon className="w-5 h-5 text-white" />
									</div>
									<Button variant="ghost" size="icon" className="h-8 w-8">
										<Bookmark className="w-4 h-4 fill-current" />
									</Button>
								</div>

								<div className="mb-3">
									<Badge variant="secondary" className="text-[10px] mb-2">
										{bookmark.code}
									</Badge>
									<p className="text-xs text-zinc-500 font-mono bg-zinc-100 dark:bg-zinc-800 p-2 rounded">
										{bookmark.preview}
									</p>
								</div>

								<h3 className="text-sm font-semibold text-zinc-900 dark:text-white line-clamp-2">
									{bookmark.title}
								</h3>
								<p className="text-[10px] text-zinc-500 mt-2">{bookmark.date}</p>
							</Card>
						))}
					</div>
				</main>
			</ScrollArea>
		</div>
	);
}
