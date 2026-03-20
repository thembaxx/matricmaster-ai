'use client';

import { useMemo, useState } from 'react';
import { DEFAULT_ZOOM, SOUTH_AFRICA_CENTER, TIMELINE_EVENTS } from '@/constants/map-data';
import type { MapMarker } from '@/types/map';
import { MapContainer } from '../MapContainer';

interface TimelineMapProps {
	className?: string;
	startYear?: number;
	endYear?: number;
}

export function TimelineMap({
	className = '',
	startYear = 1652,
	endYear = 1994,
}: TimelineMapProps) {
	const [selectedEvent, setSelectedEvent] = useState<MapMarker | null>(null);

	const filteredEvents = useMemo(() => {
		return TIMELINE_EVENTS.filter((event) => event.year! >= startYear && event.year! <= endYear);
	}, [startYear, endYear]);

	const groupedByDecade = useMemo(() => {
		const groups: Record<string, MapMarker[]> = {};
		filteredEvents.forEach((event) => {
			const decade = Math.floor(event.year! / 10) * 10;
			const key = `${decade}s`;
			if (!groups[key]) groups[key] = [];
			groups[key].push(event);
		});
		return groups;
	}, [filteredEvents]);

	return (
		<div className={`space-y-4 ${className}`}>
			<div className="flex flex-wrap items-center gap-4">
				<span className="text-sm text-muted-foreground">
					{startYear} - {endYear}
				</span>
			</div>

			<div className="flex flex-wrap gap-2">
				{Object.entries(groupedByDecade).map(([decade, events]) => (
					<div key={decade} className="flex flex-wrap gap-1">
						<span className="text-xs text-muted-foreground py-1">{decade}</span>
						{events.map((event) => (
							<button
								type="button"
								key={event.id}
								onClick={() => setSelectedEvent(event)}
								className={`px-2 py-0.5 text-xs rounded transition-colors ${
									selectedEvent?.id === event.id
										? 'bg-primary text-primary-foreground'
										: 'bg-muted hover:bg-muted/80'
								}`}
							>
								{event.year}
							</button>
						))}
					</div>
				))}
			</div>

			<div className="rounded-lg overflow-hidden border">
				<MapContainer
					center={SOUTH_AFRICA_CENTER}
					zoom={DEFAULT_ZOOM}
					markers={filteredEvents}
					onMarkerClick={(marker) => setSelectedEvent(marker)}
				/>
			</div>

			{selectedEvent && (
				<div className="p-4 rounded-lg bg-muted">
					<div className="flex items-start justify-between">
						<div>
							<h3 className="font-semibold">{selectedEvent.title}</h3>
							<p className="text-sm text-muted-foreground mt-1">{selectedEvent.description}</p>
						</div>
						<span className="text-lg font-bold text-primary">{selectedEvent.year}</span>
					</div>
				</div>
			)}
		</div>
	);
}

export default TimelineMap;
