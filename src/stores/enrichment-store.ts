import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface EnrichmentState {
	mockDataEnabled: boolean;
	enrichmentEnabled: boolean;
	enrichedUIEnabled: boolean;
	setMockDataEnabled: (v: boolean) => void;
	setEnrichmentEnabled: (v: boolean) => void;
	setEnrichedUIEnabled: (v: boolean) => void;
	resetToDefaults: () => void;
}

const DEFAULTS = {
	mockDataEnabled: false,
	enrichmentEnabled: false,
	enrichedUIEnabled: true,
};

export const useEnrichmentStore = create<EnrichmentState>()(
	persist(
		(set) => ({
			...DEFAULTS,
			setMockDataEnabled: (v) => set({ mockDataEnabled: v }),
			setEnrichmentEnabled: (v) => set({ enrichmentEnabled: v }),
			setEnrichedUIEnabled: (v) => set({ enrichedUIEnabled: v }),
			resetToDefaults: () => set(DEFAULTS),
		}),
		{
			name: 'matric-master-enrichment',
		}
	)
);
