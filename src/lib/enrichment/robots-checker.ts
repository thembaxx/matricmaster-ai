// ============================================================================
// ROBOTS.TXT CHECKER FOR ENRICHMENT DATA SOURCES
// ============================================================================

/**
 * Utility for checking robots.txt rules before scraping external URLs.
 * Implements default-deny policy, caches results for 1 hour,
 * and parses Allow/Disallow rules per the robots.txt specification.
 */

interface RobotsCacheEntry {
	allowedPaths: string[];
	pathCache: Map<string, boolean>;
	disallowed: string[];
	fetchedAt: number;
	raw: string | null;
}

interface RobotsTxtResult {
	allowed: boolean;
	reason: string;
	rules: string[];
	fetchedAt: Date | null;
}

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const USER_AGENT = 'MatricMasterAI-Enrichment/1.0';

// In-memory cache: domain -> cache entry
const robotsCache = new Map<string, RobotsCacheEntry>();

/**
 * Extract the domain (origin) from a URL.
 */
function getDomain(url: string): string {
	try {
		const parsed = new URL(url);
		return parsed.origin;
	} catch {
		// If URL parsing fails, return empty string
		return '';
	}
}

/**
 * Extract the path from a URL (for robots.txt matching).
 */
function getPath(url: string): string {
	try {
		const parsed = new URL(url);
		return parsed.pathname + parsed.search;
	} catch {
		return '/';
	}
}

/**
 * Parse robots.txt content into structured rules.
 * Follows the robots.txt specification:
 * - User-agent lines define which rules apply to which bots
 * - Allow/Disallow lines define path patterns
 * - First matching rule wins (most specific match)
 */
function parseRobotsTxt(content: string): { allowed: string[]; disallowed: string[] } {
	const allowed: string[] = [];
	const disallowed: string[] = [];

	const lines = content.split('\n');
	let inTargetAgent = false;
	const seenGenericRules = false;

	for (const line of lines) {
		const trimmed = line.trim();

		// Skip empty lines and comments
		if (!trimmed || trimmed.startsWith('#')) {
			continue;
		}

		// Parse directive
		const colonIndex = trimmed.indexOf(':');
		if (colonIndex === -1) continue;

		const directive = trimmed.slice(0, colonIndex).trim().toLowerCase();
		const value = trimmed.slice(colonIndex + 1).trim();

		if (directive === 'user-agent') {
			// Check if this block applies to our user agent or all agents
			if (value === '*' || value.toLowerCase().includes('matricmasterai')) {
				inTargetAgent = true;
			} else if (inTargetAgent) {
				// We've moved to a different user-agent block
				inTargetAgent = false;
			}
			continue;
		}

		// Only process rules for our user agent or generic (*) rules
		if (!inTargetAgent && !seenGenericRules) {
			continue;
		}

		if (directive === 'allow') {
			allowed.push(value);
		} else if (directive === 'disallow') {
			// Empty disallow means "allow all"
			if (value === '') {
				allowed.push('/');
			} else {
				disallowed.push(value);
			}
		}
	}

	return { allowed, disallowed };
}

/**
 * Check if a path matches a robots.txt pattern.
 * Implements prefix matching per the robots.txt specification.
 */
function matchesPattern(path: string, pattern: string): boolean {
	// Empty pattern matches nothing
	if (!pattern) return false;

	// Exact match or prefix match
	if (path === pattern) return true;
	if (path.startsWith(pattern)) return true;

	// Handle wildcard (*) in pattern
	if (pattern.includes('*')) {
		const regexPattern = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
		const regex = new RegExp(`^${regexPattern}`);
		return regex.test(path);
	}

	return false;
}

/**
 * Determine if a path is allowed based on robots.txt rules.
 * Uses the "most specific rule wins" principle.
 */
