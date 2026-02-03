import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Screen } from '@/types';
import {
	ArrowLeft,
	Bookmark,
	Calculator,
	Download,
	FileText,
	RotateCw,
	User,
	ZoomIn,
	ZoomOut,
} from 'lucide-react';
import { useState } from 'react';

interface PastPaperViewerProps {
	onNavigate: (s: Screen) => void;
}

const questions = [
	{ id: 1, number: '1', topic: 'Algebra' },
	{ id: 2, number: '2', topic: 'Calculus' },
	{ id: 3, number: '3', topic: 'Functions' },
	{ id: 4, number: '4', topic: 'Trig' },
	{ id: 5, number: '5', topic: 'Geometry' },
	{ id: 6, number: '6', topic: 'Stats' },
	{ id: 7, number: '7', topic: 'Probability' },
	{ id: 8, number: '8', topic: 'Finance' },
];

export default function PastPaperViewer({ onNavigate }: PastPaperViewerProps) {
	const [zoom, setZoom] = useState(100);
	const [activeTab, setActiveTab] = useState('paper');

	return (
		<div className="flex flex-col min-h-screen bg-background">
			{/* Header */}
			<header className="px-6 pt-12 pb-4 bg-white dark:bg-zinc-900 sticky top-0 z-20 border-b border-zinc-100 dark:border-zinc-800">
				<div className="flex items-center justify-between mb-4">
					<div className="flex items-center gap-4">
						<Button variant="ghost" size="icon" onClick={() => onNavigate('DASHBOARD')}>
							<ArrowLeft className="w-5 h-5" />
						</Button>
						<h1 className="text-lg font-bold text-zinc-900 dark:text-white">Mathematics P1</h1>
					</div>
					<div className="flex gap-2">
						<Button
							variant="ghost"
							size="icon"
							onClick={() => setZoom((z) => Math.max(50, z - 10))}
						>
							<ZoomOut className="w-5 h-5" />
						</Button>
						<span className="text-sm font-medium w-12 text-center">{zoom}%</span>
						<Button
							variant="ghost"
							size="icon"
							onClick={() => setZoom((z) => Math.min(200, z + 10))}
						>
							<ZoomIn className="w-5 h-5" />
						</Button>
						<Button variant="ghost" size="icon">
							<RotateCw className="w-5 h-5" />
						</Button>
						<Button variant="ghost" size="icon">
							<Download className="w-5 h-5" />
						</Button>
					</div>
				</div>

				{/* Metadata */}
				<div className="flex items-center gap-4 text-sm text-zinc-500">
					<Badge variant="outline">Marks: 150</Badge>
					<Badge variant="outline">Time: 3 Hours</Badge>
				</div>
			</header>

			<ScrollArea className="flex-1">
				<main className="px-6 py-6 pb-32">
					{/* Paper Title */}
					<div className="text-center mb-8">
						<h2 className="text-2xl font-bold text-zinc-900 dark:text-white">NSC Grade 12</h2>
						<p className="text-lg text-zinc-600 dark:text-zinc-400">Mathematics P1</p>
						<p className="text-sm text-zinc-500">November 2022</p>
					</div>

					{/* Instructions */}
					<Card className="p-6 mb-6 bg-zinc-50 dark:bg-zinc-800/50">
						<h3 className="font-bold text-zinc-900 dark:text-white mb-3">
							INSTRUCTIONS AND INFORMATION
						</h3>
						<ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
							<li className="flex items-start gap-2">
								<span className="text-zinc-400 mt-0.5">•</span>
								<span>This question paper consists of 10 questions.</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="text-zinc-400 mt-0.5">•</span>
								<span>Answer ALL the questions.</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="text-zinc-400 mt-0.5">•</span>
								<span>
									Number the answers correctly according to the numbering system used in this
									question paper.
								</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="text-zinc-400 mt-0.5">•</span>
								<span>
									Clearly show ALL calculations, diagrams, graphs, etc. that you have used in
									determining your answers.
								</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="text-zinc-400 mt-0.5">•</span>
								<span>Answers only will NOT necessarily be awarded full marks.</span>
							</li>
						</ul>
					</Card>

					{/* Question Navigation */}
					<div className="mb-6">
						<h3 className="font-semibold text-sm text-zinc-700 dark:text-zinc-300 mb-3">
							Jump to Question
						</h3>
						<div className="flex flex-wrap gap-2">
							{questions.map((q) => (
								<Button key={q.id} variant="outline" size="sm" className="w-10 h-10 p-0">
									{q.number}
								</Button>
							))}
						</div>
					</div>

					{/* Sample Question */}
					<Card className="p-6">
						<div className="flex items-center gap-2 mb-4">
							<Badge>QUESTION 1</Badge>
							<span className="text-sm text-zinc-500">(25 marks)</span>
						</div>
						<div className="space-y-4 text-zinc-800 dark:text-zinc-200">
							<p>1.1 Solve for x:</p>
							<p className="ml-4">1.1.1 x² - 5x + 6 = 0</p>
							<p className="ml-4">1.1.2 2x² + 3x - 2 = 0 (correct to TWO decimal places)</p>
							<p>1.2 Solve for x and y simultaneously:</p>
							<p className="ml-4">y = 2x + 1</p>
							<p className="ml-4">x² + y² = 10</p>
						</div>
					</Card>
				</main>
			</ScrollArea>

			{/* Bottom Toolbar */}
			<nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 px-6 py-3">
				<div className="flex justify-around items-center">
					{[
						{ id: 'paper', icon: FileText, label: 'Paper' },
						{ id: 'formulae', icon: Calculator, label: 'Formulae' },
						{ id: 'saved', icon: Bookmark, label: 'Saved' },
						{ id: 'profile', icon: User, label: 'Profile' },
					].map((item) => (
						<button
							type="button"
							key={item.id}
							onClick={() => setActiveTab(item.id)}
							className={`flex flex-col items-center gap-1 ${
								activeTab === item.id ? 'text-blue-600' : 'text-zinc-400'
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
