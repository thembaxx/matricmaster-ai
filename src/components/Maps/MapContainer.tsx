'use client';

import dynamic from 'next/dynamic';
import { useMapContext } from '@/lib/map-provider';
import type { MapMarker } from '@/types/map';

const LeafletMap = dynamic(() => import('./LeafletMap').then((mod) => mod.LeafletMap), {
	ssr: false,
});

interface MapContainerProps {
	center?: [number, number];
	zoom?: number;
	markers?: MapMarker[];
	className?: string;
	onMarkerClick?: (marker: MapMarker) => void;
}

const SOUTH_AFRICA_CENTER: [number, number] = [-30.5595, 22.9375];
const DEFAULT_ZOOM = 6;

export function MapContainer({
	center = SOUTH_AFRICA_CENTER,
	zoom = DEFAULT_ZOOM,
	markers = [],
	className = '',
	onMarkerClick,
}: MapContainerProps) {
	const { provider, isGoogleMapsAvailable } = useMapContext();

	if (provider === 'google' && isGoogleMapsAvailable) {
		return (
			<div className={`w-full h-full min-h-[400px] ${className}`}>
				<div className="flex items-center justify-center h-full bg-muted rounded-lg">
					<p className="text-muted-foreground">Google Maps coming soon</p>
				</div>
			</div>
		);
	}

	return (
		<LeafletMap
			center={center}
			zoom={zoom}
			markers={markers}
			className={className}
			onMarkerClick={onMarkerClick}
		/>
	);
}

export default MapContainer;
