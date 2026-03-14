'use client';

import { m } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { SUBJECTS } from '@/constants/subjects';
import { cn } from '@/lib/utils';

interface TimelineEvent {
	id: string;
	time: string;
	subject: string;
	title: string;
	duration: string;
	status: 'completed' | 'current' | 'upcoming';
	emoji: string;
}

const DEMO_EVENTS: TimelineEvent[] = [
	{
		id: '1',
		time: '08:00',
		subject: 'mathematics',
		title: 'Calculus review',
		duration: '45 min',
		status: 'completed',
		emoji: SUBJECTS.mathematics.emoji,
	},
	{
		id: '2',
		time: '09:00',
		subject: 'physics',
		title: 'Circuit problems',
		duration: '30 min',
		status: 'current',
		emoji: SUBJECTS.physics.emoji,
	},
	{
		id: '3',
		time: '10:00',
		subject: 'english',
		title: 'Essay planning',
		duration: '60 min',
		status: 'upcoming',
		emoji: '📖',
	},
	{
		id: '4',
		time: '11:30',
		subject: 'Life Sciences',
		title: 'Cell structures',
		duration: '45 min',
		status: 'upcoming',
		emoji: '🧬',
	},
	{
		id: '5',
		time: '13:00',
		subject: 'Break',
		title: 'Lunch',
		duration: '30 min',
		status: 'upcoming',
		emoji: '🥪',
	},
];

export function TimelineSidebar() {
	const today = new Date().toLocaleDateString('en-US', {
		weekday: 'long',
		month: 'short',
		day: 'numeric',
	});

	return (
		<aside className="fixed left-0 top-0 h-screen w-72 bg-background-elevated border-r border-border hidden lg:flex flex-col z-20">
			{/* Header */}
			<div className="p-6 border-b border-border">
				{/* Date Selector */}
				<div className="flex items-center gap-2">
					<Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
						<span className="text-lg">‹</span>
					</Button>
					<div className="flex-1 text-center">
						<p className="text-sm font-semibold text-foreground">{today}</p>
					</div>
					<Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
						<span className="text-lg">›</span>
					</Button>
				</div>
			</div>

			{/* Timeline */}
			<div className="flex-1 overflow-y-auto p-4 space-y-1">
				<p className="text-xs font-medium text-muted-foreground mb-4 px-2">Your day</p>

				<div className="relative">
					{/* Timeline Line */}
					<div className="absolute left-[26px] top-2 bottom-2 w-0.5 bg-border" />

					{/* Events */}
					{DEMO_EVENTS.map((event, index) => (
						<TimelineEventCard key={event.id} event={event} index={index} />
					))}
				</div>
			</div>

			{/* Stats */}
			<div className="p-4 border-t border-border">
				<div className="bg-primary-soft rounded-lg p-4">
					<p className="text-[10px] text-muted-foreground mb-1">Progress today</p>
					<div className="flex items-end gap-2">
						<span className="text-sm font-display font-bold text-primary">2</span>
						<span className="text-xs text-muted-foreground mb-px">/ 5 done</span>
					</div>
					<div className="mt-2 h-1.5 bg-border rounded-full overflow-hidden">
						<div className="h-full w-[40%] bg-primary rounded-full" />
					</div>
				</div>
			</div>
		</aside>
	);
}

function TimelineEventCard({ event, index }: { event: TimelineEvent; index: number }) {
	const statusStyles = {
		completed: 'bg-success-soft border-success/30',
		current: 'bg-primary-soft border-primary shadow-md',
		upcoming: 'bg-card border-border',
	};

	const dotStyles = {
		completed: 'bg-success',
		current: 'bg-primary ring-4 ring-primary-soft/10 animate-pulse',
		upcoming: 'bg-border',
	};

	return (
		<m.div
			initial={{ opacity: 0, x: -20 }}
			animate={{ opacity: 1, x: 0 }}
			transition={{ delay: index * 0.1, duration: 0.4 }}
			className="relative rounded-xl overflow-hidden border mb-2 "
		>
			<m.div
				initial={{ opacity: 0, x: -20 }}
				animate={{ opacity: 1, x: 0 }}
				transition={{ delay: index * 0.1, duration: 0.4 }}
				className={cn(
					'relative flex items-start gap-3 p-3 rounded-xl cursor-pointer tiimo-press relative z-2',
					statusStyles[event.status]
				)}
			>
				{/* Timeline Dot */}
				<div className="relative flex-shrink-0 pt-1">
					<div className={cn('w-3 h-3 rounded-full', dotStyles[event.status])} />
				</div>

				{/* Content */}
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2 mb-0.5 text-[10px] font-mono text-muted-foreground">
						<span>{event.time}</span>
						<span>•</span>
						<span>{event.duration}</span>
					</div>
					<p className="text-[13px] font-semibold text-foreground truncate">{event.title}</p>
				</div>

				{/* Emoji */}
				<div className="flex-shrink-0 w-8 h-8 rounded-full bg-background flex items-center justify-center text-lg shadow-sm">
					{event.emoji}
				</div>
			</m.div>

			<div className="absolute h-full w-full left-0 top-0 bg-white/90 backdrop-blur-2xl" />
		</m.div>
	);
}
