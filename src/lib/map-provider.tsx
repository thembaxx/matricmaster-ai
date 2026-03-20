'use client';

import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';
import type { MapProvider as MapProviderType } from '@/types/map';

interface MapContextValue {
	provider: MapProviderType;
	setProvider: (provider: MapProviderType) => void;
	isGoogleMapsAvailable: boolean;
}

const MapContext = createContext<MapContextValue | undefined>(undefined);

export function MapProvider({ children }: { children: ReactNode }) {
	const [provider, setProvider] = useState<MapProviderType>('leaflet');
	const [isGoogleMapsAvailable, setIsGoogleMapsAvailable] = useState(false);

	useEffect(() => {
		const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
		const preferGoogle = process.env.NEXT_PUBLIC_PREFER_GOOGLE_MAPS === 'true';

		if (apiKey && preferGoogle) {
			setProvider('google');
			setIsGoogleMapsAvailable(true);
		} else if (apiKey) {
			setIsGoogleMapsAvailable(true);
		}
	}, []);

	return (
		<MapContext.Provider value={{ provider, setProvider, isGoogleMapsAvailable }}>
			{children}
		</MapContext.Provider>
	);
}

export function useMapContext() {
	const context = useContext(MapContext);
	if (!context) {
		throw new Error('useMapContext must be used within MapProvider');
	}
	return context;
}
