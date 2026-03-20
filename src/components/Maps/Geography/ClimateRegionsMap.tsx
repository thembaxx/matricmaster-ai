'use client';

import { useState } from 'react';
import { CLIMATE_REGIONS, REGIONAL_ZOOM } from '@/constants/map-data';
import type { MapMarker } from '@/types/map';
import { MapContainer } from '../MapContainer';

const CLIMATE_MARKERS: MapMarker[] = [
	{
		id: 'cape-town',
		title: 'Cape Town',
		description: 'Mediterranean climate - wet winters, dry summers',
		position: [-33.9249, 18.4241],
		category: 'climate',
	},
	{
		id: 'durban',
		title: 'Durban',
		description: 'Subtropical climate - humid, summer rainfall',
		position: [-29.8587, 31.0218],
		category: 'climate',
	},
	{
		id: 'johannesburg',
		title: 'Johannesburg',
		description: 'Temperate climate - moderate rainfall',
		position: [-26.2041, 28.0473],
		category: 'climate',
	},
	{
		id: 'bloemfontein',
		title: 'Bloemfontein',
		description: 'Semi-arid climate - low rainfall',
		position: [-29.0852, 26.1596],
		category: 'climate',
	},
	{
		id: 'windhoek',
		title: 'Windhoek',
		description: 'Arid climate - very low rainfall',
		position: [-22.5609, 17.0658],
		category: 'climate',
	},
];

interface ClimateRegionsMapProps {
	className?: string;
}

export function ClimateRegionsMap({ className = '' }: ClimateRegionsMapProps) {
	const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

	return (
		<div className={`space-y-4 ${className}`}>
			<div className="flex flex-wrap gap-2">
				{CLIMATE_REGIONS.map((region) => (
					<button
						type="button"
						key={region.id}
						onClick={() => setSelectedRegion(selectedRegion === region.id ? null : region.id)}
						className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
							selectedRegion === region.id ? 'ring-2 ring-offset-2' : 'opacity-70 hover:opacity-100'
						}`}
						style={{
							backgroundColor: region.color,
							color: 'white',
						}}
					>
						{region.name}
					</button>
				))}
			</div>

			<div className="rounded-lg overflow-hidden border">
				<MapContainer
					center={[-30.5595, 22.9375]}
					zoom={REGIONAL_ZOOM}
					markers={CLIMATE_MARKERS}
					onMarkerClick={(marker) => console.log('Clicked:', marker)}
				/>
			</div>

			{selectedRegion && (
				<div className="p-4 rounded-lg bg-muted">
					{(() => {
						const region = CLIMATE_REGIONS.find((r) => r.id === selectedRegion);
						if (!region) return null;
						return (
							<>
								<h3 className="font-semibold">{region.name}</h3>
								<p className="text-sm text-muted-foreground mt-1">{region.description}</p>
								<ul className="mt-2 text-sm space-y-1">
									{region.characteristics.map((char) => (
										<li key={char} className="flex items-center gap-2">
											<span
												className="w-2 h-2 rounded-full"
												style={{ backgroundColor: region.color }}
											/>
											{char}
										</li>
									))}
								</ul>
							</>
						);
					})()}
				</div>
			)}
		</div>
	);
}

export default ClimateRegionsMap;
