'use client';

import {
	ArrowUpRight01Icon as ArrowUpRight,
	Atom01Icon as Atom,
	BookOpen01Icon as BookOpen,
	Calculator01Icon as Calculator,
	ChartBarLineIcon as ChartBar,
	RotateClockwiseIcon as ClockCounterClockwise,
	Cancel01Icon as X,
	ZapIcon as Zap,
} from 'hugeicons-react';
import { AnimatePresence, m } from 'framer-motion';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface Subject {
	id: string;
	title: string;
	progress: number;
	color: string;
	icon: React.ElementType;
	topics: number;
	description: string;
}

const subjects: Subject[] = [
	{
		id: 'math',
		title: 'Mathematics',
		progress: 78,
		color: 'bg-math',
		icon: Calculator,
		topics: 12,
		description: 'Calculus, Trigonometry, and Financial Maths.',
	},
	{
		id: 'physics',
		title: 'Physical Sciences',
		progress: 62,
		color: 'bg-physics',
		icon: Atom,
		topics: 15,
		description: 'Newtonian Mechanics, Electricity, and Chemistry.',
	},
	{
		id: 'lifesci',
		title: 'Life Sciences',
		progress: 85,
		color: 'bg-life-sci',
		icon: BookOpen,
		topics: 10,
		description: 'DNA, Genetics, and Human Evolution.',
	},
	{
		id: 'accounting',
		title: 'Accounting',
		progress: 45,
		color: 'bg-accounting',
		icon: ChartBar,
		topics: 8,
		description: 'Financial Statements and Cost Accounting.',
	},
];

