/**
 * Bridge: Maps → Quiz (Geography)
 * Maps geography quiz topics to relevant map views.
 * After a geography quiz answer, provides a "Show on map" link.
 */

export interface MapLink {
	topic: string;
	mapRoute: string;
	label: string;
}

const GEOGRAPHY_TOPIC_MAP: Record<string, MapLink> = {
	climate: {
		topic: 'Climate',
		mapRoute: '/maps?view=climate',
		label: 'Show climate regions on map',
	},
	'climate regions': {
		topic: 'Climate Regions',
		mapRoute: '/maps?view=climate',
		label: 'Show climate regions on map',
	},
	climatology: {
		topic: 'Climatology',
		mapRoute: '/maps?view=climate',
		label: 'Show climate regions on map',
	},
	weather: {
		topic: 'Weather',
		mapRoute: '/maps?view=climate',
		label: 'Show climate regions on map',
	},
	rainfall: {
		topic: 'Rainfall',
		mapRoute: '/maps?view=climate',
		label: 'Show rainfall patterns on map',
	},
	biomes: {
		topic: 'Biomes',
		mapRoute: '/maps?view=biome',
		label: 'Show biomes on map',
	},
	ecology: {
		topic: 'Ecology',
		mapRoute: '/maps?view=biome',
		label: 'Show biomes on map',
	},
	vegetation: {
		topic: 'Vegetation',
		mapRoute: '/maps?view=biome',
		label: 'Show vegetation zones on map',
	},
	conservation: {
		topic: 'Conservation',
		mapRoute: '/maps?view=conservation',
		label: 'Show conservation areas on map',
	},
	'national parks': {
		topic: 'National Parks',
		mapRoute: '/maps?view=conservation',
		label: 'Show national parks on map',
	},
	mapwork: {
		topic: 'Mapwork',
		mapRoute: '/maps?view=topographic',
		label: 'Show topographic features on map',
	},
	topography: {
		topic: 'Topography',
		mapRoute: '/maps?view=topographic',
		label: 'Show topographic features on map',
	},
	rivers: {
		topic: 'Rivers',
		mapRoute: '/maps?view=topographic',
		label: 'Show rivers on map',
	},
	mountains: {
		topic: 'Mountains',
		mapRoute: '/maps?view=topographic',
		label: 'Show mountains on map',
	},
	drakensberg: {
		topic: 'Drakensberg',
		mapRoute: '/maps?view=topographic',
		label: 'Show Drakensberg on map',
	},
	'great trek': {
		topic: 'Great Trek',
		mapRoute: '/maps?view=timeline',
		label: 'Show Great Trek route on map',
	},
	'anglo-zulu war': {
		topic: 'Anglo-Zulu War',
		mapRoute: '/maps?view=battles',
		label: 'Show battle sites on map',
	},
	'boer war': {
		topic: 'Boer War',
		mapRoute: '/maps?view=battles',
		label: 'Show battle sites on map',
	},
	apartheid: {
		topic: 'Apartheid',
		mapRoute: '/maps?view=timeline',
		label: 'Show historical timeline on map',
	},
};

/**
 * Get a map link for a geography topic.
 * Returns null if the topic doesn't have a map view.
 */
export function getMapLinkForTopic(topic: string): MapLink | null {
	const normalized = topic.toLowerCase().trim();

	// Direct match
	if (GEOGRAPHY_TOPIC_MAP[normalized]) {
		return GEOGRAPHY_TOPIC_MAP[normalized];
	}

	// Partial match
	for (const [key, value] of Object.entries(GEOGRAPHY_TOPIC_MAP)) {
		if (normalized.includes(key) || key.includes(normalized)) {
			return value;
		}
	}

	return null;
}

/**
 * Check if a subject is geography-related and has map views
 */
export function isGeographySubject(subject: string | undefined): boolean {
	if (!subject) return false;
	const normalized = subject.toLowerCase();
	return normalized === 'geography' || normalized === '4';
}
