import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { Screen } from '@/types';
import { AlertTriangle, ArrowLeft, BookOpen, Lightbulb, RotateCcw } from 'lucide-react';

interface ErrorHintProps {
	onNavigate: (s: Screen) => void;
}

export default function ErrorHint({ onNavigate }: ErrorHintProps) {
	return (
		<div className="flex flex-col min-h-screen bg-background">
			{/* Header */}
			<header className="px-6 pt-12 pb-4 bg-white dark:bg-zinc-900 sticky top-0 z-20 border-b border-zinc-100 dark:border-zinc-800">
				<div className="flex items-center gap-4">
					<Button variant="ghost" size="icon" onClick={() => onNavigate('QUIZ')}>
						<ArrowLeft className="w-5 h-5" />
					</Button>
					<h1 className="text-xl font-bold text-zinc-900 dark:text-white">Hint</h1>
				</div>
			</header>

			<main className="flex-1 p-6">
				{/* Warning Banner */}
				<Card className="p-4 mb-6 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center shrink-0">
							<AlertTriangle className="w-5 h-5 text-white" />
						</div>
						<div>
							<h2 className="font-bold text-amber-900 dark:text-amber-100">Not quite right yet</h2>
							<p className="text-sm text-amber-700 dark:text-amber-300">
								Don't worry! Let's work through this together.
							</p>
						</div>
					</div>
				</Card>

				{/* Original Question Reference */}
				<Card className="p-4 mb-6">
					<p className="text-sm text-zinc-500 mb-2">Original Question</p>
					<p className="font-medium text-zinc-900 dark:text-white">
						Calculate the equivalent resistance in the circuit shown below.
					</p>
				</Card>

				{/* Break It Down Section */}
				<div className="mb-6">
					<h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">
						Let's break it down
					</h3>

					{/* Circuit Diagram */}
					<Card className="p-6 mb-4 bg-zinc-50 dark:bg-zinc-800/50">
						<div className="relative">
							{/* Simple Circuit Visualization */}
							<div className="w-full h-48 border-2 border-zinc-300 dark:border-zinc-600 rounded-lg relative bg-white dark:bg-zinc-900">
								{/* Battery */}
								<div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col items-center">
									<div className="w-8 h-12 border-2 border-zinc-400 rounded flex items-center justify-center">
										<span className="text-xs font-bold">12V</span>
									</div>
								</div>

								{/* Resistors */}
								<div className="absolute top-4 left-1/2 -translate-x-1/2">
									<div className="px-4 py-2 border-2 border-zinc-400 rounded bg-yellow-50 dark:bg-yellow-900/20">
										<span className="text-xs font-bold">R₁ = 4Ω</span>
									</div>
								</div>

								<div className="absolute top-1/2 right-4 -translate-y-1/2">
									<div className="px-4 py-2 border-2 border-zinc-400 rounded bg-yellow-50 dark:bg-yellow-900/20">
										<span className="text-xs font-bold">R₂ = 6Ω</span>
									</div>
								</div>

								<div className="absolute bottom-4 left-1/2 -translate-x-1/2">
									<div className="px-4 py-2 border-2 border-zinc-400 rounded bg-yellow-50 dark:bg-yellow-900/20">
										<span className="text-xs font-bold">R₃ = 3Ω</span>
									</div>
								</div>

								{/* Focus Indicator */}
								<div className="absolute top-2 left-1/2 -translate-x-1/2 -mt-2">
									<div className="w-4 h-4 rounded-full bg-red-500 animate-pulse" />
								</div>
							</div>
							<p className="text-center text-xs text-zinc-500 mt-2">
								Figure 1: Series-Parallel Circuit
							</p>
						</div>
					</Card>
				</div>

				{/* Hint Card */}
				<Card className="p-4 mb-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
					<div className="flex items-start gap-3">
						<div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center shrink-0">
							<Lightbulb className="w-5 h-5 text-white" />
						</div>
						<div>
							<h4 className="font-bold text-blue-900 dark:text-blue-100 mb-1">Key Formula</h4>
							<p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
								For resistors in series: R<sub>eq</sub> = R₁ + R₂ + R₃
							</p>
							<p className="text-sm text-blue-700 dark:text-blue-300">
								For resistors in parallel: 1/R<sub>eq</sub> = 1/R₁ + 1/R₂ + 1/R₃
							</p>
							<div className="mt-3 p-2 bg-white dark:bg-zinc-800 rounded text-xs font-mono">
								R_eq = R₁ + (R₂ × R₃)/(R₂ + R₃)
							</div>
						</div>
					</div>
				</Card>

				{/* Tips */}
				<div className="space-y-3 mb-8">
					<h4 className="font-semibold text-zinc-900 dark:text-white">Step-by-step approach:</h4>
					<div className="flex items-start gap-3">
						<Badge variant="outline" className="shrink-0">
							1
						</Badge>
						<p className="text-sm text-zinc-600 dark:text-zinc-400">
							Identify which resistors are in series and which are in parallel
						</p>
					</div>
					<div className="flex items-start gap-3">
						<Badge variant="outline" className="shrink-0">
							2
						</Badge>
						<p className="text-sm text-zinc-600 dark:text-zinc-400">
							Calculate the equivalent resistance for parallel resistors first
						</p>
					</div>
					<div className="flex items-start gap-3">
						<Badge variant="outline" className="shrink-0">
							3
						</Badge>
						<p className="text-sm text-zinc-600 dark:text-zinc-400">
							Add series resistances to get total equivalent resistance
						</p>
					</div>
				</div>

				{/* Action Buttons */}
				<div className="space-y-3">
					<Button className="w-full h-12" onClick={() => onNavigate('QUIZ')}>
						<RotateCcw className="w-4 h-4 mr-2" />
						Try Again
					</Button>
					<Button variant="outline" className="w-full h-12" onClick={() => onNavigate('DASHBOARD')}>
						<BookOpen className="w-4 h-4 mr-2" />
						See Solution
					</Button>
				</div>
			</main>
		</div>
	);
}
