'use client';

import {
	ArrowLeft02Icon,
	Download01Icon,
	LayoutLeftIcon,
	MoonIcon,
	Settings01Icon,
	SparklesIcon,
	Sun01Icon,
	ViewIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { CircuitDiagram } from '@/components/Science/CircuitDiagram';
import { FreeBodyDiagram } from '@/components/Science/FreeBodyDiagram';
import { ProjectileMotion } from '@/components/Science/ProjectileMotion';
import { WaveInterference } from '@/components/Science/WaveInterference';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTheme } from '@/hooks/use-theme';

export default function PhysicalSciences() {
	const router = useRouter();
	const { theme, setTheme } = useTheme();
	const [viewMode, setViewMode] = useState<'question' | 'split' | 'simulations'>('split');
	const [showAnnotations, setShowAnnotations] = useState(true);
	const [activeSimulation, setActiveSimulation] = useState<
		'projectile' | 'forces' | 'waves' | 'circuit'
	>('projectile');

	return (
		<div className="flex flex-col h-full bg-background">
			{/* Header */}
			<header className="px-6 pt-12 pb-4 bg-card sticky top-0 z-20 border-b border-border shrink-0">
				<div className="flex items-center justify-between mb-4">
					<div className="flex items-center gap-4">
						<Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')}>
							<HugeiconsIcon icon={ArrowLeft02Icon} className="w-5 h-5" />
						</Button>
						<h1 className="text-2xl font-bold text-foreground tracking-tight">physics p1</h1>
					</div>
					<div className="flex gap-2">
						<Button variant="ghost" size="icon">
							<HugeiconsIcon icon={Settings01Icon} className="w-5 h-5" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
						>
							{theme === 'dark' ? (
								<HugeiconsIcon icon={Sun01Icon} className="w-5 h-5" />
							) : (
								<HugeiconsIcon icon={MoonIcon} className="w-5 h-5" />
							)}
						</Button>
						<Button variant="ghost" size="icon">
							<HugeiconsIcon icon={Download01Icon} className="w-5 h-5" />
						</Button>
					</div>
				</div>

				{/* Quick Action */}
				<div className="mb-4">
					<Button
						variant="gradient"
						className="w-full rounded-2xl font-bold h-12 gap-2 shadow-xl shadow-primary/20"
						onClick={() => router.push('/quiz')}
					>
						<HugeiconsIcon icon={SparklesIcon} className="w-4 h-4" />
						practice quiz
					</Button>
				</div>

				{/* View Toggle */}
				<Tabs
					value={viewMode}
					onValueChange={(v) => setViewMode(v as 'question' | 'split' | 'simulations')}
					className="w-full"
				>
					<TabsList className="grid grid-cols-3 w-full">
						<TabsTrigger value="question" className="flex items-center gap-2">
							<HugeiconsIcon icon={ViewIcon} className="w-4 h-4" />
							questions
						</TabsTrigger>
						<TabsTrigger value="split" className="flex items-center gap-2">
							<HugeiconsIcon icon={LayoutLeftIcon} className="w-4 h-4" />
							split
						</TabsTrigger>
						<TabsTrigger value="simulations" className="flex items-center gap-2">
							<HugeiconsIcon icon={SparklesIcon} className="w-4 h-4" />
							lab sims
						</TabsTrigger>
					</TabsList>
				</Tabs>
			</header>

			<ScrollArea className="flex-1">
				<main className="px-6 py-6 pb-12">
					<div
						className={`grid gap-6 ${viewMode === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}
					>
						{/* Circuit Diagram */}
						<Card className="p-6">
							<div className="flex justify-between items-center mb-4">
								<h3 className="font-semibold text-foreground">figure 1</h3>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => setShowAnnotations(!showAnnotations)}
								>
									{showAnnotations ? 'hide' : 'show'} labels
								</Button>
							</div>

							{/* Circuit Diagram */}
							<div className="relative bg-card rounded-xl p-8 min-h-[300px]">
								<svg
									viewBox="0 0 400 300"
									className="w-full h-full"
									role="img"
									aria-label="circuit diagram"
								>
									<title>circuit diagram</title>
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
										12v
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
										fill="var(--tiimo-orange)"
										stroke="currentColor"
										strokeWidth="2"
									/>
									<text
										x="160"
										y="60"
										textAnchor="middle"
										className="text-xs fill-current font-bold"
									>
										r₁ = 4Ω
									</text>

									{/* Resistor R2 */}
									<rect
										x="260"
										y="140"
										width="20"
										height="40"
										fill="var(--tiimo-orange)"
										stroke="currentColor"
										strokeWidth="2"
									/>
									<text
										x="290"
										y="165"
										textAnchor="start"
										className="text-xs fill-current font-bold"
									>
										r₂ = 6Ω
									</text>

									{/* Resistor R3 */}
									<rect
										x="240"
										y="210"
										width="40"
										height="20"
										fill="var(--tiimo-orange)"
										stroke="currentColor"
										strokeWidth="2"
									/>
									<text
										x="260"
										y="250"
										textAnchor="middle"
										className="text-xs fill-current font-bold"
									>
										r₃ = 3Ω
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
											<text x="160" y="45" textAnchor="middle" className="text-xs fill-destructive">
												series
											</text>

											<circle
												cx="280"
												cy="150"
												r="20"
												fill="none"
												stroke="var(--color-success)"
												strokeWidth="2"
											/>
											<text x="320" y="130" textAnchor="middle" className="text-xs fill-success">
												parallel
											</text>
										</>
									)}
								</svg>
							</div>
						</Card>

						{/* Question Text */}
						<Card className="p-6">
							<div className="flex items-center gap-2 mb-4">
								<Badge>question 2.1</Badge>
								<span className="text-sm text-muted-foreground">(5 marks)</span>
							</div>

							<div className="space-y-4 text-zinc-800 dark:text-zinc-200">
								<p>
									consider the circuit diagram shown in <strong>figure 1</strong> above.
								</p>

								<p>
									the battery has an emf of{' '}
									<span className="bg-yellow-100 dark:bg-yellow-900/30 px-1 rounded">12 v</span> and
									negligible internal resistance. resistors <span className="">r₁</span>,{' '}
									<span className="">r₂</span>, and <span className="">r₃</span> are connected as
									shown.
								</p>

								<p className="font-medium">calculate:</p>

								<div className="pl-4 space-y-2">
									<p>2.1.1 the equivalent resistance of the circuit.</p>
									<p>
										2.1.2 the current through resistor <span className="">r₁</span>.
									</p>
									<p>
										2.1.3 the power dissipated by resistor <span className="">r₃</span>.
									</p>
								</div>
							</div>

							{/* Given Data */}
							<div className="mt-6 p-4 bg-subject-physics-soft rounded-2xl border border-subject-physics/20 shadow-sm">
								<h4 className="font-bold text-xs text-subject-physics tracking-widest mb-2">
									given:
								</h4>
								<ul className="space-y-1 text-sm font-bold text-foreground/80">
									<li>· v = 12 v</li>
									<li>· r₁ = 4 Ω</li>
									<li>· r₂ = 6 Ω</li>
									<li>· r₃ = 3 Ω</li>
								</ul>
							</div>
						</Card>
					</div>

					{/* Lab Simulations Section */}
					{viewMode === 'simulations' && (
						<div className="space-y-6">
							<div className="flex gap-2 overflow-x-auto pb-2">
								<Button
									variant={activeSimulation === 'projectile' ? 'default' : 'outline'}
									size="sm"
									onClick={() => setActiveSimulation('projectile')}
									className="whitespace-nowrap"
								>
									projectile motion
								</Button>
								<Button
									variant={activeSimulation === 'forces' ? 'default' : 'outline'}
									size="sm"
									onClick={() => setActiveSimulation('forces')}
									className="whitespace-nowrap"
								>
									forces (fbd)
								</Button>
								<Button
									variant={activeSimulation === 'waves' ? 'default' : 'outline'}
									size="sm"
									onClick={() => setActiveSimulation('waves')}
									className="whitespace-nowrap"
								>
									wave interference
								</Button>
								<Button
									variant={activeSimulation === 'circuit' ? 'default' : 'outline'}
									size="sm"
									onClick={() => setActiveSimulation('circuit')}
									className="whitespace-nowrap"
								>
									circuit builder
								</Button>
							</div>

							{activeSimulation === 'projectile' && <ProjectileMotion />}

							{activeSimulation === 'forces' && <FreeBodyDiagram />}

							{activeSimulation === 'waves' && <WaveInterference />}

							{activeSimulation === 'circuit' && (
								<CircuitDiagram
									elements={[
										{ id: 'b1', type: 'battery', value: 12, position: { x: 50, y: 125 } },
										{
											id: 'r1',
											type: 'resistor',
											value: 4,
											label: 'R1',
											position: { x: 150, y: 80 },
										},
										{
											id: 'r2',
											type: 'resistor',
											value: 6,
											label: 'R2',
											position: { x: 280, y: 125 },
										},
										{
											id: 'r3',
											type: 'resistor',
											value: 3,
											label: 'R3',
											position: { x: 260, y: 200 },
										},
									]}
								/>
							)}

							<div className="p-4 bg-muted rounded-xl">
								<h4 className="font-semibold text-sm mb-2">How to use these simulations:</h4>
								<ul className="text-xs text-muted-foreground space-y-1">
									<li>• Click Play/Pause to start/stop animations</li>
									<li>• Adjust sliders to change parameters</li>
									<li>• Click elements to see values</li>
									<li>• Use Reset to start over</li>
								</ul>
							</div>
						</div>
					)}
				</main>
			</ScrollArea>
		</div>
	);
}
