// ============================================================================
// FEATURE FLAGS - Enrichment System
// ============================================================================
// Supports both server-side (env vars) and client-side (Zustand store) flags.
// Server checks env vars at build/runtime; client reads from Zustand store
// with optional env-based defaults.
// ============================================================================

const FLAG_KEYS = ['ENABLE_MOCK_DATA', 'ENABLE_ENRICHMENT_PIPELINE', 'ENABLE_ENRICHED_UI'] as const;

type FlagKey = (typeof FLAG_KEYS)[number];

// ---------------------------------------------------------------------------
// Server-side: environment variable checks
// ---------------------------------------------------------------------------

function readEnvFlag(flag: FlagKey): boolean {
	if (typeof process === 'undefined' || typeof process.env === 'undefined') {
		return false;
	}
	const value = process.env[flag];
	if (value === undefined) {
		// Default values per flag
		switch (flag) {
			case 'ENABLE_MOCK_DATA':
				return process.env.NODE_ENV === 'development';
			case 'ENABLE_ENRICHMENT_PIPELINE':
				return process.env.NODE_ENV === 'development';
			case 'ENABLE_ENRICHED_UI':
				return true;
			default:
				return false;
		}
	}
	return value === 'true' || value === '1';
}

/**
 * Check if mock data mode is enabled (server-side via env var).
 */
export function isMockDataEnabled(): boolean {
	return readEnvFlag('ENABLE_MOCK_DATA');
}

/**
 * Check if the enrichment pipeline is enabled (server-side via env var).
 */
export function isEnrichmentEnabled(): boolean {
	return readEnvFlag('ENABLE_ENRICHMENT_PIPELINE');
}

/**
 * Check if the enriched UI is enabled (server-side via env var).
 */
export function isEnrichedUIEnabled(): boolean {
	return readEnvFlag('ENABLE_ENRICHED_UI');
}

// ---------------------------------------------------------------------------
// Runtime overrides (client-side, in-memory)
// ---------------------------------------------------------------------------

const runtimeOverrides: Map<FlagKey, boolean> = new Map();

/**
 * Get all feature flags as a plain record.
 * Runtime overrides take precedence over env vars.
 */
export function getFeatureFlags(): Record<string, boolean> {
	const result: Record<string, boolean> = {};
	for (const key of FLAG_KEYS) {
		if (runtimeOverrides.has(key)) {
			result[key] = runtimeOverrides.get(key)!;
		} else {
			result[key] = readEnvFlag(key);
		}
	}
	return result;
}

/**
 * Override a feature flag at runtime. Client-side only; does not persist
 * across server requests unless synced with Zustand store.
 */
export function setFeatureFlag(flag: string, value: boolean): void {
	if (!FLAG_KEYS.includes(flag as FlagKey)) {
		return;
	}
	runtimeOverrides.set(flag as FlagKey, value);
}

/**
 * Reset all runtime overrides back to env var defaults.
 */
export function resetFeatureFlags(): void {
	runtimeOverrides.clear();
}
