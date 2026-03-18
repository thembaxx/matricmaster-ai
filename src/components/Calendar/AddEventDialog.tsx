'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { EventType } from '@/hooks/useCalendar';
import { EVENT_TYPES } from '@/hooks/useCalendar';

interface AddEventDialogProps {
	showEventForm: boolean;
	setShowEventForm: (show: boolean) => void;
	newEvent: {
		title: string;
		description: string;
		startTime: string;
		endTime: string;
		eventType: EventType;
		subject: string;
		reminder: string;
	};
	setNewEvent: (event: any) => void;
	onAddEvent: () => void;
}

export function AddEventDialog({
	showEventForm,
	setShowEventForm,
	newEvent,
	setNewEvent,
	onAddEvent,
}: AddEventDialogProps) {
	if (!showEventForm) return null;

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle>Add New Event</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div>
						<label htmlFor="event-title" className="text-sm font-medium mb-1 block">
							Title
						</label>
						<Input
							id="event-title"
							placeholder="Event title"
							value={newEvent.title}
							onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
						/>
					</div>
					<div>
						<label htmlFor="event-description" className="text-sm font-medium mb-1 block">
							Description
						</label>
						<Textarea
							id="event-description"
							placeholder="Optional description"
							value={newEvent.description}
							onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
						/>
					</div>
					<div className="grid grid-cols-2 gap-4">
						<div>
							<label htmlFor="event-start" className="text-sm font-medium mb-1 block">
								Start Time
							</label>
							<Input
								id="event-start"
								type="datetime-local"
								value={newEvent.startTime}
								onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
							/>
						</div>
						<div>
							<label htmlFor="event-end" className="text-sm font-medium mb-1 block">
								End Time
							</label>
							<Input
								id="event-end"
								type="datetime-local"
								value={newEvent.endTime}
								onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
							/>
						</div>
					</div>
					<div>
						<span className="text-sm font-medium mb-1 block">Event Type</span>
						<div className="flex gap-2 flex-wrap">
							{EVENT_TYPES.map((type) => (
								<Badge
									key={type.value}
									variant={newEvent.eventType === type.value ? 'default' : 'outline'}
									className="cursor-pointer"
									onClick={() => setNewEvent({ ...newEvent, eventType: type.value })}
								>
									{type.label}
								</Badge>
							))}
						</div>
					</div>
					<div>
						<label htmlFor="event-subject" className="text-sm font-medium mb-1 block">
							Subject (Optional)
						</label>
						<Input
							id="event-subject"
							placeholder="e.g., Mathematics"
							value={newEvent.subject}
							onChange={(e) => setNewEvent({ ...newEvent, subject: e.target.value })}
						/>
					</div>
					<div className="flex justify-end gap-2 pt-4">
						<Button variant="outline" onClick={() => setShowEventForm(false)}>
							Cancel
						</Button>
						<Button onClick={onAddEvent}>Add Event</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
