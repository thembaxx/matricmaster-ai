import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { checkRobotsTxt, clearRobotsCache, getCacheStats } from '@/lib/enrichment/robots-checker';

// ============================================================================
// MOCK SETUP
// ============================================================================

const mockFetch = vi.fn();

beforeEach(() => {
	mockFetch.mockReset();
	clearRobotsCache();
	vi.spyOn(globalThis, 'fetch').mockImplementation(mockFetch);
});

afterEach(() => {
	vi.restoreAllMocks();
});

// ============================================================================
// 1. SIMPLE ROBOTS.TXT PARSING
// ============================================================================

describe('robots-checker - simple robots.txt parsing', () => {
	it('should allow paths not in disallow list', async () => {
		mockFetch.mockResolvedValueOnce({
			ok: true,
			text: () =>
				Promise.resolve(`User-agent: *
Disallow: /admin
Disallow: /private
Allow: /
`),
		});

		const result = await checkRobotsTxt('https://example.com/public/page');

		expect(result.allowed).toBe(true);
	});

	it('should disallow paths in the disallow list', async () => {
		mockFetch.mockResolvedValueOnce({
			ok: true,
			text: () =>
				Promise.resolve(`User-agent: *
Disallow: /admin
Disallow: /private
`),
		});

		const result = await checkRobotsTxt('https://example.com/admin/settings');

		expect(result.allowed).toBe(false);
		expect(result.reason).toContain('Blocked');
	});

	it('should handle empty disallow (allow all)', async () => {
		mockFetch.mockResolvedValueOnce({
			ok: true,
			text: () =>
				Promise.resolve(`User-agent: *
Disallow:
`),
		});

		const result = await checkRobotsTxt('https://example.com/anything');

		expect(result.allowed).toBe(true);
	});

	it('should handle allow directives', async () => {
		mockFetch.mockResolvedValueOnce({
			ok: true,
			text: () =>
				Promise.resolve(`User-agent: *
Disallow: /
Allow: /public
`),
		});

		const result = await checkRobotsTxt('https://example.com/public/data');

		expect(result.allowed).toBe(true);
		expect(result.reason).toContain('Allowed');
	});
});

// ============================================================================
// 2. MOST-SPECIFIC-RULE-WINS LOGIC
// ============================================================================

describe('robots-checker - most-specific-rule-wins', () => {
	it('should prefer longer (more specific) allow rule', async () => {
		mockFetch.mockResolvedValueOnce({
			ok: true,
			text: () =>
				Promise.resolve(`User-agent: *
Disallow: /api
Allow: /api/public
`),
		});

		const result = await checkRobotsTxt('https://example.com/api/public/data');

		expect(result.allowed).toBe(true);
	});

	it('should prefer longer (more specific) disallow rule', async () => {
		mockFetch.mockResolvedValueOnce({
			ok: true,
			text: () =>
				Promise.resolve(`User-agent: *
Allow: /api
Disallow: /api/private
`),
		});

		const result = await checkRobotsTxt('https://example.com/api/private/secret');

		expect(result.allowed).toBe(false);
	});

	it('should deny when allow and disallow rules are equal length', async () => {
		mockFetch.mockResolvedValueOnce({
			ok: true,
			text: () =>
				Promise.resolve(`User-agent: *
Allow: /x
Disallow: /x
`),
		});

		const result = await checkRobotsTxt('https://example.com/x');

		expect(result.allowed).toBe(false);
	});
});

// ============================================================================
// 3. WILDCARD MATCHING
// ============================================================================

describe('robots-checker - wildcard matching', () => {
	it('should match wildcard patterns', async () => {
		mockFetch.mockResolvedValueOnce({
			ok: true,
			text: () =>
				Promise.resolve(`User-agent: *
Disallow: /tmp/*
`),
		});

		const result = await checkRobotsTxt('https://example.com/tmp/cache/file.txt');

		expect(result.allowed).toBe(false);
	});

	it('should not match paths that do not match wildcard pattern', async () => {
		mockFetch.mockResolvedValueOnce({
			ok: true,
			text: () =>
				Promise.resolve(`User-agent: *
Disallow: /tmp/*
Allow: /
`),
		});

		const result = await checkRobotsTxt('https://example.com/data/file.txt');

		expect(result.allowed).toBe(true);
	});

	it('should handle multiple wildcards', async () => {
		mockFetch.mockResolvedValueOnce({
			ok: true,
			text: () =>
				Promise.resolve(`User-agent: *
Disallow: /api/*/secret/*
`),
		});

		const result = await checkRobotsTxt('https://example.com/api/v1/secret/key');

		expect(result.allowed).toBe(false);
	});
});

