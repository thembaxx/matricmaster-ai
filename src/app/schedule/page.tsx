'use client';

import {
	Calendar01Icon,
	Clock01Icon,
	Delete02Icon,
	Edit01Icon,
	PlusSignIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';

import { AddBlockModal } from '@/components/Schedule/AddBlockModal';
import { BlockActionSheet } from '@/components/Schedule/BlockActionSheet';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { deleteCalendarEventAction, getCalendarEventsWithSubjectsAction } from '@/lib/db/actions';
import type { CalendarEvent } from '@/lib/db/schema';
import { cn } from '@/lib/utils';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = Array.from({ length: 14 }, (_, i) => i + 8);

interface UIEvent {
	id: string;
	day: string;
	start: number;
	end: number;
	title: string;
	subject: string;
	color: string;
	startTime: Date;
	endTime: Date;
	eventType: string;
	subjectId?: number;
	subjectName?: string;
	isCompleted: boolean;
}

interface CalendarEventWithSubject extends CalendarEvent {
	subjectName: string | null;
}

const mapDbEventToUI = (e: CalendarEventWithSubject): UIEvent => {
	const start = new Date(e.startTime);
	const end = new Date(e.endTime);
	const dayName = DAYS[start.getDay() === 0 ? 6 : start.getDay() - 1];
	return {
		id: e.id,
		day: dayName,
		start: start.getHours() + start.getMinutes() / 60,
		end: end.getHours() + end.getMinutes() / 60,
		title: e.title,
		subject: e.subjectName || 'Study',
		color: e.isCompleted ? 'bg-green-500' : 'bg-primary',
		startTime: start,
		endTime: end,
		eventType: e.eventType,
		subjectId: e.subjectId ?? undefined,
		subjectName: e.subjectName || undefined,
		isCompleted: e.isCompleted,
	};
};

function getCurrentDayName(): string {
	const today = new Date();
	const dayIndex = today.getDay();
	return DAYS[dayIndex === 0 ? 6 : dayIndex - 1];
}

export default function SchedulePage() {
	const [selectedDay, setSelectedDay] = useState(getCurrentDayName());
	const [events, setEvents] = useState<UIEvent[]>([]);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);
	const [selectedEvent, setSelectedEvent] = useState<UIEvent | null>(null);
	const [isDeleting, setIsDeleting] = useState<string | null>(null);

	const refreshEvents = useCallback(async () => {
		const data = await getCalendarEventsWithSubjectsAction();
		setEvents(data.map(mapDbEventToUI));
	}, []);

	useEffect(() => {
		refreshEvents();
	}, [refreshEvents]);

	const handleAddBlock = () => {
		setIsModalOpen(true);
	};

	const handleBlockClick = (event: UIEvent) => {
		setSelectedEvent(event);
		setIsActionSheetOpen(true);
	};

	const handleModalClose = (open: boolean) => {
		setIsModalOpen(open);
	};

	const handleDeleteBlock = async (eventId: string, e: React.MouseEvent) => {
		e.stopPropagation();
		if (!confirm('Are you sure you want to delete this study block?')) return;
		setIsDeleting(eventId);
		try {
			const result = await deleteCalendarEventAction(eventId);
			if (result.success) {
				refreshEvents();
			}
		} catch {
			// Silent fail
		} finally {
			setIsDeleting(null);
		}
	};

	return (
		<div className="sm:container mx-auto sm:max-w-6xl w-full overflow-hidden sm:overflow-auto px-4 pt-8 pb-32">
			<AddBlockModal open={isModalOpen} onOpenChange={handleModalClose} onSuccess={refreshEvents} />

			<BlockActionSheet
				open={isActionSheetOpen}
				onOpenChange={setIsActionSheetOpen}
				event={
					selectedEvent
						? {
								id: selectedEvent.id,
								title: selectedEvent.title,
								startTime: selectedEvent.startTime,
								endTime: selectedEvent.endTime,
								eventType: selectedEvent.eventType,
								subjectId: selectedEvent.subjectId,
								subjectName: selectedEvent.subjectName,
								isCompleted: selectedEvent.isCompleted,
							}
						: null
				}
				onSuccess={refreshEvents}
			/>

			{/* Header */}
			<div className="flex items-center mb-8">
				<div className="grow">
					<h1 className="text-2xl font-bold tracking-tight text-foreground">Study Schedule</h1>
					<p className="text-muted-foreground font-semibold text-xs tracking-wide mt-1">
						Your weekly routine
					</p>
				</div>
				<Button
					size="sm"
					onClick={handleAddBlock}
					className="rounded-full gap-2 font-semibold text-xs tracking-wide px-6 h-11 shadow-xl shadow-primary/20"
				>
					<HugeiconsIcon icon={PlusSignIcon} className="w-4 h-4" />
					Add Block
				</Button>
			</div>

			{/* Desktop Grid View */}
			<div className="hidden lg:block bg-card rounded-[2.5rem] border border-border/50 shadow-tiimo overflow-hidden">
				<div className="grid grid-cols-8 border-b border-border/50">
					<div className="p-4 border-r border-border/50" />
					{DAYS.map((day) => (
						<div
							key={day}
							className={cn(
								'p-4 text-center font-black uppercase text-[10px] tracking-widest border-r border-border/50 last:border-r-0',
								day === selectedDay ? 'text-primary' : 'text-muted-foreground'
							)}
						>
							{day}
						</div>
					))}
				</div>

				<ScrollArea className="h-[600px]">
					<div className="grid grid-cols-8 relative">
						{/* Time Column */}
						<div className="col-span-1 border-r border-border/50">
							{HOURS.map((hour) => (
								<div
									key={hour}
									className="h-20 p-2 text-[10px] font-bold text-muted-foreground/50 text-right border-b border-border/10"
								>
									{hour}:00
								</div>
							))}
						</div>

						{/* Day Columns */}
						{DAYS.map((day) => (
							<div
								key={day}
								className="col-span-1 relative border-r border-border/50 last:border-r-0"
							>
								{HOURS.map((hour) => (
									<div key={hour} className="h-20 border-b border-border/10" />
								))}

								{/* Events */}
								{events
									.filter((e) => e.day === day)
									.map((event) => (
										<m.div
											key={event.id}
											initial={{ opacity: 0, scale: 0.9 }}
											animate={{ opacity: 1, scale: 1 }}
											whileHover={{ scale: 1.02 }}
											whileTap={{ scale: 0.98 }}
											className={cn(
												'absolute left-1 right-1 rounded-xl p-3 shadow-lg border border-white/10 overflow-hidden cursor-pointer group',
												event.color
											)}
											style={{
												top: `${(event.start - 8) * 80}px`,
												height: `${(event.end - event.start) * 80}px`,
											}}
											onClick={() => handleBlockClick(event)}
										>
											<div className="flex flex-col h-full">
												<div className="flex items-start justify-between">
													<p className="text-[8px] font-black text-white/70 uppercase tracking-widest truncate flex-1">
														{event.subject}
													</p>
													{event.isCompleted && (
														<div className="shrink-0 -mt-1">
															<div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
																<svg
																	aria-label="Completed"
																	className="w-2.5 h-2.5 text-white"
																	fill="none"
																	viewBox="0 0 24 24"
																	stroke="currentColor"
																>
																	<path
																		strokeLinecap="round"
																		strokeLinejoin="round"
																		strokeWidth={3}
																		d="M5 13l4 4L19 7"
																	/>
																</svg>
															</div>
														</div>
													)}
												</div>
												<p className="text-xs font-black text-white truncate mt-auto">
													{event.title}
												</p>
											</div>
										</m.div>
									))}
							</div>
						))}
					</div>
				</ScrollArea>
			</div>

			{/* Mobile List View */}
			<div className="lg:hidden space-y-5 h-full w-full flex flex-col overflow-hidden">
				{/* Day Selector */}
				<div className="flex gap-2 pb-2 pl-2 overflow-x-auto no-scrollbar">
					{DAYS.map((day) => (
						<button
							key={day}
							type="button"
							onClick={() => setSelectedDay(day)}
							className={cn(
								'px-5 py-3 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all shrink-0',
								selectedDay === day
									? 'bg-foreground text-background shadow-lg scale-105'
									: 'bg-muted/60 text-muted-foreground hover:bg-muted'
							)}
						>
							{day}
						</button>
					))}
				</div>

				{/* Events List */}
				<div className="space-y-3 grow">
					{events
						.filter((e) => e.day === selectedDay)
						.map((event) => (
							<m.div
								key={event.id}
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								whileTap={{ scale: 0.99 }}
							>
								<Card
									className={cn(
										'shadow-md border-border/40 overflow-hidden  rounded-xl cursor-pointer transition-all hover:shadow-lg',
										event.isCompleted && 'opacity-75'
									)}
									onClick={() => handleBlockClick(event)}
								>
									<CardContent className="p-0 flex">
										{/* Color Bar */}
										<div className={cn('w-1.5 h-full min-h-[88px] shrink-0', event.color)} />

										{/* Main Content */}
										<div className="flex-1 p-4 min-w-0">
											<div className="flex items-start justify-between gap-3">
												<div className="flex flex-col min-w-0 flex-1">
													{/* Time */}
													<div className="flex items-center gap-2 mb-2">
														<HugeiconsIcon
															icon={Clock01Icon}
															className="w-3.5 h-3.5 text-muted-foreground shrink-0"
														/>
														<span className="text-[11px] font-semibold text-muted-foreground">
															{Math.floor(event.start)}:
															{String(Math.round((event.start % 1) * 60)).padStart(2, '0')} -{' '}
															{Math.floor(event.end)}:
															{String(Math.round((event.end % 1) * 60)).padStart(2, '0')}
														</span>
														{event.isCompleted && (
															<span className="inline-flex items-center px-2 py-0.5 rounded-full bg-green-500/15 text-green-600 text-[10px] font-bold">
																DONE
															</span>
														)}
													</div>

													{/* Title */}
													<h3 className="text-base font-bold uppercase tracking-tight truncate pr-2">
														{event.title}
													</h3>

													{/* Subject */}
													<p className="text-[11px] font-semibold text-primary/80 uppercase tracking-widest truncate mt-1">
														{event.subject}
													</p>
												</div>

												{/* Action Buttons - Always Visible */}
												<div className="flex items-center gap-1 shrink-0">
													<Button
														variant="ghost"
														size="icon"
														className="h-10 w-10 rounded-xl hover:bg-muted"
														onClick={(e) => {
															e.stopPropagation();
															handleBlockClick(event);
														}}
													>
														<HugeiconsIcon icon={Edit01Icon} className="w-4 h-4" />
													</Button>
													<Button
														variant="ghost"
														size="icon"
														className="h-10 w-10 rounded-xl hover:bg-destructive/10 text-destructive/70 hover:text-destructive"
														onClick={(e) => handleDeleteBlock(event.id, e)}
														disabled={isDeleting === event.id}
													>
														{isDeleting === event.id ? (
															<span className="w-4 h-4 border-2 border-destructive/30 border-t-destructive rounded-full animate-spin" />
														) : (
															<HugeiconsIcon icon={Delete02Icon} className="w-4 h-4" />
														)}
													</Button>
												</div>
											</div>
										</div>
									</CardContent>
								</Card>
							</m.div>
						))}

					{/* Empty State */}
					{events.filter((e) => e.day === selectedDay).length === 0 && (
						<div className="py-16 text-center">
							<div className="w-20 h-20 rounded-3xl bg-muted/50 flex items-center justify-center mx-auto mb-5">
								<HugeiconsIcon
									icon={Calendar01Icon}
									className="w-10 h-10 text-muted-foreground/40"
								/>
							</div>
							<p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
								No study blocks
							</p>
							<p className="text-xs text-muted-foreground/60 mt-1">
								Tap "Add Block" to schedule your first session
							</p>
						</div>
					)}
				</div>
			</div>

			{/* Copyright */}
			<div className="mt-12 pt-6 border-t border-border/20 text-center">
				<p className="text-[10px] text-muted-foreground/50 uppercase tracking-widest">
					&copy; {new Date().getFullYear()} MatricMaster. All rights reserved.
				</p>
			</div>
		</div>
	);
}
