'use client';

import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { AnimatePresence, m } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

const ELEMENTS = [
	{ num: 1, sym: 'H', name: 'Hydrogen', mass: '1.008', group: 'nonmetal' },
	{ num: 2, sym: 'He', name: 'Helium', mass: '4.002', group: 'noble' },
	{ num: 3, sym: 'Li', name: 'Lithium', mass: '6.941', group: 'alkali' },
	{ num: 4, sym: 'Be', name: 'Beryllium', mass: '9.012', group: 'alkaline' },
	{ num: 5, sym: 'B', name: 'Boron', mass: '10.81', group: 'metalloid' },
	{ num: 6, sym: 'C', name: 'Carbon', mass: '12.01', group: 'nonmetal' },
	{ num: 7, sym: 'N', name: 'Nitrogen', mass: '14.01', group: 'nonmetal' },
	{ num: 8, sym: 'O', name: 'Oxygen', mass: '16.00', group: 'nonmetal' },
	{ num: 9, sym: 'F', name: 'Fluorine', mass: '19.00', group: 'halogen' },
	{ num: 10, sym: 'Ne', name: 'Neon', mass: '20.18', group: 'noble' },
];

const GROUP_COLORS: Record<string, string> = {
	nonmetal: 'bg-primary-violet/20 border-primary-violet/30 text-primary-violet',
	noble: 'bg-accent-blue/20 border-accent-blue/30 text-accent-blue',
	alkali: 'bg-primary-orange/20 border-primary-orange/30 text-primary-orange',
	alkaline: 'bg-tiimo-yellow/20 border-tiimo-yellow/30 text-tiimo-yellow',
	metalloid: 'bg-tiimo-green/20 border-tiimo-green/30 text-tiimo-green',
	halogen: 'bg-destructive/20 border-destructive/30 text-destructive',
};

export default function PeriodicTable() {
	const router = useRouter();
	type ElementType = (typeof ELEMENTS)[number];
	const [selectedElement, setSelectedElement] = useState<ElementType | null>(null);

	return (
		<div className="flex flex-col h-full bg-background min-w-0">
			<header className="px-6 pt-12 pb-6 flex items-center justify-between shrink-0 max-w-6xl mx-auto w-full">
				<Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
					<HugeiconsIcon icon={ArrowLeft01Icon} className="w-6 h-6" />
				</Button>
				<h1 className="text-xl font-black uppercase tracking-tight">Interactive Periodic Table</h1>
				<div className="w-10" />
			</header>

			<ScrollArea className="flex-1">
				<main className="px-6 py-4 flex flex-col items-center pb-32 max-w-6xl mx-auto w-full gap-8">
					<div className="grid grid-cols-2 sm:grid-cols-5 gap-3 w-full">
						{ELEMENTS.map((el, i) => (
							<m.button
								key={el.num}
								initial={{ opacity: 0, scale: 0.9 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ delay: i * 0.03 }}
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								onClick={() => setSelectedElement(el)}
								className={cn(
									'aspect-square rounded-[2rem] border-2 flex flex-col items-center justify-center p-4 transition-all shadow-tiimo bg-card',
									selectedElement?.num === el.num
										? 'ring-4 ring-primary border-primary shadow-primary/20'
										: GROUP_COLORS[el.group]
								)}
							>
								<span className="text-xs font-black self-start -mt-2 ml-1 opacity-60">
									{el.num}
								</span>
								<span className="text-3xl font-black">{el.sym}</span>
								<span className="text-[8px] font-black uppercase tracking-widest truncate w-full text-center">
									{el.name}
								</span>
							</m.button>
						))}
					</div>

					<AnimatePresence>
						{selectedElement && (
							<m.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: 20 }}
								className="w-full"
							>
								<Card className="rounded-[3rem] p-10 border-2 border-primary/20 shadow-2xl bg-card overflow-hidden relative">
									<div className="flex flex-col sm:flex-row gap-10 items-center">
										<div
											className={cn(
												'w-48 h-48 rounded-[2.5rem] border-4 flex flex-col items-center justify-center relative',
												GROUP_COLORS[selectedElement.group]
											)}
										>
											<span className="text-2xl font-black absolute top-4 left-6">
												{selectedElement.num}
											</span>
											<span className="text-7xl font-black">{selectedElement.sym}</span>
											<span className="text-sm font-black uppercase tracking-widest mt-2">
												{selectedElement.name}
											</span>
										</div>
										<div className="flex-1 space-y-6">
											<div>
												<h3 className="text-3xl font-black text-foreground uppercase tracking-tight">
													{selectedElement.name}
												</h3>
												<p className="text-muted-foreground font-bold uppercase text-xs tracking-widest mt-1">
													Classification: {selectedElement.group}
												</p>
											</div>
											<div className="grid grid-cols-2 gap-4">
												<div className="p-4 bg-muted/50 rounded-2xl border border-border/50">
													<p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">
														Atomic Mass
													</p>
													<p className="text-xl font-black">{selectedElement.mass} u</p>
												</div>
												<div className="p-4 bg-muted/50 rounded-2xl border border-border/50">
													<p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">
														Valence Electrons
													</p>
													<p className="text-xl font-black">{selectedElement.num % 8 || 8}</p>
												</div>
											</div>
											<Button className="w-full h-14 rounded-full font-black uppercase text-xs tracking-widest gap-2 shadow-xl shadow-primary/20">
												Explore Exam Questions
											</Button>
										</div>
									</div>
									<div className="absolute -bottom-10 -right-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
								</Card>
							</m.div>
						)}
					</AnimatePresence>
				</main>
			</ScrollArea>
		</div>
	);
}
