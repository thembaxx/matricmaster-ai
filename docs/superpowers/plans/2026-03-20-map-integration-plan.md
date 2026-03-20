# Map Integration Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development or implement tasks sequentially. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add interactive maps for Geography, History, and Life Sciences subjects with Leaflet (free) as primary and Google Maps as premium option.

**Architecture:** 
- Primary: Leaflet + OpenStreetMap (free, unlimited)
- Fallback: Google Maps (when API key provided)
- Abstraction layer with provider switching in settings

**Tech Stack:** Leaflet, OpenStreetMap, Google Maps JS API, React Context

---

## File Structure

```
src/
├── components/
│   └── Maps/
│       ├── MapContainer.tsx         # Main map wrapper with provider detection
│       ├── LeafletMap.tsx           # Leaflet implementation
│       ├── GoogleMap.tsx            # Google Maps implementation (premium)
│       ├── MapMarker.tsx            # Custom map markers
│       ├── MapPopup.tsx             # Info popups
│       ├── MapControls.tsx          # Zoom, layer controls
│       └── ClimateRegionsMap.tsx    # Geography: Climate regions
│       ├── TopographicMap.tsx      # Geography: Topographic exercises
│       ├── TimelineMap.tsx         # History: 1652-1994 timeline
│       ├── BattleSitesMap.tsx      # History: Battle locations
│       ├── BiomeMap.tsx             # Life Sciences: Biomes
│       └── ConservationMap.tsx     # Life Sciences: Conservation areas
├── hooks/
│   └── useMap.ts                    # Map functionality hook
├── lib/
│   └── map-provider.tsx             # React Context for map provider
├── constants/
│   └── map-data.ts                  # Map data (markers, regions, etc.)
├── types/
│   └── map.ts                       # TypeScript types
```

Integration points:
- `src/app/layout.tsx`                     # Add MapProvider
- `src/constants/subjects.ts`              # Add mapConfig
- `.env.example`                            # Add map API keys
- `src/app/settings/page.tsx`              # Add map provider toggle

---

## Task 1: Infrastructure & Environment Setup

**Files:**
- Modify: `.env.example`
- Create: `src/types/map.ts`
- Create: `src/lib/map-provider.tsx`

- [ ] **Step 1: Add environment variables to .env.example**

```bash
# Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
NEXT_PUBLIC_PREFER_GOOGLE_MAPS=false
```

- [ ] **Step 2: Create TypeScript types for maps**

```typescript
// src/types/map.ts
export type MapProvider = 'leaflet' | 'google';

export interface MapConfig {
  defaultCenter: [number, number]; // [lat, lng]
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
  year?: number; // For timeline maps
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
```

- [ ] **Step 3: Create MapProvider context**

```typescript
// src/lib/map-provider.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MapProvider } from '@/types/map';

interface MapContextValue {
  provider: MapProvider;
  setProvider: (provider: MapProvider) => void;
  isGoogleMapsAvailable: boolean;
}

const MapContext = createContext<MapContextValue | undefined>(undefined);

export function MapProvider({ children }: { children: ReactNode }) {
  const [provider, setProvider] = useState<MapProvider>('leaflet');
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
```

- [ ] **Step 4: Add MapProvider to app layout**

Modify `src/app/layout.tsx` to wrap children with MapProvider.

---

## Task 2: Core Map Components

**Files:**
- Create: `src/components/Maps/MapContainer.tsx`
- Create: `src/components/Maps/LeafletMap.tsx`
- Create: `src/components/Maps/MapMarker.tsx`
- Create: `src/components/Maps/MapPopup.tsx`
- Create: `src/components/Maps/MapControls.tsx`

- [ ] **Step 1: Install Leaflet dependencies**

```bash
bun add leaflet react-leaflet
bun add -D @types/leaflet
```

- [ ] **Step 2: Create MapContainer component**

This component dynamically imports the appropriate map based on provider.

- [ ] **Step 3: Create LeafletMap component**

Leaflet implementation with OpenStreetMap tiles.

- [ ] **Step 4: Create MapMarker and MapPopup components**

Reusable components for map markers and info popups.

- [ ] **Step 5: Create MapControls component**

Zoom controls and layer toggles.

- [ ] **Step 6: Fix Leaflet marker icons in Next.js**

Add CSS to fix default marker icon paths.

---

## Task 3: Subject Map Data

**Files:**
- Create: `src/constants/map-data.ts`

- [ ] **Step 1: Create map data for Geography**

- Climate regions of South Africa
- Topographic features (mountains, rivers, coasts)
- Mapwork exercise locations

- [ ] **Step 2: Create map data for History**

- Timeline markers (1652-1994)
- Battle sites (Great Trek, Anglo-Zulu, Boer War, etc.)
- Colonial trade routes

- [ ] **Step 3: Create map data for Life Sciences**

- Biome distribution (Fynbos, Savanna, Grassland, etc.)
- National parks and conservation areas
- Marine ecosystems

---

## Task 4: Subject-Specific Map Components

**Files:**
- Create: `src/components/Maps/Geography/`
- Create: `src/components/Maps/History/`
- Create: `src/components/Maps/LifeSciences/`

- [ ] **Step 1: Create Geography map components**

- ClimateRegionsMap
- TopographicMap
- MapworkQuiz

- [ ] **Step 2: Create History map components**

- TimelineMap (1652-1994)
- BattleSitesMap
- ColonialRoutesMap

- [ ] **Step 3: Create Life Sciences map components**

- BiomeMap
- ConservationMap
- EcosystemMap

---

## Task 5: Settings Integration

**Files:**
- Modify: `src/app/settings/page.tsx`

- [ ] **Step 1: Add map provider toggle in settings**

Allow users to switch between Leaflet and Google Maps.

---

## Task 6: Quiz Integration (Optional - Phase 3)

**Files:**
- Modify: `src/constants/quiz-data.ts`
- Create: map quiz components

- [ ] **Step 1: Add map quiz questions**

Geography mapwork questions
History timeline questions

---

## Implementation Notes

1. Maps must be dynamically imported with SSR disabled (`ssr: false`) due to Leaflet's client-side nature
2. Leaflet requires fixing default marker icons in Next.js (use custom SVG markers)
3. Start with Task 1 (infrastructure) before attempting map rendering components
4. Use South Africa as default center: [-30.5595, 22.9375]
5. Default zoom for country: 6, for regional: 8, for detailed: 12
