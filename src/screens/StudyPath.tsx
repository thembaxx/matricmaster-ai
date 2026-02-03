import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Screen } from '@/types';
import { ArrowLeft, CheckCircle2, ChevronRight, Lock, Play, Star } from 'lucide-react';

interface StudyPathProps {
	onNavigate: (s: Screen) => void;
}

const pathNodes = [
	{
		id: 1,
		title: 'Physics Circuits',
		status: 'locked',
		icon: Lock,
		description: "Ohm's Law & Kirchhoff",
	},
	{
		id: 2,
		title: 'Calculus P1',
		status: 'current',
		icon: Play,
		description: 'In Progress • 35%',
		progress: 35,
	},
	{
		id: 3,
		title: 'Intro to Functions',
		status: 'completed',
		icon: CheckCircle2,
		description: 'Completed',
		stars: 3,
	},
	{
		id: 4,
		title: 'Algebra Basics',
		status: 'completed',
		icon: CheckCircle2,
		description: 'Completed',
		stars: 2,
	},
];

export default function StudyPath({ onNavigate }: StudyPathProps) {
	const overallProgress = 12;

	return (
		<div className="flex flex-col min-h-screen bg-background">
			{/* Header */}
			<header className="px-6 pt-12 pb-4 bg-white dark:bg-zinc-900 sticky top-0 z-20 border-b border-zinc-100 dark:border-zinc-800">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<Button variant="ghost" size="icon" onClick={() => onNavigate('DASHBOARD')}>
							<ArrowLeft className="w-5 h-5" />
						</Button>
						<h1 className="text-xl font-bold text-zinc-900 dark:text-white">My Physics Path</h1>
					</div>
					<Badge variant="secondary" className="flex items-center gap-1">
						<span className="w-2 h-2 rounded-full bg-yellow-500" />
						{overallProgress}%
					</Badge>
				</div>
			</header>

			<ScrollArea className="flex-1">
				<main className="px-6 py-6 pb-32">
					{/* Path Visualization */}
					<div className="relative">
						{/* Connecting Line */}
						<div className="absolute left-8 top-8 bottom-8 w-1 bg-gradient-to-b from-zinc-200 via-blue-200 to-zinc-200 dark:from-zinc-800 dark:via-blue-900/50 dark:to-zinc-800" />

						{/* Nodes */}
						<div className="space-y-8">
							{pathNodes.map((node) => (
								<div key={node.id} className="relative flex items-center gap-4">
									{/* Node Circle */}
									<div
										className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center ${
											node.status === 'locked'
												? 'bg-zinc-200 dark:bg-zinc-800'
												: node.status === 'current'
													? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30'
													: 'bg-green-500'
										}`}
									>
										<node.icon
											className={`w-7 h-7 ${
												node.status === 'locked' ? 'text-zinc-400' : 'text-white'
											}`}
										/>

										{/* Status Badge */}
										{node.status === 'current' && (
											<div className="absolute -top-2 -right-2 px-2 py-0.5 bg-yellow-400 text-zinc-900 text-[10px] font-bold rounded-full">
												NEXT
											</div>
										)}
									</div>

									{/* Node Info Card */}
									<Card
										className={`flex-1 p-4 ${
											node.status === 'current' ? 'border-2 border-blue-500 shadow-md' : ''
										}`}
									>
										<div className="flex justify-between items-start">
											<div>
												<h3 className="font-semibold text-zinc-900 dark:text-white">
													{node.title}
												</h3>
												<p className="text-sm text-zinc-500">{node.description}</p>

												{/* Progress Bar for Current */}
												{node.status === 'current' && node.progress && (
													<div className="mt-2">
														<Progress value={node.progress} className="h-1.5 w-32" />
													</div>
												)}
											</div>

											{/* Stars for Completed */}
											{node.status === 'completed' && node.stars && (
												<div className="flex gap-0.5">
													{Array.from({ length: node.stars }).map((_, i) => (
														<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
													))}
												</div>
											)}
										</div>
									</Card>
								</div>
							))}
						</div>
					</div>
				</main>
			</ScrollArea>

			{/* Resume Button */}
			<div className="fixed bottom-6 left-6 right-6">
				<Button
					className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-lg"
					onClick={() => onNavigate('QUIZ')}
				>
					<Play className="w-5 h-5 mr-2" />
					Resume: Calculus P1
					<ChevronRight className="w-5 h-5 ml-auto" />
				</Button>
			</div>
		</div>
	);
}
