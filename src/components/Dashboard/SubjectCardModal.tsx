import {
	ArrowUpRight01Icon as ArrowUpRight,
	BookOpen01Icon,
	Cancel01Icon,
	Analytics01Icon as ChartBar,
	Refresh01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { FluentEmoji } from '@lobehub/fluent-emoji';
import { m } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Subject } from './SubjectCards';

interface SubjectCardModalProps {
	subject: Subject;
	onClose: () => void;
}

export function SubjectCardModal({ subject, onClose }: SubjectCardModalProps) {
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-12 pointer-events-none">
			<m.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				className="absolute inset-0 bg-background/80 backdrop-blur-xl pointer-events-auto"
				onClick={onClose}
			/>

			<m.div
				layoutId={subject.id}
				className="relative w-full max-w-2xl bg-card rounded-2xl shadow-tiimo-xl overflow-hidden pointer-events-auto border border-border/50"
			>
				{/* Left color strip */}
				<div
					className={cn(
						'absolute left-0 top-0 bottom-0 w-2',
						subject.bgColor.replace('soft', 'default')
					)}
				/>

				<div className="p-8 sm:p-10 flex flex-col gap-8 pl-10">
					<div className="flex justify-between items-start">
						<div className="flex items-center gap-4">
							<div
								className={`p-4 rounded-2xl ${subject.bgColor} flex items-center justify-center`}
							>
								<FluentEmoji type="3d" emoji={subject.emoji} size={48} />
							</div>
							<div>
								<m.h2
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.1 }}
									className="text-3xl font-black tracking-tighter text-foreground"
								>
									{subject.title}
								</m.h2>
								<m.p
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.15 }}
									className="text-sm text-muted-foreground font-medium lowercase"
								>
									{subject.topics} key topics for your exams
								</m.p>
							</div>
						</div>
						<Button
							variant="ghost"
							size="icon"
							className="rounded-full bg-secondary hover:bg-secondary/80"
							onClick={(e) => {
								e.stopPropagation();
								onClose();
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
						<Card className="p-5 rounded-xl bg-secondary/50 border-none shadow-none">
							<div className="flex items-center gap-3 mb-3">
								<HugeiconsIcon icon={Refresh01Icon} className="h-4 w-4 text-primary" />
								<span className="text-[10.5px] font-semibold lowercase text-muted-foreground">
									Last Study
								</span>
							</div>
							<p className="text-2xl font-black text-foreground">2 Days Ago</p>
						</Card>
						<Card className="p-5 rounded-xl bg-secondary/50 border-none shadow-none">
							<div className="flex items-center gap-3 mb-3">
								<HugeiconsIcon icon={ChartBar} className="h-4 w-4 text-tiimo-green" />
								<span className="text-[10.5px] font-semibold lowercase text-muted-foreground">
									Mastery
								</span>
							</div>
							<p className="text-2xl font-black text-foreground tabular-nums">
								{subject.progress}%
							</p>
						</Card>
					</m.div>

					<m.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.25 }}
						className="space-y-4"
					>
						<h4 className="text-base font-bold">Recommended for You</h4>
						<div className="space-y-2">
							{[1, 2, 3].map((item) => (
								<div
									key={`subject-cards-topic-${item}`}
									className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 cursor-pointer transition-colors group"
								>
									<div className="flex items-center gap-3">
										<div className="h-1.5 w-1.5 rounded-full bg-primary" />
										<span className="text-sm font-medium">Active Topic {item}</span>
									</div>
									<HugeiconsIcon
										icon={ArrowUpRight}
										className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors"
									/>
								</div>
							))}
						</div>
					</m.div>

					<m.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3 }}
						className="flex gap-3 mt-2"
					>
						<Button className="flex-1 h-12 rounded-xl text-sm font-bold bg-primary hover:bg-primary/90">
							Resume Learning
						</Button>
						<Button variant="outline" className="h-12 w-12 rounded-xl border-border/50">
							<HugeiconsIcon icon={BookOpen01Icon} className="h-5 w-5" />
						</Button>
					</m.div>
				</div>
			</m.div>
		</div>
	);
}
