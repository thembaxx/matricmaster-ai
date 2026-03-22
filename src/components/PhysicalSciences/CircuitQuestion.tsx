import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface CircuitQuestionProps {
	showAnnotations: boolean;
	setShowAnnotations: (show: boolean) => void;
	viewMode: 'question' | 'split' | 'simulations';
}

export function CircuitQuestion({
	showAnnotations,
	setShowAnnotations,
	viewMode,
}: CircuitQuestionProps) {
	return (
		<div
			className={`grid gap-6 ${viewMode === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}
		>
			{/* Circuit Diagram */}
			<Card className="p-6">
				<div className="flex justify-between items-center mb-4">
					<h3 className="font-semibold text-foreground">figure 1</h3>
					<Button variant="ghost" size="sm" onClick={() => setShowAnnotations(!showAnnotations)}>
						{showAnnotations ? 'hide' : 'show'} labels
					</Button>
				</div>

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
						<text x="160" y="60" textAnchor="middle" className="text-xs fill-current font-bold">
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
						<text x="290" y="165" textAnchor="start" className="text-xs fill-current font-bold">
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
						<text x="260" y="250" textAnchor="middle" className="text-xs fill-current font-bold">
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
						<span className="">r₂</span>, and <span className="">r₃</span> are connected as shown.
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

				<div className="mt-6 p-4 bg-subject-physics-soft rounded-2xl border border-subject-physics/20 shadow-sm">
					<h4 className="font-bold text-xs text-subject-physics tracking-widest mb-2">given:</h4>
					<ul className="space-y-1 text-sm font-bold text-foreground/80">
						<li>· v = 12 v</li>
						<li>· r₁ = 4 Ω</li>
						<li>· r₂ = 6 Ω</li>
						<li>· r₃ = 3 Ω</li>
					</ul>
				</div>
			</Card>
		</div>
	);
}
