'use client';

import { useCallback, useState } from 'react';
import type { MapLayer, MapMarker } from '@/types/map';

interface UseMapOptions {
	initialCenter?: [number, number];
	initialZoom?: number;
}

interface UseMapReturn {
	center: [number, number];
	zoom: number;
	markers: MapMarker[];
	layers: MapLayer[];
	setCenter: (center: [number, number]) => void;
	setZoom: (zoom: number) => void;
	setMarkers: (markers: MapMarker[]) => void;
	addMarker: (marker: MapMarker) => void;
	removeMarker: (id: string) => void;
	setLayers: (layers: MapLayer[]) => void;
	toggleLayer: (id: string) => void;
}

const SOUTH_AFRICA_CENTER: [number, number] = [-30.5595, 22.9375];
const DEFAULT_ZOOM = 6;

export function useMap(options: UseMapOptions = {}): UseMapReturn {
	const { initialCenter = SOUTH_AFRICA_CENTER, initialZoom = DEFAULT_ZOOM } = options;

	const [center, setCenter] = useState<[number, number]>(initialCenter);
	const [zoom, setZoom] = useState(initialZoom);
	const [markers, setMarkers] = useState<MapMarker[]>([]);
	const [layers, setLayers] = useState<MapLayer[]>([]);

	const addMarker = useCallback((marker: MapMarker) => {
		setMarkers((prev) => [...prev, marker]);
	}, []);

	const removeMarker = useCallback((id: string) => {
		setMarkers((prev) => prev.filter((m) => m.id !== id));
	}, []);

	const toggleLayer = useCallback((id: string) => {
		setLayers((prev) =>
			prev.map((layer) => (layer.id === id ? { ...layer, visible: !layer.visible } : layer))
		);
	}, []);

	return {
		center,
		zoom,
		markers,
		layers,
		setCenter,
		setZoom,
		setMarkers,
		addMarker,
		removeMarker,
		setLayers,
		toggleLayer,
	};
}
