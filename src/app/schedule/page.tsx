'use client';

import { PlusSignIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useCallback, useEffect, useState } from 'react';
import { appConfig } from '@/app.config';
import { AddBlockModal } from '@/components/Schedule/AddBlockModal';
import { BlockActionSheet } from '@/components/Schedule/BlockActionSheet';
import type { UIEvent } from '@/components/Schedule/constants';
import { getCurrentDayName, mapDbEventToUI } from '@/components/Schedule/constants';
import { DesktopCalendarGrid } from '@/components/Schedule/DesktopCalendarGrid';
import { MobileListView } from '@/components/Schedule/MobileListView';
import { Button } from '@/components/ui/button';
import { deleteCalendarEventAction, getCalendarEventsWithSubjectsAction } from '@/lib/db/actions';

export default function SchedulePage() {
	const [selectedDay, setSelectedDay] = useState(() => getCurrentDayName());
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
		} catch (error) {
			console.error('Failed to delete event:', error);
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

			<DesktopCalendarGrid
				events={events}
				selectedDay={selectedDay}
				onBlockClick={handleBlockClick}
			/>

			<MobileListView
				events={events}
				selectedDay={selectedDay}
				isDeleting={isDeleting}
				onDaySelect={setSelectedDay}
				onBlockClick={handleBlockClick}
				onDeleteBlock={handleDeleteBlock}
			/>

			{/* Copyright */}
			<div className="mt-12 pt-6 border-t border-border/20 text-center">
				<p className="text-[10px] text-muted-foreground/50  tracking-widest">
					&copy; {new Date().getFullYear()} {appConfig.name}. All rights reserved.
				</p>
			</div>
		</div>
	);
}
