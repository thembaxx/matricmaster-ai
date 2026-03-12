'use client';

import {
	AtomIcon,
	BookOpen01Icon,
	CalculatorIcon,
	Cancel01Icon,
	Clock01Icon,
	ListViewIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { AnimatePresence, m } from 'framer-motion';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

// ============================================================================
// MATH FORMULA SHEET DRAWER
// ============================================================================

export function MathFormulaSheet() {
	const [isOpen, setIsOpen] = useState(false);

	const formulas = [
		{ title: 'Quadratic Formula', formula: 'x = [-b ± √(b² - 4ac)] / 2a' },
		{ title: 'Arithmetic nth Term', formula: 'Tn = a + (n-1)d' },
		{ title: 'Geometric nth Term', formula: 'Tn = arⁿ⁻¹' },
		{ title: 'Derivative Power Rule', formula: 'd/dx[xⁿ] = nxⁿ⁻¹' },
	];

	return (
		<>
			<Button 
				onClick={() => setIsOpen(true)}
				className="fixed right-6 bottom-32 w-14 h-14 rounded-full bg-subject-math text-white shadow-xl z-40"
			>
				<HugeiconsIcon icon={CalculatorIcon} className="w-6 h-6" />
			</Button>

			<AnimatePresence>
				{isOpen && (
					<m.div 
						initial={{ x: '100%' }}
						animate={{ x: 0 }}
						exit={{ x: '100%' }}
						className="fixed right-0 top-0 h-full w-80 bg-card shadow-2xl z-50 border-l border-border/50 flex flex-col"
					>
						<div className="p-6 border-b border-border/50 flex items-center justify-between">
							<h3 className="font-black uppercase text-xs tracking-widest">Formula Sheet</h3>
							<Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
								<HugeiconsIcon icon={Cancel01Icon} className="w-5 h-5" />
							</Button>
						</div>
						<ScrollArea className="flex-1 p-6">
							<div className="space-y-6">
								{formulas.map((f, i) => (
									<div key={i} className="space-y-2">
										<p className="text-[10px] font-black text-muted-foreground uppercase">{f.title}</p>
										<div className="p-4 bg-muted rounded-xl font-mono text-xs break-all">
											{f.formula}
										</div>
									</div>
								))}
							</div>
						</ScrollArea>
					</m.div>
				)}
			</AnimatePresence>
		</>
	);
}

// ============================================================================
// HISTORY TIMELINE SCRUBBER
// ============================================================================

export function HistoryTimeline() {
	const [activeIndex, setActiveIndex] = useState(0);

	const events = [
		{ year: '1945', title: 'End of WWII', desc: 'Yalta and Potsdam Conferences' },
		{ year: '1948', title: 'Apartheid Begins', desc: 'National Party victory' },
		{ year: '1960', title: 'Sharpeville', desc: 'Turning point in resistance' },
		{ year: '1990', title: 'Mandela Released', desc: 'Unbanning of ANC' },
		{ year: '1994', title: 'Democracy', desc: 'First democratic elections' },
	];

	return (
		<Card className="shadow-tiimo border-border/50 overflow-hidden">
			<CardHeader className="bg-muted/30 pb-4">
				<CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
					<HugeiconsIcon icon={Clock01Icon} className="w-4 h-4" />
					SA History Scrubber
				</CardTitle>
			</CardHeader>
			<CardContent className="p-6">
				<div className="relative h-2 bg-muted rounded-full mb-8 mt-4">
					<div className="absolute inset-0 flex justify-between px-2 -top-2">
						{events.map((_, i) => (
							<button
								key={i}
								onClick={() => setActiveIndex(i)}
								className={cn(
									"w-6 h-6 rounded-full border-4 border-card transition-all",
									i <= activeIndex ? "bg-primary scale-110" : "bg-muted-foreground/30"
								)}
							/>
						))}
					</div>
				</div>
				<m.div 
					key={activeIndex}
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					className="text-center"
				>
					<span className="text-2xl font-black text-primary">{events[activeIndex].year}</span>
					<h4 className="text-lg font-black uppercase tracking-tight mt-1">{events[activeIndex].title}</h4>
					<p className="text-sm text-muted-foreground mt-2">{events[activeIndex].desc}</p>
				</m.div>
			</CardContent>
		</Card>
	);
}

// ============================================================================
// CHEMISTRY PERIODIC TABLE MINI-REF
// ============================================================================

export function PeriodicTableMini() {
	const elements = [
		{ sym: 'H', name: 'Hydrogen', mass: '1.008', cat: 'reactive-nonmetal' },
		{ sym: 'He', name: 'Helium', mass: '4.002', cat: 'noble-gas' },
		{ sym: 'Li', name: 'Lithium', mass: '6.941', cat: 'alkali-metal' },
		{ sym: 'Be', name: 'Beryllium', mass: '9.012', cat: 'alkaline-earth' },
	];

	return (
		<Card className="shadow-tiimo border-border/50">
			<CardHeader className="bg-muted/30 pb-4">
				<CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
					<HugeiconsIcon icon={AtomIcon} className="w-4 h-4" />
					Element Quick-Ref
				</CardTitle>
			</CardHeader>
			<CardContent className="p-4 grid grid-cols-2 gap-3">
				{elements.map((el, i) => (
					<div key={i} className="p-3 bg-muted/50 rounded-xl border border-border/50 flex flex-col items-center group hover:bg-primary/10 transition-colors">
						<span className="text-2xl font-black text-foreground">{el.sym}</span>
						<span className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">{el.name}</span>
						<span className="text-[10px] font-bold text-primary mt-1">{el.mass}</span>
					</div>
				))}
			</CardContent>
		</Card>
	);
}
