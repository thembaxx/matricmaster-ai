export type MapProvider = 'leaflet' | 'google';

export interface MapConfig {
	defaultCenter: [number, number];
	defaultZoom: number;
	minZoom?: number;
	maxZoom?: number;
}

export interface MapMarker {
	id: string;
	position: [number, number];
	title: string;
	description?: string;
	category?: string;
	icon?: string;
	year?: number;
}

export interface MapRegion {
	id: string;
	name: string;
	coordinates: [number, number][] | [number, number][][];
	color?: string;
	description?: string;
}

export interface MapLayer {
	id: string;
	name: string;
	visible: boolean;
	type: 'markers' | 'regions' | 'routes';
}

export interface ClimateRegion {
	id: string;
	name: string;
	description: string;
	characteristics: string[];
	color: string;
}

export interface BattleSite {
	id: string;
	name: string;
	year: number;
	position: [number, number];
	conflict: string;
	outcome?: string;
}

export interface Biome {
	id: string;
	name: string;
	description: string;
	vegetation: string[];
	color: string;
}

export interface ConservationArea {
	id: string;
	name: string;
	position: [number, number];
	type: 'national-park' | 'reserve' | 'sanctuary';
	established: number;
}
