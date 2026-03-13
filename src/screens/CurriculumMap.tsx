'use client';

import { ArrowLeft01Icon, BookOpen01Icon, StarIcon, Tick01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

const SYLLABUS = [
	{
		subject: 'Mathematics',
		color: 'bg-subject-math',
		topics: [
			{ id: 'm1', name: 'Sequences & Series', status: 'mastered' },
			{ id: 'm2', name: 'Functions & Inverses', status: 'mastered' },
			{ id: 'm3', name: 'Differential Calculus', status: 'in-progress' },
			{ id: 'm4', name: 'Probability', status: 'not-started' },
			{ id: 'm5', name: 'Trigonometry', status: 'not-started' },
		],
	},
	{
		subject: 'Physical Sciences',
		color: 'bg-subject-physics',
		topics: [
			{ id: 'p1', name: 'Momentum & Impulse', status: 'mastered' },
			{ id: 'p2', name: 'Projectile Motion', status: 'in-progress' },
			{ id: 'p3', name: 'Work, Energy & Power', status: 'not-started' },
			{ id: 'p4', name: 'Doppler Effect', status: 'not-started' },
			{ id: 'p5', name: 'Chemical Equilibrium', status: 'not-started' },
		],
	},
];

export default function CurriculumMap() {
	const router = useRouter();

	return (
		<div className="flex flex-col h-full bg-background min-w-0">
			<header className="px-6 pt-12 pb-6 flex items-center justify-between shrink-0 max-w-4xl mx-auto w-full">
				<Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
					<HugeiconsIcon icon={ArrowLeft01Icon} className="w-6 h-6" />
				</Button>
				<h1 className="text-xl font-semibold">Curriculum map (CAPS)</h1>
				<div className="w-10" />
			</header>

			<ScrollArea className="flex-1">
				<main className="px-6 py-4 pb-32 max-w-4xl mx-auto w-full space-y-12">
					{SYLLABUS.map((subj, sIdx) => (
						<div key={subj.subject} className="space-y-6">
							<div className="flex items-center gap-3">
								<div
									className={cn(
										'w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg',
										subj.color
									)}
								>
									<HugeiconsIcon icon={BookOpen01Icon} className="w-5 h-5" />
								</div>
								<h2 className="text-2xl font-black uppercase tracking-tight">{subj.subject}</h2>
							</div>

							<div className="relative pl-12 space-y-8">
								{/* Connector Line */}
								<div className="absolute left-[1.2rem] top-2 bottom-8 w-1 bg-muted rounded-full" />

								{subj.topics.map((topic, tIdx) => (
									<m.div
										key={topic.id}
										initial={{ opacity: 0, x: -20 }}
										animate={{ opacity: 1, x: 0 }}
										transition={{ delay: (sIdx * 5 + tIdx) * 0.1 }}
										className="relative"
									>
										{/* Step Circle */}
										<div
											className={cn(
												'absolute -left-[2.1rem] top-1 w-8 h-8 rounded-full border-4 border-background flex items-center justify-center z-10 shadow-sm',
												topic.status === 'mastered'
													? subj.color
													: topic.status === 'in-progress'
														? 'bg-muted border-primary'
														: 'bg-muted border-muted-foreground/20'
											)}
										>
											{topic.status === 'mastered' && (
												<HugeiconsIcon icon={Tick01Icon} className="w-3 h-3 text-white" />
											)}
											{topic.status === 'in-progress' && (
												<div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
											)}
										</div>

										<Card
											className={cn(
												'p-6 rounded-[2rem] border border-border/50 shadow-tiimo transition-all group hover:shadow-tiimo-lg',
												topic.status === 'mastered' ? 'bg-card' : 'bg-card/50 opacity-80'
											)}
										>
											<div className="flex items-center justify-between">
												<div>
													<h3 className="font-black uppercase text-sm tracking-tight">
														{topic.name}
													</h3>
													<p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
														{topic.status === 'mastered'
															? 'Mastered • 100%'
															: topic.status === 'in-progress'
																? 'In Progress • 45%'
																: 'Locked'}
													</p>
												</div>
												{topic.status === 'mastered' && (
													<div className="flex items-center gap-1 text-warning">
														<HugeiconsIcon icon={StarIcon} className="w-4 h-4 fill-current" />
														<span className="text-[10px] font-black uppercase">Gold</span>
													</div>
												)}
												{topic.status !== 'not-started' && (
													<Button
														size="sm"
														className="rounded-full font-black uppercase text-[10px] px-4"
													>
														{topic.status === 'mastered' ? 'Review' : 'Continue'}
													</Button>
												)}
											</div>
										</Card>
									</m.div>
								))}
							</div>
						</div>
					))}
				</main>
			</ScrollArea>
		</div>
	);
}
