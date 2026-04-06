'use client';

import { ArrowLeft01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useQuery } from '@tanstack/react-query';
import { m } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { SUBJECTS } from '@/content';
import { authClient } from '@/lib/auth-client';
import { getTodayTimelineEventsAction } from '@/lib/db/actions';
import { cn } from '@/lib/utils';

interface TimelineEvent {
	id: string;
	time: string;
	subject: string;
	title: string;
	duration: string;
	status: 'completed' | 'current' | 'upcoming';
	emoji: string;
	navigationHref?: string;
}

const DEMO_EVENTS: TimelineEvent[] = [
	{
		id: '1',
		time: '08:00',
		subject: 'mathematics',
		title: 'calculus review',
		duration: '45 min',
		status: 'completed',
		emoji: SUBJECTS.mathematics.emoji,
		navigationHref: '/focus?subject=mathematics',
	},
	{
		id: '2',
		time: '09:00',
		subject: 'physics',
		title: 'circuit problems',
		duration: '30 min',
		status: 'current',
		emoji: SUBJECTS.physics.emoji,
		navigationHref: '/quiz?subject=physics',
	},
	{
		id: '3',
		time: '10:00',
		subject: 'english',
		title: 'essay planning',
		duration: '60 min',
		status: 'upcoming',
		emoji: SUBJECTS.english.emoji,
		navigationHref: '/ai-tutor?subject=english',
	},
	{
		id: '4',
		time: '11:30',
		subject: 'life-sciences',
		title: 'cell structures',
		duration: '45 min',
		status: 'upcoming',
		emoji: SUBJECTS['life-sciences'].emoji,
		navigationHref: '/flashcards?subject=life-sciences',
	},
	{
		id: '5',
		time: '13:00',
		subject: 'break',
		title: 'lunch',
		duration: '30 min',
		status: 'upcoming',
		emoji: '🥪',
		navigationHref: undefined,
	},
];

export function TimelineSidebar() {
	const router = useRouter();
	const { data: session } = authClient.useSession();
	const { data: eventsData, isLoading } = useQuery({
		queryKey: ['timelineEvents'],
		queryFn: () => getTodayTimelineEventsAction(),
	});

	const events = useMemo(() => {
		if (!eventsData || eventsData.events.length === 0) return DEMO_EVENTS;
		return eventsData.events.map(
			(e: {
				id: string;
				time: string;
				subject: string;
				title: string;
				duration: string;
				status: 'completed' | 'current' | 'upcoming';
				emoji: string;
				navigationHref?: string;
			}) => ({
				id: e.id,
				time: e.time,
				subject: e.subject,
				title: e.title,
				duration: e.duration,
				status: e.status,
				emoji: e.emoji,
				navigationHref: e.navigationHref,
			})
		);
	}, [eventsData]);
	const [selectedDate, setSelectedDate] = useState(new Date());

	const today = selectedDate.toLocaleDateString('en-US', {
		weekday: 'long',
		month: 'short',
		day: 'numeric',
	});

	const handlePrevDay = () => {
		setSelectedDate((prev) => new Date(prev.getTime() - 24 * 60 * 60 * 1000));
	};

	const handleNextDay = () => {
		setSelectedDate((prev) => new Date(prev.getTime() + 24 * 60 * 60 * 1000));
	};

	const handleEventClick = (event: TimelineEvent) => {
		if (event.navigationHref) {
			router.push(event.navigationHref);
		}
	};

	const completedCount = events.filter((e) => e.status === 'completed').length;
	const totalCount = events.filter((e) => e.navigationHref).length;
	const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

	const isToday = selectedDate.toDateString() === new Date().toDateString();

	return (
		<aside className="fixed left-0 top-0 h-screen w-full max-w-72 bg-background-elevated border-r border-border hidden lg:flex flex-col z-20">
			{/* Header */}
			<div className="p-3 rounded-l-lg bg-card">
				{/* Date Selector */}
				<div className="flex items-center gap-2">
					<m.div whileTap={{ scale: 0.9 }}>
						<Button
							variant="ghost"
							size="icon"
							className="rounded-full h-8 w-8"
							onClick={handlePrevDay}
						>
							<HugeiconsIcon icon={ArrowLeft01Icon} className="h-5 w-5" />
						</Button>
					</m.div>
					<div className="flex-1 text-center flex items-center gap-2 justify-center">
						<p className="text-xs font-semibold text-foreground">{today.toLowerCase()}</p>
						{isToday && session && (
							<span className="text-[10px] text-primary font-medium">today</span>
						)}
					</div>
					<m.div whileTap={{ scale: 0.9 }}>
						<Button
							variant="ghost"
							size="icon"
							className="rounded-full h-8 w-8"
							onClick={handleNextDay}
						>
							<HugeiconsIcon icon={ArrowRight01Icon} className="h-5 w-5" />
						</Button>
					</m.div>
				</div>
			</div>

			{/* Timeline */}
			<div className="flex-1 overflow-y-auto p-4 space-y-3">
				<p className="text-xs font-medium text-muted-foreground mb-2 px-2">your day</p>

				<div className="relative space-y-4">
					{/* Timeline Line */}
					<div className="absolute left-[26px] top-2 bottom-2 w-0.5 bg-border" />

					{/* Events */}
					{isLoading ? (
						<div className="space-y-2">
							{[1, 2, 3, 4].map((item: number) => (
								<div
									key={`timeline-skeleton-${item}`}
									className="flex items-start gap-3 p-3 rounded-xl bg-card border border-border animate-pulse"
								>
									<div className="w-3 h-3 rounded-full bg-muted" />
									<div className="flex-1 space-y-2">
										<div className="h-3 w-16 bg-muted rounded" />
										<div className="h-4 w-full bg-muted rounded" />
									</div>
								</div>
							))}
						</div>
					) : events.length === 0 ? (
						<div className="text-center py-8">
							<div className="text-4xl mb-2">📅</div>
							<p className="text-sm text-muted-foreground mb-3">no events scheduled</p>
							<Button
								variant="outline"
								size="sm"
								className="rounded-full"
								onClick={() => router.push('/planner')}
							>
								add task
							</Button>
						</div>
					) : (
						events.map((event: TimelineEvent, index: number) => (
							<TimelineEventCard
								key={event.id}
								event={event}
								index={index}
								onClick={() => handleEventClick(event)}
							/>
						))
					)}
				</div>
			</div>

			{/* Stats */}
			<div className="p-4 border-t border-border">
				<div className="bg-primary-soft rounded-lg p-4">
					<div className="flex items-center justify-between mb-1">
						<p className="text-[10px] text-muted-foreground">progress today</p>
						{session && events.length > 0 && (
							<span className="text-[10px] text-primary font-medium">live</span>
						)}
					</div>
					<div className="flex items-end gap-2">
						<span className="text-sm font-display font-bold text-primary">{completedCount}</span>
						<span className="text-xs text-muted-foreground mb-px">/ {totalCount} done</span>
					</div>
					<div className="mt-2 h-1.5 bg-border rounded-full overflow-hidden">
						<m.div
							className="h-full bg-primary rounded-full"
							initial={{ width: 0 }}
							animate={{ width: `${progressPercent}%` }}
							transition={{ duration: 0.5, ease: 'easeOut' }}
						/>
					</div>
				</div>
			</div>
		</aside>
	);
}

