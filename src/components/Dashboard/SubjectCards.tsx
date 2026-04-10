'use client';

import {
	ArrowUpRight01Icon as ArrowUpRight,
	Cancel01Icon,
	Analytics01Icon as ChartBar,
	Refresh01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { FluentEmoji } from '@lobehub/fluent-emoji';
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
	bgColor: string;
	emoji: string;
	topics: number;
	description: string;
}

const subjects: Subject[] = [
	{
		id: 'math',
		title: 'Mathematics',
		progress: 78,
		color: 'text-subject-math',
		bgColor: 'bg-subject-math-soft',
		emoji: '🧮',
		topics: 12,
		description: 'Calculus, Trigonometry, and Financial Maths.',
	},
	{
		id: 'physics',
		title: 'Physical Sciences',
		progress: 62,
		color: 'text-subject-physics',
		bgColor: 'bg-subject-physics-soft',
		emoji: '⚛️',
		topics: 15,
		description: 'Newtonian Mechanics, Electricity, and Chemistry.',
	},
	{
		id: 'lifesci',
		title: 'Life Sciences',
		progress: 85,
		color: 'text-subject-life',
		bgColor: 'bg-subject-life-soft',
		emoji: '🧬',
		topics: 10,
		description: 'DNA, Genetics, and Human Evolution.',
	},
	{
		id: 'accounting',
		title: 'Accounting',
		progress: 45,
		color: 'text-subject-accounting',
		bgColor: 'bg-subject-accounting-soft',
		emoji: '💰',
		topics: 8,
		description: 'Financial Statements and Cost Accounting.',
	},
];

export function SubjectCards() {
	const [selectedId, setSelectedId] = useState<string | null>(null);

	const selectedSubject = subjects.find((s) => s.id === selectedId);

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
			{subjects.map((subject) => (
				<m.div
					key={subject.id}
					layoutId={subject.id}
					onClick={() => setSelectedId(subject.id)}
					className="group cursor-pointer tiimo-press"
					whileTap={{ scale: 0.96 }}
				>
					<div className="h-full rounded-xl bg-card shadow-tiimo border border-border/50 overflow-hidden p-6 transition-all duration-300 hover:shadow-tiimo-lg hover:border-primary/20">
						<div className="flex flex-col h-full gap-4">
							<div className="flex justify-between items-start">
								<div
									className={`p-3 rounded-2xl ${subject.bgColor} flex items-center justify-center`}
								>
									<FluentEmoji type="3d" emoji={subject.emoji} size={32} />
								</div>
								<div className="p-2 rounded-full bg-tiimo-cream opacity-0 group-hover:opacity-100 transition-opacity">
									<HugeiconsIcon icon={ArrowUpRight} className="h-4 w-4 text-tiimo-gray-muted" />
								</div>
							</div>

							<div className="mt-2">
								<h3 className="text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
									{subject.title}
								</h3>
								<p className="text-sm text-tiimo-gray-muted mt-1 line-clamp-1">
									{subject.description}
								</p>
							</div>

							<div className="mt-auto space-y-3">
								<div className="flex justify-between items-center text-xs font-bold">
									<span className="text-tiimo-gray-muted  tracking-widest">
										{subject.topics} Topics
									</span>
									<span className="text-foreground">{subject.progress}%</span>
								</div>
								<Progress value={subject.progress} className="h-2 bg-secondary" />
							</div>
						</div>
					</div>
				</m.div>
			))}

			<AnimatePresence>
				{selectedId && selectedSubject && (
					<div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-12 pointer-events-none">
						<m.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="absolute inset-0 bg-background/80 backdrop-blur-xl pointer-events-auto"
							onClick={() => setSelectedId(null)}
						/>

						<m.div
							layoutId={selectedId}
							className="relative w-full max-w-2xl bg-card rounded-xl shadow-tiimo-lg overflow-hidden pointer-events-auto border border-border/50"
						>
							{/* Tiimo Vertical Strip in Modal */}
							<div className={cn('tiimo-timeline-strip w-3', selectedSubject.bgColor)} />

							<div className="p-8 sm:p-10 flex flex-col gap-8 pl-12">
								<div className="flex justify-between items-start">
									<div className="flex items-center gap-4">
										<div
											className={`p-4 rounded-2xl ${selectedSubject.bgColor} flex items-center justify-center`}
										>
											<FluentEmoji type="3d" emoji={selectedSubject.emoji} size={48} />
										</div>
										<div>
											<m.h2
												initial={{ opacity: 0, y: 10 }}
												animate={{ opacity: 1, y: 0 }}
												transition={{ delay: 0.1 }}
												className="text-3xl font-bold tracking-tighter text-foreground"
											>
												{selectedSubject.title}
											</m.h2>
											<m.p
												initial={{ opacity: 0, y: 10 }}
												animate={{ opacity: 1, y: 0 }}
												transition={{ delay: 0.15 }}
												className="text-tiimo-gray-muted font-medium"
											>
												{selectedSubject.topics} key topics for your exams
											</m.p>
										</div>
									</div>
									<Button
										variant="ghost"
										size="icon"
										className="rounded-full bg-secondary hover:bg-secondary/80"
										onClick={(e) => {
											e.stopPropagation();
											setSelectedId(null);
										}}
									>
										<HugeiconsIcon icon={Cancel01Icon} className="h-5 w-5 text-tiimo-gray-dark" />
									</Button>
								</div>

								<m.div
									initial={{ opacity: 0, scale: 0.95 }}
									animate={{ opacity: 1, scale: 1 }}
									transition={{ delay: 0.2 }}
									className="grid grid-cols-2 gap-4"
								>
									<Card className="p-6 rounded-md bg-secondary/50 border-none shadow-none">
										<div className="flex items-center gap-3 mb-2">
											<HugeiconsIcon icon={Refresh01Icon} className="h-5 w-5 text-tiimo-lavender" />
											<span className="text-[10px] font-black  tracking-widest text-tiimo-gray-muted">
												Last Study
											</span>
										</div>
										<p className="text-xl font-bold text-foreground">2 Days Ago</p>
									</Card>
									<Card className="p-6 rounded-md bg-secondary/50 border-none shadow-none">
										<div className="flex items-center gap-3 mb-2">
											<HugeiconsIcon icon={ChartBar} className="h-5 w-5 text-tiimo-green" />
											<span className="text-[10px] font-black  tracking-widest text-tiimo-gray-muted">
												Mastery
											</span>
										</div>
										<p className="text-xl font-bold text-foreground tabular-nums">
											{selectedSubject.progress}%
										</p>
									</Card>
								</m.div>

								<m.div
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.25 }}
									className="space-y-4"
								>
									<h4 className="text-lg font-bold">Recommended for You</h4>
									<div className="space-y-2">
										{[1, 2, 3].map((item) => (
											<div
												key={`subject-cards-topic-${item}`}
												className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 cursor-pointer transition-colors group"
											>
												<div className="flex items-center gap-3">
													<div className="h-2 w-2 rounded-full bg-primary" />
													<span className="font-medium">Active Topic {item}</span>
												</div>
												<HugeiconsIcon
													icon={ArrowUpRight}
													className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors"
												/>
											</div>
										))}
									</div>
								</m.div>

								<m.div
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.3 }}
									className="flex gap-4 mt-4"
								>
									<Button className="flex-1 h-14 rounded-2xl text-lg font-bold bg-primary hover:bg-primary/90">
										Resume Learning
									</Button>
									<Button variant="outline" className="h-14 w-14 rounded-2xl border-white/10">
										<HugeiconsIcon icon={BookOpen01Icon} className="h-6 w-6" />
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
