'use client';

import { useState } from 'react';
import { BIOMES, REGIONAL_ZOOM } from '@/constants/map-data';
import type { MapMarker } from '@/types/map';
import { MapContainer } from '../MapContainer';

const BIOME_MARKERS: MapMarker[] = [
	{
		id: 'fynbos-cape',
		title: 'Fynbos Region',
		description: 'Mediterranean shrubland - Cape Floristic Region',
		position: [-34.0, 19.0],
		category: 'biome',
	},
	{
		id: 'savanna-north',
		title: 'Savanna Biome',
		description: 'Kruger to Limpopo - mixed grassland and woodland',
		position: [-24.0, 31.5],
		category: 'biome',
	},
	{
		id: 'grassland-highveld',
		title: 'Grassland Biome',
		description: 'Highveld - temperate grassland',
		position: [-26.5, 27.5],
		category: 'biome',
	},
	{
		id: 'karoo-succulent',
		title: 'Succulent Karoo',
		description: 'Semi-desert with succulent plants',
		position: [-30.5, 22.0],
		category: 'biome',
	},
	{
		id: 'forest-patches',
		title: 'Forest Biome',
		description: 'Indigenous forest patches along coast and mountains',
		position: [-33.5, 19.5],
		category: 'biome',
	},
];

interface BiomeMapProps {
	className?: string;
}

export function BiomeMap({ className = '' }: BiomeMapProps) {
	const [selectedBiome, setSelectedBiome] = useState<string | null>(null);

	return (
		<div className={`space-y-4 ${className}`}>
			<div className="flex flex-wrap gap-2">
				{BIOMES.map((biome) => (
					<button
						type="button"
						key={biome.id}
						onClick={() => setSelectedBiome(selectedBiome === biome.id ? null : biome.id)}
						className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
							selectedBiome === biome.id ? 'ring-2 ring-offset-2' : 'opacity-70 hover:opacity-100'
						}`}
						style={{
							backgroundColor: biome.color,
							color: 'white',
						}}
					>
						{biome.name}
					</button>
				))}
			</div>

			<div className="rounded-lg overflow-hidden border">
				<MapContainer
					center={[-30.5595, 22.9375]}
					zoom={REGIONAL_ZOOM}
					markers={BIOME_MARKERS}
					onMarkerClick={(marker) => {
						const biome = BIOMES.find(
							(b) =>
								marker.title.toLowerCase().includes(b.name.toLowerCase()) ||
								(marker.description?.toLowerCase().includes(b.name.toLowerCase()) ?? false)
						);
						if (biome) setSelectedBiome(biome.id);
					}}
				/>
			</div>

			{selectedBiome && (
				<div className="p-4 rounded-lg bg-muted">
					{(() => {
						const biome = BIOMES.find((b) => b.id === selectedBiome);
						if (!biome) return null;
						return (
							<>
								<h3 className="font-semibold">{biome.name}</h3>
								<p className="text-sm text-muted-foreground mt-1">{biome.description}</p>
								<div className="mt-2">
									<span className="text-sm font-medium">Key Vegetation: </span>
									<span className="text-sm text-muted-foreground">
										{biome.vegetation.join(', ')}
									</span>
								</div>
							</>
						);
					})()}
				</div>
			)}
		</div>
	);
}

export default BiomeMap;