// ============================================================================
// 4. CACHE BEHAVIOR
// ============================================================================

describe('robots-checker - cache behavior', () => {
	it('should cache successful fetches and return cached result on subsequent calls', async () => {
		mockFetch.mockResolvedValue({
			ok: true,
			text: () =>
				Promise.resolve(`User-agent: *
Disallow: /admin
`),
		});

		// First call - fetches
		const result1 = await checkRobotsTxt('https://example.com/admin');
		expect(mockFetch).toHaveBeenCalledTimes(1);

		// Second call - uses cache
		const result2 = await checkRobotsTxt('https://example.com/admin');
		expect(mockFetch).toHaveBeenCalledTimes(1); // Still 1, cached

		expect(result1.allowed).toBe(result2.allowed);
	});

	it('should return cache size and entries from getCacheStats', async () => {
		mockFetch.mockResolvedValueOnce({
			ok: true,
			text: () => Promise.resolve('User-agent: *\nDisallow:\n'),
		});

		await checkRobotsTxt('https://example.com/test');

		const stats = getCacheStats();
		expect(stats.size).toBe(1);
		expect(stats.entries).toHaveLength(1);
		expect(stats.entries[0].domain).toBe('https://example.com');
		expect(stats.entries[0].hasRobots).toBe(true);
	});
});

// ============================================================================
// 5. DEFAULT-DENY ON FETCH FAILURE
// ============================================================================

describe('robots-checker - default-deny on fetch failure', () => {
	it('should default-deny when robots.txt fetch fails', async () => {
		mockFetch.mockResolvedValueOnce({
			ok: false,
			status: 404,
			statusText: 'Not Found',
		});

		const result = await checkRobotsTxt('https://example.com/some-path');

		expect(result.allowed).toBe(false);
		expect(result.reason).toContain('default-deny');
	});

	it('should default-deny when fetch throws an error', async () => {
		mockFetch.mockRejectedValueOnce(new Error('Network error'));

		const result = await checkRobotsTxt('https://example.com/page');

		expect(result.allowed).toBe(false);
		expect(result.reason).toContain('default-deny');
	});

	it('should cache failed fetches to avoid repeated requests', async () => {
		mockFetch.mockResolvedValue({
			ok: false,
			status: 500,
			statusText: 'Server Error',
		});

		// First call - fails
		await checkRobotsTxt('https://example.com/page1');
		expect(mockFetch).toHaveBeenCalledTimes(1);

		// Second call - uses cached failure
		await checkRobotsTxt('https://example.com/page2');
		expect(mockFetch).toHaveBeenCalledTimes(1); // Still 1
	});
});

// ============================================================================
// 6. CLEAR CACHE FUNCTION
// ============================================================================

describe('robots-checker - clear cache', () => {
	it('should clear the cache and force fresh fetch', async () => {
		mockFetch.mockResolvedValue({
			ok: true,
			text: () => Promise.resolve('User-agent: *\nDisallow:\n'),
		});

		// First call
		await checkRobotsTxt('https://example.com/test');
		expect(mockFetch).toHaveBeenCalledTimes(1);

		// Clear cache
		clearRobotsCache();

		// Second call - should fetch again
		await checkRobotsTxt('https://example.com/test');
		expect(mockFetch).toHaveBeenCalledTimes(2);
	});

	it('should return empty stats after cache clear', async () => {
		clearRobotsCache();
		const stats = getCacheStats();

		expect(stats.size).toBe(0);
		expect(stats.entries).toHaveLength(0);
	});
});

// ============================================================================
// 7. EDGE CASES
// ============================================================================

describe('robots-checker - edge cases', () => {
	it('should handle invalid URLs', async () => {
		const result = await checkRobotsTxt('not-a-valid-url');

		expect(result.allowed).toBe(false);
		expect(result.reason).toContain('Invalid URL');
	});

	it('should handle user-agent specific rules matching our agent name', async () => {
		mockFetch.mockResolvedValueOnce({
			ok: true,
			text: () =>
				Promise.resolve(`User-agent: MatricMasterAI-Enrichment/1.0
Disallow:
`),
		});

		const result = await checkRobotsTxt('https://example.com/some-path');

		// Empty disallow for our specific agent means allow all
		expect(result.allowed).toBe(true);
	});

	it('should handle comments in robots.txt', async () => {
		mockFetch.mockResolvedValueOnce({
			ok: true,
			text: () =>
				Promise.resolve(`# This is a comment
User-agent: *
# Another comment
Disallow: /private
`),
		});

		const result = await checkRobotsTxt('https://example.com/private/data');

		expect(result.allowed).toBe(false);
	});
});
