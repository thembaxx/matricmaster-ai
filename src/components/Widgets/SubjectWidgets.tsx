'use client';

import { FluentEmoji } from '@lobehub/fluent-emoji';
import { m } from 'framer-motion';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function MathWidget() {
	return (
		<Card className="rounded-[2rem] border-border/50 shadow-tiimo overflow-hidden bg-tiimo-lavender/5 group">
			<CardHeader className="p-6 pb-0">
				<CardTitle className="text-xs font-black uppercase tracking-widest text-tiimo-gray-muted flex items-center gap-2">
					<FluentEmoji emoji="Abacus" size={16} className="w-4 h-4 text-tiimo-lavender" />
					Quick Solve
				</CardTitle>
			</CardHeader>
			<CardContent className="p-6">
				<div className="space-y-4">
					<div className="h-12 bg-card rounded-xl border border-border/50 flex items-center px-4 font-mono text-sm text-tiimo-gray-muted">
						2x + 5 = 15
					</div>
					<Button
						type="button"
						className="w-full h-12 bg-tiimo-lavender text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-tiimo-lavender/20"
					>
						Show Steps
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}

export function ScienceWidget() {
	return (
		<Card className="rounded-[2rem] border-border/50 shadow-tiimo overflow-hidden bg-tiimo-blue/5">
			<CardHeader className="p-6 pb-0">
				<CardTitle className="text-xs font-black uppercase tracking-widest text-tiimo-gray-muted flex items-center gap-2">
					<FluentEmoji emoji="Atom" size={16} className="w-4 h-4 text-tiimo-blue" />
					Element Facts
				</CardTitle>
			</CardHeader>
			<CardContent className="p-6">
				<div className="flex gap-4 items-center">
					<div className="w-16 h-16 bg-tiimo-blue text-white rounded-2xl flex flex-col items-center justify-center font-black">
						<span className="text-2xl leading-none">H</span>
						<span className="text-[8px] tracking-tighter">1.008</span>
					</div>
					<div>
						<h4 className="font-black text-sm uppercase">Hydrogen</h4>
						<p className="text-[10px] font-bold text-tiimo-gray-muted uppercase tracking-widest">
							Most abundant element
						</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

export function HistoryScrubber() {
	const [activeIndex, setActiveIndex] = useState(0);
	const events = [
		{ year: '1910', title: 'Union of SA' },
		{ year: '1948', title: 'Apartheid Begins' },
		{ year: '1976', title: 'Soweto Uprising' },
		{ year: '1994', title: 'Democracy' },
	];

	return (
		<Card className="rounded-[2rem] border-border/50 shadow-tiimo overflow-hidden bg-tiimo-orange/5">
			<CardHeader className="p-6 pb-0">
				<CardTitle className="text-xs font-black uppercase tracking-widest text-tiimo-gray-muted">
					SA History Scrubber
				</CardTitle>
			</CardHeader>
			<CardContent className="p-6">
				<div className="relative h-2 bg-muted rounded-full mb-8 mt-4">
					<div className="absolute inset-0 flex justify-between px-2 -top-2">
						{events.map((_, i) => (
							<Button
								key={events[i].year}
								type="button"
								variant="ghost"
								size="icon"
								onClick={() => setActiveIndex(i)}
								className={cn(
									'w-6 h-6 rounded-full border-4 border-card transition-all',
									i <= activeIndex ? 'bg-primary scale-110' : 'bg-muted-foreground/30'
								)}
							/>
						))}
					</div>
				</div>
				<m.div
					key={activeIndex}
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					className="space-y-1"
				>
					<span className="text-primary font-black text-lg">{events[activeIndex].year}</span>
					<h4 className="font-black text-sm uppercase tracking-tight">
						{events[activeIndex].title}
					</h4>
				</m.div>
			</CardContent>
		</Card>
	);
}
