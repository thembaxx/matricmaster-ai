'use client';

import {
	Calendar01Icon,
	Clock01Icon,
	Delete02Icon,
	PencilEdit01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CalendarEvent } from '@/hooks/useCalendar';
import { EVENT_TYPES } from '@/hooks/useCalendar';

interface CalendarEventSidebarProps {
	selectedDate: Date | null;
	selectedDateEvents: CalendarEvent[];
	onDeleteEvent: (id: string) => void;
}

export function CalendarEventSidebar({
	selectedDate,
	selectedDateEvents,
	onDeleteEvent,
}: CalendarEventSidebarProps) {
	return (
		<div className="space-y-4">
			<Card>
				<CardHeader>
					<CardTitle className="text-lg">
						{selectedDate
							? selectedDate.toLocaleDateString('en-US', {
									weekday: 'long',
									month: 'long',
									day: 'numeric',
								})
							: 'Select a date'}
					</CardTitle>
				</CardHeader>
				<CardContent>
					{selectedDateEvents.length > 0 ? (
						<div className="space-y-3">
							{selectedDateEvents.map((event) => (
								<div
									key={event.id}
									className={`p-3 rounded-lg border ${
										EVENT_TYPES.find((t) => t.value === event.eventType)?.color.split(' ')[0]
									}`}
								>
									<div className="flex items-start justify-between">
										<div>
											<h3 className="font-medium text-sm">{event.title}</h3>
											{event.subject && (
												<Badge variant="outline" className="mt-1 text-xs">
													{event.subject}
												</Badge>
											)}
										</div>
										<div className="flex gap-1">
											<Button variant="ghost" size="icon" className="h-6 w-6">
												<HugeiconsIcon icon={PencilEdit01Icon} className="h-3 w-3" />
											</Button>
											<Button
												variant="ghost"
												size="icon"
												className="h-6 w-6"
												onClick={() => onDeleteEvent(event.id)}
											>
												<HugeiconsIcon icon={Delete02Icon} className="h-3 w-3" />
											</Button>
										</div>
									</div>
									<div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
										<span className="flex items-center gap-1">
											<HugeiconsIcon icon={Clock01Icon} className="h-3 w-3" />
											{new Date(event.startTime).toLocaleTimeString([], {
												hour: '2-digit',
												minute: '2-digit',
											})}
										</span>
									</div>
									{event.description && (
										<p className="text-xs text-muted-foreground mt-2">{event.description}</p>
									)}
								</div>
							))}
						</div>
					) : (
						<div className="text-center py-8 text-muted-foreground">
							<HugeiconsIcon icon={Calendar01Icon} className="h-8 w-8 mx-auto mb-2 opacity-50" />
							<p className="text-sm">No events for this day</p>
						</div>
					)}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className="text-lg">Connect Calendars</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					<Button variant="outline" className="w-full justify-start">
						<svg
							viewBox="0 0 24 24"
							className="h-4 w-4 mr-2"
							fill="currentColor"
							aria-label="Google Calendar"
						>
							<title>Google Calendar</title>
							<path
								d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
								fill="#4285F4"
							/>
							<path
								d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
								fill="#34A853"
							/>
							<path
								d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
								fill="#FBBC05"
							/>
							<path
								d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
								fill="#EA4335"
							/>
						</svg>
						Connect Google Calendar
					</Button>
					<Button variant="outline" className="w-full justify-start">
						<svg
							viewBox="0 0 24 24"
							className="h-4 w-4 mr-2"
							fill="currentColor"
							aria-label="iCal Calendar"
						>
							<title>iCal Calendar</title>
							<path
								d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
								fill="#FA3F00"
							/>
						</svg>
						Connect Apple Calendar
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