export function SubjectCards() {
	const [selectedId, setSelectedId] = useState<string | null>(null);

	const selectedSubject = subjects.find((s) => s.id === selectedId);

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 relative">
			{subjects.map((subject) => (
				<m.div
					key={subject.id}
					layoutId={subject.id}
					onClick={() => setSelectedId(subject.id)}
					className="group cursor-pointer"
					whileHover={{ y: -8, scale: 1.02 }}
					whileTap={{ scale: 0.98 }}
				>
					<Card className="h-full rounded-[3.5rem] border-none bg-card shadow-[0_20px_60px_rgba(0,0,0,0.06)] overflow-hidden p-8 transition-all duration-500 hover:shadow-[0_40px_100px_rgba(0,0,0,0.1)]">
						<div className="flex flex-col h-full gap-8">
							<div className="flex justify-between items-start">
								<div className={cn("p-4 rounded-[1.5rem] shadow-xl", subject.color)}>
									<subject.icon size={32} className="text-white stroke-[3px] fill-white/20" />
								</div>
								<div className="p-3 rounded-2xl bg-muted/10 opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:rotate-12">
									<ArrowUpRight size={20} className="text-muted-foreground stroke-[3px]" />
								</div>
							</div>

							<div className="space-y-2">
								<h3 className="text-3xl font-black tracking-tight text-foreground group-hover:text-primary transition-colors leading-none">
									{subject.title}
								</h3>
								<p className="text-sm font-bold text-muted-foreground/60 line-clamp-2 leading-relaxed">
									{subject.description}
								</p>
							</div>

							<div className="mt-auto space-y-4">
								<div className="flex justify-between items-end">
									<div className="space-y-1">
										<span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] block">
											Progress
										</span>
										<span className="text-2xl font-black text-foreground leading-none">{subject.progress}%</span>
									</div>
									<span className="text-[10px] font-black text-primary uppercase tracking-widest">{subject.topics} Topics</span>
								</div>
								<div className="h-4 w-full bg-muted/20 rounded-full overflow-hidden p-1 shadow-inner">
									<m.div
										initial={{ width: 0 }}
										animate={{ width: `${subject.progress}%` }}
										transition={{ duration: 1.5, type: 'spring' }}
										className={cn("h-full rounded-full shadow-lg", subject.color.replace('bg-', 'bg-'))}
									/>
								</div>
							</div>
						</div>
					</Card>
				</m.div>
			))}

			<AnimatePresence>
				{selectedId && selectedSubject && (
					<div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-12 pointer-events-none">
						<m.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="absolute inset-0 bg-white/60 dark:bg-zinc-950/80 backdrop-blur-3xl pointer-events-auto"
							onClick={() => setSelectedId(null)}
						/>

						<m.div
							layoutId={selectedId}
							className="relative w-full max-w-3xl bg-card rounded-[4rem] shadow-[0_50px_150px_rgba(0,0,0,0.15)] overflow-hidden pointer-events-auto border-none transition-all duration-700"
						>
							<div className="p-10 sm:p-16 flex flex-col gap-12">
								<div className="flex justify-between items-start">
									<div className="flex items-center gap-8">
										<div className={cn("p-6 rounded-[2rem] shadow-2xl scale-125", selectedSubject.color)}>
											<selectedSubject.icon size={48} className="text-white stroke-[3px] fill-white/20" />
										</div>
										<div className="space-y-2">
											<m.h2
												initial={{ opacity: 0, x: -20 }}
												animate={{ opacity: 1, x: 0 }}
												transition={{ delay: 0.1 }}
												className="text-5xl font-black tracking-tighter text-foreground leading-none"
											>
												{selectedSubject.title}
											</m.h2>
											<m.p
												initial={{ opacity: 0, x: -20 }}
												animate={{ opacity: 1, x: 0 }}
												transition={{ delay: 0.15 }}
												className="text-lg font-bold text-muted-foreground/60 uppercase tracking-widest"
											>
												{selectedSubject.topics} core curriculum topics
											</m.p>
										</div>
									</div>
									<Button
										variant="ghost"
										size="icon"
										className="h-14 w-14 rounded-2xl bg-muted/10 hover:bg-tiimo-pink hover:text-white transition-all shadow-sm"
										onClick={(e) => {
											e.stopPropagation();
											setSelectedId(null);
										}}
									>
										<X size={28} className="stroke-[3px]" />
									</Button>
								</div>

								<m.div
									initial={{ opacity: 0, y: 30 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.2 }}
									className="grid grid-cols-2 gap-8"
								>
									<Card className="p-8 rounded-[2.5rem] bg-muted/5 border-none shadow-inner">
										<div className="flex items-center gap-4 mb-4">
											<div className="h-10 w-10 rounded-xl bg-tiimo-blue/20 flex items-center justify-center">
												<ClockCounterClockwise size={20} className="text-tiimo-blue stroke-[3px]" />
											</div>
											<span className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/40">Last session</span>
										</div>
										<p className="text-3xl font-black text-foreground tracking-tight">2 days ago</p>
									</Card>
									<Card className="p-8 rounded-[2.5rem] bg-muted/5 border-none shadow-inner">
										<div className="flex items-center gap-4 mb-4">
											<div className="h-10 w-10 rounded-xl bg-tiimo-green/20 flex items-center justify-center">
												<ChartBar size={20} className="text-tiimo-green stroke-[3px]" />
											</div>
											<span className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/40">Mastery level</span>
										</div>
										<p className="text-3xl font-black text-foreground tracking-tight">{selectedSubject.progress}%</p>
									</Card>
								</m.div>

								<m.div
									initial={{ opacity: 0, y: 30 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.3 }}
									className="space-y-6"
								>
									<div className="flex items-center gap-4 px-2">
										<h4 className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-[0.4em]">Next steps</h4>
										<div className="h-px flex-1 bg-muted/10" />
									</div>
									<div className="grid grid-cols-1 gap-4">
										{[1, 2].map((i) => (
											<m.div
												key={i}
												whileHover={{ x: 12 }}
												className="flex items-center justify-between p-6 rounded-[2rem] bg-white dark:bg-zinc-900 shadow-sm border-none cursor-pointer group/item transition-all"
											>
												<div className="flex items-center gap-6">
													<div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover/item:bg-primary group-hover/item:text-white transition-all duration-500">
														<Zap size={24} className="stroke-[3px]" />
													</div>
													<span className="text-lg font-black text-foreground uppercase tracking-tight">Active Topic Module {i}</span>
												</div>
												<ArrowUpRight size={24} className="text-muted-foreground/20 group-hover/item:text-primary transition-colors" />
											</m.div>
										))}
									</div>
								</m.div>

								<m.div
									initial={{ opacity: 0, y: 30 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.4 }}
									className="flex gap-6 pt-4"
								>
									<Button className="flex-1 h-20 rounded-[2.25rem] bg-primary hover:bg-primary/90 text-white text-2xl font-black shadow-[0_20px_50px_rgba(var(--primary),0.3)] transition-all active:scale-95">
										Start session
									</Button>
									<Button variant="ghost" className="h-20 w-20 rounded-[2.25rem] bg-muted/10 hover:bg-muted/20 border-none transition-all">
										<BookOpen size={32} className="stroke-[3px] text-muted-foreground" />
									</Button>
								</m.div>
							</div>
						</m.div>
					</div>
				)}
			</AnimatePresence>
		</div>
	);
}
