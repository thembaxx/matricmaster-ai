import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTheme } from '@/hooks/use-theme';
import type { Screen } from '@/types';
import { ArrowLeft, Download, Eye, Moon, Settings, Split, Sun } from 'lucide-react';
import { useState } from 'react';

interface PhysicalSciencesProps {
	onNavigate: (s: Screen) => void;
}

export default function PhysicalSciences({ onNavigate }: PhysicalSciencesProps) {
	const { theme, setTheme } = useTheme();
	const [viewMode, setViewMode] = useState<'question' | 'split'>('split');
	const [showAnnotations, setShowAnnotations] = useState(true);

	return (
		<div className="flex flex-col min-h-screen bg-background">
			{/* Header */}
			<header className="px-6 pt-12 pb-4 bg-white dark:bg-zinc-900 sticky top-0 z-20 border-b border-zinc-100 dark:border-zinc-800">
				<div className="flex items-center justify-between mb-4">
					<div className="flex items-center gap-4">
						<Button variant="ghost" size="icon" onClick={() => onNavigate('DASHBOARD')}>
							<ArrowLeft className="w-5 h-5" />
						</Button>
						<h1 className="text-lg font-bold text-zinc-900 dark:text-white">Physics P1</h1>
					</div>
					<div className="flex gap-2">
						<Button variant="ghost" size="icon">
							<Settings className="w-5 h-5" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
						>
							{theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
						</Button>
						<Button variant="ghost" size="icon">
							<Download className="w-5 h-5" />
						</Button>
					</div>
				</div>

				{/* View Toggle */}
				<Tabs
					value={viewMode}
					onValueChange={(v) => setViewMode(v as 'question' | 'split')}
					className="w-full"
				>
					<TabsList className="grid grid-cols-2 w-full">
						<TabsTrigger value="question" className="flex items-center gap-2">
							<Eye className="w-4 h-4" />
							Question Only
						</TabsTrigger>
						<TabsTrigger value="split" className="flex items-center gap-2">
							<Split className="w-4 h-4" />
							Split View
						</TabsTrigger>
					</TabsList>
				</Tabs>
			</header>

			<ScrollArea className="flex-1">
				<main className="px-6 py-6 pb-24">
					<div
						className={`grid gap-6 ${viewMode === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}
					>
						{/* Circuit Diagram */}
						<Card className="p-6">
							<div className="flex justify-between items-center mb-4">
								<h3 className="font-semibold text-zinc-900 dark:text-white">Figure 1</h3>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => setShowAnnotations(!showAnnotations)}
								>
									{showAnnotations ? 'Hide' : 'Show'} Labels
								</Button>
							</div>

							{/* Circuit Diagram */}
							<div className="relative bg-white dark:bg-zinc-800 rounded-xl p-8 min-h-[300px]">
								<svg
									viewBox="0 0 400 300"
									className="w-full h-full"
									role="img"
									aria-label="Circuit diagram"
								>
									<title>Circuit Diagram</title>
									{/* Battery */}
									<rect
										x="20"
										y="130"
										width="40"
										height="40"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
									/>
									<text x="40" y="155" textAnchor="middle" className="text-xs fill-current">
										12V
									</text>

									{/* Wires */}
									<line x1="60" y1="150" x2="120" y2="150" stroke="currentColor" strokeWidth="2" />
									<line x1="120" y1="150" x2="120" y2="80" stroke="currentColor" strokeWidth="2" />
									<line x1="120" y1="80" x2="200" y2="80" stroke="currentColor" strokeWidth="2" />
									<line x1="200" y1="80" x2="280" y2="80" stroke="currentColor" strokeWidth="2" />
									<line x1="280" y1="80" x2="280" y2="150" stroke="currentColor" strokeWidth="2" />
									<line x1="280" y1="150" x2="340" y2="150" stroke="currentColor" strokeWidth="2" />
									<line x1="340" y1="150" x2="340" y2="220" stroke="currentColor" strokeWidth="2" />
									<line x1="340" y1="220" x2="200" y2="220" stroke="currentColor" strokeWidth="2" />
									<line x1="200" y1="220" x2="60" y2="220" stroke="currentColor" strokeWidth="2" />
									<line x1="60" y1="220" x2="60" y2="170" stroke="currentColor" strokeWidth="2" />

									{/* Resistor R1 */}
									<rect
										x="140"
										y="70"
										width="40"
										height="20"
										fill="#fbbf24"
										stroke="currentColor"
										strokeWidth="2"
									/>
									<text
										x="160"
										y="60"
										textAnchor="middle"
										className="text-xs fill-current font-bold"
									>
										R₁ = 4Ω
									</text>

									{/* Resistor R2 */}
									<rect
										x="260"
										y="140"
										width="20"
										height="40"
										fill="#fbbf24"
										stroke="currentColor"
										strokeWidth="2"
									/>
									<text
										x="290"
										y="165"
										textAnchor="start"
										className="text-xs fill-current font-bold"
									>
										R₂ = 6Ω
									</text>

									{/* Resistor R3 */}
									<rect
										x="240"
										y="210"
										width="40"
										height="20"
										fill="#fbbf24"
										stroke="currentColor"
										strokeWidth="2"
									/>
									<text
										x="260"
										y="250"
										textAnchor="middle"
										className="text-xs fill-current font-bold"
									>
										R₃ = 3Ω
									</text>

									{/* Annotations */}
									{showAnnotations && (
										<>
											<circle
												cx="160"
												cy="80"
												r="15"
												fill="none"
												stroke="#ef4444"
												strokeWidth="2"
											/>
											<text x="160" y="45" textAnchor="middle" className="text-xs fill-red-500">
												Series
											</text>

											<circle
												cx="280"
												cy="150"
												r="20"
												fill="none"
												stroke="#22c55e"
												strokeWidth="2"
											/>
											<text x="320" y="130" textAnchor="middle" className="text-xs fill-green-500">
												Parallel
											</text>
										</>
									)}
								</svg>
							</div>
						</Card>

						{/* Question Text */}
						<Card className="p-6">
							<div className="flex items-center gap-2 mb-4">
								<Badge>QUESTION 2.1</Badge>
								<span className="text-sm text-zinc-500">(5 marks)</span>
							</div>

							<div className="space-y-4 text-zinc-800 dark:text-zinc-200">
								<p>
									Consider the circuit diagram shown in <strong>FIGURE 1</strong> above.
								</p>

								<p>
									The battery has an emf of{' '}
									<span className="bg-yellow-100 dark:bg-yellow-900/30 px-1 rounded font-mono">
										12 V
									</span>{' '}
									and negligible internal resistance. Resistors{' '}
									<span className="font-mono">R₁</span>, <span className="font-mono">R₂</span>, and{' '}
									<span className="font-mono">R₃</span> are connected as shown.
								</p>

								<p className="font-medium">Calculate:</p>

								<div className="pl-4 space-y-2">
									<p>2.1.1 The equivalent resistance of the circuit.</p>
									<p>
										2.1.2 The current through resistor <span className="font-mono">R₁</span>.
									</p>
									<p>
										2.1.3 The power dissipated by resistor <span className="font-mono">R₃</span>.
									</p>
								</div>
							</div>

							{/* Given Data */}
							<div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
								<h4 className="font-semibold text-sm text-blue-900 dark:text-blue-100 mb-2">
									Given:
								</h4>
								<ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
									<li>• V = 12 V</li>
									<li>• R₁ = 4 Ω</li>
									<li>• R₂ = 6 Ω</li>
									<li>• R₃ = 3 Ω</li>
								</ul>
							</div>
						</Card>
					</div>
				</main>
			</ScrollArea>
		</div>
	);
}
