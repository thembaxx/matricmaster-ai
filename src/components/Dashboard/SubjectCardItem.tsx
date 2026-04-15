import { ArrowUpRight01Icon as ArrowUpRight } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { FluentEmoji } from '@lobehub/fluent-emoji';
import { m } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { Subject } from './SubjectCards';

interface SubjectCardItemProps {
	subject: Subject;
	onClick: () => void;
}

export function SubjectCardItem({ subject, onClick }: SubjectCardItemProps) {
	return (
		<m.div
			layoutId={subject.id}
			onClick={onClick}
			tabIndex={0}
			onKeyDown={(e) => {
				if (e.key === 'Enter') onClick();
			}}
			className="group cursor-pointer tiimo-press col-span-1 focus-visible:outline-none focus-[&:focus-visible]:ring-2 focus:ring-ring focus:ring-offset-2 rounded-2xl"
			whileTap={{ scale: 0.97 }}
		>
			<Card className="relative h-full rounded-2xl overflow-hidden border border-border/50 shadow-tiimo hover:shadow-tiimo-lg hover:border-border transition-all duration-300">
				{/* Top color accent bar */}
				<div className={cn('h-1 w-full', subject.bgColor.replace('soft', 'default'))} />

				<div className="p-5 flex flex-col h-full gap-4">
					<div className="flex justify-between items-start">
						<div className={`p-2.5 rounded-xl ${subject.bgColor} flex items-center justify-center`}>
							<FluentEmoji type="3d" emoji={subject.emoji} size={24} />
						</div>
						<div
							className={cn(
								'opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-1 group-hover:translate-x-0'
							)}
						>
							<HugeiconsIcon icon={ArrowUpRight} className="h-4 w-4 text-muted-foreground" />
						</div>
					</div>

					<div className="flex-1">
						<h3 className="text-base font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
							{subject.title}
						</h3>
						<p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
							{subject.description}
						</p>
					</div>

					<div className="space-y-2">
						<div className="flex justify-between items-center">
							<span className="text-[10.5px] font-medium text-muted-foreground lowercase">
								{subject.topics} topics
							</span>
							<span className="text-sm font-black text-foreground tabular-nums">
								{subject.progress}%
							</span>
						</div>
						<Progress value={subject.progress} className="h-1.5 bg-secondary" />
					</div>
				</div>

				{/* Hover indicator line at bottom */}
				<div
					className={cn(
						'absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-transparent to-transparent group-hover:w-full transition-all duration-500',
						subject.bgColor.replace('soft', 'default').replace('bg-', 'from-')
					)}
				/>
			</Card>
		</m.div>
	);
}
