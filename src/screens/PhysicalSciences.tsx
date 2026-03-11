'use client';

import {
	ArrowLeft01Icon as ArrowLeft,
	Download01Icon as DownloadSimple,
	ViewIcon as Eye,
	Settings02Icon as Gear,
	Moon02Icon as Moon,
	SparklesIcon as Sparkle,
	SquareLock01Icon as SplitVertical,
	Sun01Icon as Sun,
} from 'hugeicons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTheme } from '@/hooks/use-theme';

// import type { Screen } from '@/types'; // Removed unused import

export default function PhysicalSciences() {
	const router = useRouter();
	const { theme, setTheme } = useTheme();
	const [viewMode, setViewMode] = useState<'question' | 'split'>('split');
	const [showAnnotations, setShowAnnotations] = useState(true);

	return (
		<div className="flex flex-col h-full bg-white dark:bg-zinc-950">
			{/* Header */}
			<header className="px-8 pt-16 pb-8 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-3xl sticky top-0 z-20 border-none shrink-0">
				<div className="max-w-7xl mx-auto w-full space-y-10">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-6">
							<Button
								variant="ghost"
								size="icon"
								onClick={() => router.push('/dashboard')}
								className="h-14 w-14 rounded-2xl bg-muted/10 hover:bg-muted/20"
							>
								<ArrowLeft size={24} className="stroke-[3px]" />
							</Button>
							<div className="space-y-1">
								<h1 className="text-3xl font-black text-foreground tracking-tight">
									Physics P1
								</h1>
								<p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">National Senior Certificate</p>
							</div>
						</div>
						<div className="flex gap-3">
							<Button
								variant="ghost"
								size="icon"
								className="h-12 w-12 rounded-xl bg-muted/10"
								onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
							>
								{theme === 'dark' ? <Sun size={20} className="stroke-[3px]" /> : <Moon size={20} className="stroke-[3px]" />}
							</Button>
							<Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl bg-muted/10">
								<DownloadSimple size={20} className="stroke-[3px]" />
							</Button>
						</div>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
						<Button
							onClick={() => router.push('/physics-quiz')}
							className="h-16 px-8 rounded-[1.75rem] bg-primary hover:bg-primary/90 text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/30 transition-all active:scale-95 flex items-center justify-center gap-3"
						>
							<Sparkle size={20} className="stroke-[3.5px]" />
							Interactive Practice
						</Button>

						<Tabs
							value={viewMode}
							onValueChange={(v) => setViewMode(v as 'question' | 'split')}
							className="w-full h-16"
						>
							<TabsList className="h-full w-full p-1.5 bg-muted/10 rounded-[1.75rem] border-none flex gap-2">
								<TabsTrigger
									value="question"
									className="flex-1 h-full rounded-[1.25rem] font-black text-[10px] uppercase tracking-[0.2em] data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900 data-[state=active]:shadow-lg transition-all"
								>
									<Eye size={16} className="mr-2 stroke-[3px]" />
									Solo
								</TabsTrigger>
								<TabsTrigger
									value="split"
									className="flex-1 h-full rounded-[1.25rem] font-black text-[10px] uppercase tracking-[0.2em] data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900 data-[state=active]:shadow-lg transition-all"
								>
									<SplitVertical size={16} className="mr-2 stroke-[3px]" />
									Dual
								</TabsTrigger>
							</TabsList>
						</Tabs>
					</div>
				</div>
			</header>

			<ScrollArea className="flex-1 no-scrollbar">
				<main className="px-8 py-8 max-w-7xl mx-auto w-full pb-64">
					<div
						className={cn("grid gap-12", viewMode === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1')}
					>
						{/* Circuit Diagram */}
						<Card className="p-10 rounded-[3.5rem] border-none bg-card shadow-[0_20px_60px_rgba(0,0,0,0.06)] flex flex-col gap-8">
							<div className="flex justify-between items-center px-2">
								<div className="space-y-1">
									<h3 className="text-xl font-black text-foreground tracking-tight">Visual Aid</h3>
									<p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">Figure 1.1 Diagram</p>
								</div>
								<Button
									variant="ghost"
									className="h-10 px-4 rounded-xl bg-muted/10 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 hover:bg-primary hover:text-white transition-all"
									onClick={() => setShowAnnotations(!showAnnotations)}
								>
									{showAnnotations ? 'Hide' : 'Show'} Overlay
								</Button>
							</div>

							{/* Circuit Diagram */}
							<div className="relative bg-white dark:bg-zinc-900/50 rounded-[2.5rem] p-12 min-h-[400px] shadow-inner flex items-center justify-center">
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
										fill="var(--primary-orange)"
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
										fill="var(--primary-orange)"
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
										fill="var(--primary-orange)"
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
												stroke="var(--color-destructive)"
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
												stroke="var(--color-success)"
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
						<Card className="p-12 rounded-[3.5rem] border-none bg-card shadow-[0_20px_60px_rgba(0,0,0,0.06)] flex flex-col gap-10">
							<div className="flex items-center justify-between">
								<div className="h-10 px-6 rounded-2xl bg-primary text-white flex items-center justify-center text-xs font-black uppercase tracking-widest">
									Section 2.1
								</div>
								<span className="text-sm font-black text-muted-foreground/40 uppercase tracking-widest">5 Score Weight</span>
							</div>

							<div className="space-y-8 text-foreground font-bold text-xl leading-relaxed">
								<p className="text-muted-foreground/60 font-medium">
									Review the circuit layout in <span className="text-foreground font-black uppercase">Figure 1.1</span> and answer the following:
								</p>

								<p>
									The battery source provides <span className="bg-tiimo-orange/20 text-tiimo-orange px-3 py-1 rounded-xl font-mono mx-1">12V</span>
									with minimal internal resistance. Resistors <span className="text-primary">R₁</span>, <span className="text-primary">R₂</span>, and <span className="text-primary">R₃</span> are configured in a mixed circuit.
								</p>

								<div className="space-y-6 pt-4">
									<div className="flex gap-6 p-6 rounded-[2rem] bg-muted/5 hover:bg-muted/10 transition-colors">
										<span className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 flex items-center justify-center text-xs font-black">1</span>
										<p>Calculate the total equivalent resistance of the entire circuit network.</p>
									</div>
									<div className="flex gap-6 p-6 rounded-[2rem] bg-muted/5 hover:bg-muted/10 transition-colors">
										<span className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 flex items-center justify-center text-xs font-black">2</span>
										<p>Determine the precise current flow passing through resistor <span className="text-primary">R₁</span>.</p>
									</div>
									<div className="flex gap-6 p-6 rounded-[2rem] bg-muted/5 hover:bg-muted/10 transition-colors">
										<span className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 flex items-center justify-center text-xs font-black">3</span>
										<p>Analyze the total power dissipation occurring within resistor <span className="text-primary">R₃</span>.</p>
									</div>
								</div>
							</div>

							{/* Given Data */}
							<div className="mt-4 p-8 bg-tiimo-blue/5 rounded-[2.5rem] border-none shadow-sm space-y-6">
								<div className="flex items-center gap-3">
									<Zap size={20} className="text-tiimo-blue stroke-[3px]" />
									<h4 className="font-black text-[10px] text-tiimo-blue/60 uppercase tracking-[0.3em]">
										Data Source
									</h4>
								</div>
								<div className="grid grid-cols-2 gap-4">
									{[
										{ label: 'Voltage', value: '12 V' },
										{ label: 'R₁ Node', value: '4 Ω' },
										{ label: 'R₂ Node', value: '6 Ω' },
										{ label: 'R₃ Node', value: '3 Ω' },
									].map((item) => (
										<div key={item.label} className="flex justify-between items-center p-4 bg-white dark:bg-zinc-900 rounded-2xl">
											<span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">{item.label}</span>
											<span className="font-black text-foreground">{item.value}</span>
										</div>
									))}
								</div>
							</div>
						</Card>
					</div>
				</main>
			</ScrollArea>
		</div>
	);
}
