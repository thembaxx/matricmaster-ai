import {
	ArrowLeft,
	Bookmark,
	Calculator,
	Download,
	FileText,
	RotateCw,
	Sparkles,
	User,
	ZoomIn,
	ZoomOut,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PAST_PAPERS } from '@/constants/mock-data';

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

export default function PastPaperViewer() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const paperId = searchParams.get('id');

	const [zoom, setZoom] = useState(100);
	const [activeTab, setActiveTab] = useState('paper');
	const [rotation, setRotation] = useState(0);
	const [isSaved, setIsSaved] = useState(false);
	const [paper, setPaper] = useState(PAST_PAPERS[0]);

	useEffect(() => {
		if (paperId) {
			const found = PAST_PAPERS.find((p) => p.id === paperId);
			if (found) setPaper(found);
		}
	}, [paperId]);

	const handleDownload = () => {
		window.open(paper.downloadUrl, '_blank');
	};

	const handleRotate = () => {
		setRotation((r) => (r + 90) % 360);
	};

	const handleSave = () => {
		setIsSaved(!isSaved);
	};

	const handleConvertToInteractive = () => {
		router.push(`/interactive-quiz?id=${paper.id}`);
	};

	return (
		<div className="flex flex-col h-full bg-background relative">
			{/* Header */}
			<header className="px-6 pt-12 pb-4 bg-white dark:bg-zinc-900 sticky top-0 z-20 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
				<div className="flex items-center justify-between mb-4">
					<div className="flex items-center gap-4">
						<Button variant="ghost" size="icon" onClick={() => router.back()}>
							<ArrowLeft className="w-5 h-5" />
						</Button>
						<h1 className="text-lg font-bold text-zinc-900 dark:text-white">
							{paper.subject} {paper.paper}
						</h1>
					</div>
					<div className="flex gap-2">
						<Button
							variant="ghost"
							size="icon"
							onClick={() => setZoom((z) => Math.max(50, z - 10))}
						>
							<ZoomOut className="w-5 h-5" />
						</Button>
						<span className="text-sm font-medium w-12 text-center flex items-center justify-center">
							{zoom}%
						</span>
						<Button
							variant="ghost"
							size="icon"
							onClick={() => setZoom((z) => Math.min(200, z + 10))}
						>
							<ZoomIn className="w-5 h-5" />
						</Button>
						<Button variant="ghost" size="icon" onClick={handleRotate}>
							<RotateCw className="w-5 h-5" />
						</Button>
						<Button variant="ghost" size="icon" onClick={handleDownload}>
							<Download className="w-5 h-5" />
						</Button>
					</div>
				</div>

				{/* Metadata */}
				<div className="flex items-center gap-4 text-sm text-zinc-500">
					<Badge variant="outline">Marks: {paper.marks}</Badge>
					<Badge variant="outline">Time: {paper.time}</Badge>
					<Button
						variant="ghost"
						size="sm"
						className={`ml-auto font-bold gap-2 ${isSaved ? 'text-brand-blue' : ''}`}
						onClick={handleSave}
					>
						<Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
						{isSaved ? 'Saved' : 'Save'}
					</Button>
				</div>
			</header>

			<ScrollArea className="flex-1">
				<main
					className="px-6 py-6 pb-24 transition-transform duration-300"
					style={{
						transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
						transformOrigin: 'top center',
					}}
				>
					{/* Paper Title */}
					<div className="text-center mb-8">
						<h2 className="text-2xl font-bold text-zinc-900 dark:text-white">NSC Grade 12</h2>
						<p className="text-lg text-zinc-600 dark:text-zinc-400">
							{paper.subject} {paper.paper}
						</p>
						<p className="text-sm text-zinc-500">
							{paper.month} {paper.year}
						</p>
					</div>

					{/* Conversion Banner */}
					<Card
						className="p-6 mb-8 bg-brand-blue/5 border-brand-blue/20 rounded-[2rem] flex items-center justify-between group cursor-pointer hover:bg-brand-blue/10 transition-colors"
						onClick={handleConvertToInteractive}
					>
						<div className="flex items-center gap-4">
							<div className="w-12 h-12 rounded-2xl bg-brand-blue text-white flex items-center justify-center shadow-lg shadow-brand-blue/20">
								<Sparkles className="w-6 h-6" />
							</div>
							<div>
								<h4 className="font-black text-zinc-900 dark:text-white">Convert to Interactive</h4>
								<p className="text-xs font-bold text-zinc-500 text-brand-blue/70">
									Solve this paper step-by-step with AI
								</p>
							</div>
						</div>
						<Button
							size="sm"
							className="bg-brand-blue text-white rounded-xl font-black text-[10px] uppercase tracking-wider"
						>
							Start Quiz
						</Button>
					</Card>

					{/* Instructions */}
					<Card className="p-6 mb-6 bg-zinc-50 dark:bg-zinc-800/50">
						<h3 className="font-bold text-zinc-900 dark:text-white mb-3 text-sm">
							INSTRUCTIONS AND INFORMATION
						</h3>
						<ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
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
						</ul>
					</Card>

					{/* Question Navigation */}
					<div className="mb-6">
						<h3 className="font-black text-[10px] text-zinc-400 uppercase tracking-widest mb-3 px-1">
							Jump to Question
						</h3>
						<div className="flex flex-wrap gap-2">
							{questions.map((q) => (
								<Button
									key={q.id}
									variant="outline"
									size="sm"
									className="w-10 h-10 p-0 rounded-xl font-bold border-zinc-200 dark:border-zinc-800 transition-colors hover:border-brand-blue hover:text-brand-blue"
								>
									{q.number}
								</Button>
							))}
						</div>
					</div>

					{/* Sample Question */}
													<Card className="p-6 rounded-[2rem] border-none shadow-sm bg-white dark:bg-zinc-900 relative overflow-hidden">
														<div className="absolute inset-0 opacity-[0.03] pointer-events-none grayscale">
																									{/* biome-ignore lint/performance/noImgElement: Background texture illustration */}
																									<img																src="https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&q=80&w=800"
																alt="Paper texture"
																className="w-full h-full object-cover"
															/>
														</div>
														<div className="flex items-center gap-2 mb-4 relative z-10">							<Badge className="bg-brand-blue text-white rounded-lg">QUESTION 1</Badge>
							<span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
								(25 marks)
							</span>
						</div>
						<div className="space-y-4 text-zinc-800 dark:text-zinc-200 font-medium">
							<p>1.1 Solve for x:</p>
							<div className="space-y-2 ml-4">
								<p>1.1.1 x² - 5x + 6 = 0</p>
								<p>1.1.2 2x² + 3x - 2 = 0 (correct to TWO decimal places)</p>
							</div>
							<p className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
								1.2 Solve for x and y simultaneously:
							</p>
							<div className="space-y-2 ml-4 font-mono">
								<p>y = 2x + 1</p>
								<p>x² + y² = 10</p>
							</div>
						</div>
					</Card>
				</main>
			</ScrollArea>

			{/* Bottom Toolbar */}
			<nav className="absolute bottom-0 left-0 right-0 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border-t border-zinc-100 dark:border-zinc-800 px-6 py-3 pb-8">
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
							className={`flex flex-col items-center gap-1 transition-all duration-300 ${
								activeTab === item.id ? 'text-brand-blue scale-110' : 'text-zinc-400'
							}`}
						>
							<item.icon
								className={`w-5 h-5 ${activeTab === item.id ? 'fill-brand-blue/10' : ''}`}
							/>
							<span className="text-[10px] font-black uppercase tracking-wider">{item.label}</span>
						</button>
					))}
				</div>
			</nav>
		</div>
	);
}