function isPathAllowed(
	path: string,
	allowed: string[],
	disallowed: string[]
): { allowed: boolean; reason: string; matchingRules: string[] } {
	const matchingRules: string[] = [];

	// Find matching allow rules
	const matchingAllow = allowed.filter((pattern) => matchesPattern(path, pattern));
	// Find matching disallow rules
	const matchingDisallow = disallowed.filter((pattern) => matchesPattern(path, pattern));

	// Track which rules matched
	matchingRules.push(...matchingAllow.map((r) => `Allow: ${r}`));
	matchingRules.push(...matchingDisallow.map((r) => `Disallow: ${r}`));

	// If no rules match, default-deny
	if (matchingAllow.length === 0 && matchingDisallow.length === 0) {
		return {
			allowed: false,
			reason: 'No matching rules found (default-deny policy)',
			matchingRules,
		};
	}

	// Most specific rule wins (longest pattern)
	const longestAllow = matchingAllow.reduce(
		(longest, current) => (current.length > longest.length ? current : longest),
		''
	);
	const longestDisallow = matchingDisallow.reduce(
		(longest, current) => (current.length > longest.length ? current : longest),
		''
	);

	if (longestDisallow.length > longestAllow.length) {
		return {
			allowed: false,
			reason: `Blocked by Disallow: ${longestDisallow}`,
			matchingRules,
		};
	}

	if (longestAllow.length > longestDisallow.length) {
		return {
			allowed: true,
			reason: `Allowed by Allow: ${longestAllow}`,
			matchingRules,
		};
	}

	// If equal length, disallow takes precedence (safer)
	if (longestDisallow.length > 0) {
		return {
			allowed: false,
			reason: `Blocked by Disallow: ${longestDisallow} (equal precedence, deny wins)`,
			matchingRules,
		};
	}

	// Default-deny if nothing matched
	return {
		allowed: false,
		reason: 'No matching rules found (default-deny policy)',
		matchingRules,
	};
}

/**
 * Fetch robots.txt for a given domain.
 * Returns null if fetch fails.
 */
async function fetchRobotsTxt(domain: string): Promise<string | null> {
	try {
		const url = `${domain}/robots.txt`;
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

		const response = await fetch(url, {
			signal: controller.signal,
			headers: {
				'User-Agent': USER_AGENT,
			},
		});

		clearTimeout(timeoutId);

		if (!response.ok) {
			return null;
		}

		return await response.text();
	} catch {
		return null;
	}
}

/**
 * Fetch and cache robots.txt for a domain.
 */
async function getRobotsForDomain(domain: string): Promise<RobotsCacheEntry> {
	const cached = robotsCache.get(domain);

	// Return cached result if still valid
	if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
		return cached;
	}

	// Fetch fresh robots.txt
	const content = await fetchRobotsTxt(domain);

	if (content === null) {
		// Cache the failure for TTL duration too (avoids repeated failed fetches)
		const entry: RobotsCacheEntry = {
			allowedPaths: [],
			pathCache: new Map(),
			disallowed: [],
			fetchedAt: Date.now(),
			raw: null,
		};
		robotsCache.set(domain, entry);
		return entry;
	}

	const { allowed: allowedPaths, disallowed } = parseRobotsTxt(content);

	const entry: RobotsCacheEntry = {
		allowedPaths,
		pathCache: new Map(),
		disallowed,
		fetchedAt: Date.now(),
		raw: content,
	};

	robotsCache.set(domain, entry);
	return entry;
}

/**
 * Check if a given URL path is allowed by robots.txt.
 *
 * @param url - The full URL to check
 * @returns RobotsTxtResult with allowed status, reason, and matching rules
 */
export async function checkRobotsTxt(url: string): Promise<RobotsTxtResult> {
	const domain = getDomain(url);
	const path = getPath(url);

	// If we can't parse the domain, default-deny
	if (!domain) {
		return {
			allowed: false,
			reason: 'Invalid URL - cannot parse domain (default-deny policy)',
			rules: [],
			fetchedAt: null,
		};
	}

	const robotsEntry = await getRobotsForDomain(domain);

	// If no robots.txt was found, default-deny
	if (robotsEntry.raw === null) {
		return {
			allowed: false,
			reason: 'Could not fetch robots.txt (default-deny policy)',
			rules: [],
			fetchedAt: robotsEntry.fetchedAt ? new Date(robotsEntry.fetchedAt) : null,
		};
	}

	const result = isPathAllowed(path, robotsEntry.allowedPaths, robotsEntry.disallowed);

	return {
		allowed: result.allowed,
		reason: result.reason,
		rules: result.matchingRules,
		fetchedAt: robotsEntry.fetchedAt ? new Date(robotsEntry.fetchedAt) : null,
	};
}

/**
 * Clear the robots.txt cache.
 * Useful for testing or forcing fresh fetches.
 */
export function clearRobotsCache(): void {
	robotsCache.clear();
}

/**
 * Get cache statistics.
 */
export function getCacheStats(): {
	size: number;
	entries: { domain: string; age: string; hasRobots: boolean }[];
} {
	const now = Date.now();
	const entries = Array.from(robotsCache.entries()).map(([domain, entry]) => ({
		domain,
		age: `${Math.round((now - entry.fetchedAt) / 1000)}s`,
		hasRobots: entry.raw !== null,
	}));

	return {
		size: robotsCache.size,
		entries,
	};
}
