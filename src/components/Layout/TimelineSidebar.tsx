'use client';

import { m } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { SUBJECTS } from '@/constants/subjects';
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
		title: 'Calculus review',
		duration: '45 min',
		status: 'completed',
		emoji: SUBJECTS.mathematics.emoji,
		navigationHref: '/focus?subject=mathematics',
	},
	{
		id: '2',
		time: '09:00',
		subject: 'physics',
		title: 'Circuit problems',
		duration: '30 min',
		status: 'current',
		emoji: SUBJECTS.physics.emoji,
		navigationHref: '/quiz?subject=physics',
	},
	{
		id: '3',
		time: '10:00',
		subject: 'english',
		title: 'Essay planning',
		duration: '60 min',
		status: 'upcoming',
		emoji: SUBJECTS.english.emoji,
		navigationHref: '/ai-tutor?subject=english',
	},
	{
		id: '4',
		time: '11:30',
		subject: 'life-sciences',
		title: 'Cell structures',
		duration: '45 min',
		status: 'upcoming',
		emoji: SUBJECTS['life-sciences'].emoji,
		navigationHref: '/flashcards?subject=life-sciences',
	},
	{
		id: '5',
		time: '13:00',
		subject: 'Break',
		title: 'Lunch',
		duration: '30 min',
		status: 'upcoming',
		emoji: '🥪',
		navigationHref: undefined,
	},
];

export function TimelineSidebar() {
	const router = useRouter();
	const { data: session } = authClient.useSession();
	const [events, setEvents] = useState<TimelineEvent[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [selectedDate, setSelectedDate] = useState(new Date());

	const today = selectedDate.toLocaleDateString('en-US', {
		weekday: 'long',
		month: 'short',
		day: 'numeric',
	});

	useEffect(() => {
		async function loadEvents() {
			setIsLoading(true);
			try {
				const data = await getTodayTimelineEventsAction();
				if (data.length > 0) {
					setEvents(
						data.map((e) => ({
							id: e.id,
							time: e.time,
							subject: e.subject,
							title: e.title,
							duration: e.duration,
							status: e.status,
							emoji: e.emoji,
							navigationHref: e.navigationHref,
						}))
					);
				} else {
					setEvents(DEMO_EVENTS);
				}
			} catch (error) {
				console.error('Error loading timeline events:', error);
				setEvents(DEMO_EVENTS);
			} finally {
				setIsLoading(false);
			}
		}
		loadEvents();
	}, []);

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
		<aside className="fixed left-0 top-0 h-screen w-72 bg-background-elevated border-r border-border hidden lg:flex flex-col z-20">
			{/* Header */}
			<div className="p-6 border-b border-border">
				{/* Date Selector */}
				<div className="flex items-center gap-2">
					<Button
						variant="ghost"
						size="icon"
						className="rounded-full h-8 w-8"
						onClick={handlePrevDay}
					>
						<span className="text-lg">‹</span>
					</Button>
					<div className="flex-1 text-center">
						<p className="text-sm font-semibold text-foreground">{today}</p>
						{isToday && session && (
							<span className="text-[10px] text-primary font-medium">Today</span>
						)}
					</div>
					<Button
						variant="ghost"
						size="icon"
						className="rounded-full h-8 w-8"
						onClick={handleNextDay}
					>
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
					{isLoading ? (
						<div className="space-y-2">
							{[1, 2, 3, 4].map((i) => (
								<div
									key={i}
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
							<p className="text-sm text-muted-foreground mb-3">No events scheduled</p>
							<Button
								variant="outline"
								size="sm"
								className="rounded-full"
								onClick={() => router.push('/planner')}
							>
								Add task
							</Button>
						</div>
					) : (
						events.map((event, index) => (
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
						<p className="text-[10px] text-muted-foreground">Progress today</p>
						{session && events.length > 0 && (
							<span className="text-[10px] text-primary font-medium">Live</span>
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
			className="relative rounded-xl overflow-hidden border mb-2"
		>
			<div className="absolute left-0 top-0 h-full w-full bg-background z-0" />
			<m.button
				initial={{ opacity: 0, x: -20 }}
				animate={{ opacity: 1, x: 0 }}
				transition={{ delay: index * 0.08, duration: 0.4 }}
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
			</m.button>

			{event.status === 'upcoming' && isClickable && (
				<div className="absolute h-full w-full left-0 top-0 bg-white/40 dark:bg-black/20 backdrop-blur-[1px] pointer-events-none" />
			)}
		</m.div>
	);
}
