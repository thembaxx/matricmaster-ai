'use client';

import L from 'leaflet';
import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import type { MapMarker } from '@/types/map';

interface LeafletMapProps {
	center: [number, number];
	zoom: number;
	markers?: MapMarker[];
	className?: string;
	onMarkerClick?: (marker: MapMarker) => void;
}

const createCustomIcon = (color = '#6366f1') => {
	return L.divIcon({
		className: 'custom-marker',
		html: `<div style="
      background-color: ${color};
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    "></div>`,
		iconSize: [24, 24],
		iconAnchor: [12, 12],
		popupAnchor: [0, -12],
	});
};

export function LeafletMap({
	center,
	zoom,
	markers = [],
	className = '',
	onMarkerClick,
}: LeafletMapProps) {
	const mapRef = useRef<L.Map | null>(null);
	const mapContainerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!mapContainerRef.current || mapRef.current) return;

		mapRef.current = L.map(mapContainerRef.current, {
			center,
			zoom,
			zoomControl: false,
		});

		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution:
				'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
			maxZoom: 19,
		}).addTo(mapRef.current);

		return () => {
			if (mapRef.current) {
				mapRef.current.remove();
				mapRef.current = null;
			}
		};
	}, [center, zoom]);

	useEffect(() => {
		if (!mapRef.current) return;

		markers.forEach((marker) => {
			const icon = createCustomIcon(
				marker.category === 'battle'
					? '#ef4444'
					: marker.category === 'conservation'
						? '#22c55e'
						: marker.category === 'biome'
							? '#84cc16'
							: '#6366f1'
			);

			const leafletMarker = L.marker(marker.position, { icon })
				.addTo(mapRef.current!)
				.bindPopup(`
          <div style="font-family: var(--font-body); min-width: 150px;">
            <h3 style="margin: 0 0 8px 0; font-weight: 600;">${marker.title}</h3>
            ${marker.description ? `<p style="margin: 0; font-size: 14px;">${marker.description}</p>` : ''}
            ${marker.year ? `<p style="margin: 8px 0 0 0; font-size: 12px; color: #666;">Year: ${marker.year}</p>` : ''}
          </div>
        `);

			if (onMarkerClick) {
				leafletMarker.on('click', () => onMarkerClick(marker));
			}
		});
	}, [markers, onMarkerClick]);

	return (
		<div
			ref={mapContainerRef}
			className={`w-full h-full min-h-[400px] ${className}`}
			style={{ zIndex: 0 }}
		/>
	);
}

export default LeafletMap;
