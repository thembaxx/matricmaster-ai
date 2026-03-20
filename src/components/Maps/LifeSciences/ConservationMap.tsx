'use client';

import { useState } from 'react';
import { CONSERVATION_AREAS, REGIONAL_ZOOM } from '@/constants/map-data';
import type { ConservationArea } from '@/types/map';
import { MapContainer } from '../MapContainer';

interface ConservationMapProps {
	className?: string;
}

export function ConservationMap({ className = '' }: ConservationMapProps) {
	const [selectedArea, setSelectedArea] = useState<ConservationArea | null>(null);

	return (
		<div className={`space-y-4 ${className}`}>
			<div className="flex flex-wrap gap-2">
				<button
					type="button"
					onClick={() => setSelectedArea(null)}
					className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
						!selectedArea ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
					}`}
				>
					All Areas
				</button>
				{CONSERVATION_AREAS.map((area) => (
					<button
						type="button"
						key={area.id}
						onClick={() => setSelectedArea(area)}
						className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
							selectedArea?.id === area.id
								? 'bg-primary text-primary-foreground'
								: 'bg-muted hover:bg-muted/80'
						}`}
					>
						{area.name}
					</button>
				))}
			</div>

			<div className="rounded-lg overflow-hidden border">
				<MapContainer
					center={[-28.5, 24.0]}
					zoom={REGIONAL_ZOOM}
					markers={CONSERVATION_AREAS.map((area) => ({
						id: area.id,
						title: area.name,
						description: `${area.type.replace('-', ' ')} - Established ${area.established}`,
						position: area.position,
						category: 'conservation',
					}))}
					onMarkerClick={(marker) => {
						const area = CONSERVATION_AREAS.find((a) => a.id === marker.id);
						if (area) setSelectedArea(area);
					}}
				/>
			</div>

			<div className="grid gap-2">
				{CONSERVATION_AREAS.map((area) => (
					<button
						type="button"
						key={area.id}
						onClick={() => setSelectedArea(area)}
						className={`p-3 rounded-lg text-left transition-all ${
							selectedArea?.id === area.id
								? 'bg-primary/10 border-primary'
								: 'bg-muted hover:bg-muted/80 border'
						}`}
					>
						<div className="flex justify-between items-start">
							<div>
								<h3 className="font-semibold">{area.name}</h3>
								<p className="text-sm text-muted-foreground">{area.type.replace('-', ' ')}</p>
							</div>
							<span className="text-sm font-medium text-muted-foreground">
								Est. {area.established}
							</span>
						</div>
					</button>
				))}
			</div>

			{selectedArea && (
				<div className="p-4 rounded-lg bg-muted">
					<h3 className="font-semibold">{selectedArea.name}</h3>
					<p className="text-sm text-muted-foreground mt-1">
						Type: {selectedArea.type.replace('-', ' ')}
					</p>
					<p className="text-sm text-muted-foreground">Established: {selectedArea.established}</p>
				</div>
			)}
		</div>
	);
}

export default ConservationMap;