function TimelineEventCard({
	event,
	index,
	onClick,
}: {
	event: TimelineEvent;
	index: number;
	onClick: () => void;
}) {
	const statusStyles = {
		completed: 'bg-success-soft/50 border-success/30 hover:border-success/50',
		current: 'bg-primary-soft border-primary shadow-md hover:shadow-lg',
		upcoming: 'bg-card border-border hover:border-primary/50',
	};

	const dotStyles = {
		completed: 'bg-success',
		current: 'bg-primary ring-4 ring-primary-soft/10 animate-pulse',
		upcoming: 'bg-border',
	};

	const isClickable = !!event.navigationHref;

	return (
		<m.div
			initial={{ opacity: 0, x: -20 }}
			animate={{ opacity: 1, x: 0 }}
			transition={{ delay: index * 0.08, duration: 0.4 }}
			className="relative rounded-xl overflow-hidden border"
		>
			<div className="absolute left-0 top-0 h-full w-full bg-background z-0" />
			<m.button
				initial={{ opacity: 0, x: -20 }}
				animate={{ opacity: 1, x: 0 }}
				transition={{ delay: index * 0.08, duration: 0.4 }}
				whileTap={{ scale: 0.98 }}
				onClick={isClickable ? onClick : undefined}
				disabled={!isClickable}
				className={cn(
					'relative flex items-start gap-3 p-3 rounded-xl relative cursor-pointer tiimo-press relative z-2 w-full text-left transition-all',
					statusStyles[event.status],
					isClickable ? 'cursor-pointer' : 'cursor-default'
				)}
			>
				{/* Timeline Dot */}
				<div className="relative flex-shrink-0 pt-1">
					<div className={cn('w-3 h-3 rounded-full', dotStyles[event.status])} />
				</div>

				{/* Content */}
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2 mb-0.5 text-[10px] font-mono text-muted-foreground italic">
						<span>{event.time}</span>
						<span>•</span>
						<span>{event.duration}</span>
					</div>
					<p className="text-[13px] font-semibold text-foreground truncate">
						{event.title.toLowerCase()}
					</p>
				</div>

				{/* Emoji */}
				<div className="flex-shrink-0 w-8 h-8 rounded-full bg-background flex items-center justify-center text-lg shadow-sm">
					{event.emoji}
				</div>
			</m.button>

			{event.status === 'upcoming' && isClickable && (
				<div className="absolute h-full w-full left-0 top-0 bg-white/40 dark:bg-black/20 backdrop-blur-[1px] pointer-events-none" />
			)}
		</m.div>
	);
}
