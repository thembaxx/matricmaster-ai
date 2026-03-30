import { describe, expect, it, vi } from 'vitest';
import { fetchWithRetry, retry } from '@/lib/retry';

describe('retry', () => {
	describe('fetchWithRetry', () => {
		it('should succeed on first attempt', async () => {
			const mockResponse = {
				ok: true,
				status: 200,
				json: () => Promise.resolve({ data: 'test' }),
			} as unknown as Response;

			globalThis.fetch = vi.fn().mockResolvedValueOnce(mockResponse);

			const result = await fetchWithRetry('https://api.example.com/data');
			expect(result.ok).toBe(true);
		});

		it('should return response for 4xx errors without retry', async () => {
			const mockResponse = {
				ok: false,
				status: 400,
			} as unknown as Response;

			globalThis.fetch = vi.fn().mockResolvedValueOnce(mockResponse);

			const result = await fetchWithRetry('https://api.example.com/data');
			expect(result.status).toBe(400);
			expect(globalThis.fetch).toHaveBeenCalledTimes(1);
		});

		it('should throw on 5xx error without proper retry setup', async () => {
			const errorResponse = {
				ok: false,
				status: 500,
			} as unknown as Response;

			globalThis.fetch = vi.fn().mockResolvedValueOnce(errorResponse);

			// Without a successful retry, it throws
			await expect(fetchWithRetry('https://api.example.com/data', {}, 1, 10)).rejects.toThrow();
		});

		it('should throw after max retries exceeded', async () => {
			globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

			await expect(fetchWithRetry('https://api.example.com/data', {}, 2, 10)).rejects.toThrow(
				'Network error'
			);
		});
	});

	describe('retry', () => {
		it('should succeed on first attempt', async () => {
			const fn = vi.fn().mockResolvedValue('success');
			const result = await retry(fn, 3, 10);
			expect(result).toBe('success');
			expect(fn).toHaveBeenCalledTimes(1);
		});

		it('should succeed after retrying on network error', async () => {
			const fn = vi
				.fn()
				.mockRejectedValueOnce(new Error('network error'))
				.mockResolvedValue('success');

			const result = await retry(fn, 3, 10);
			expect(result).toBe('success');
			expect(fn).toHaveBeenCalledTimes(2);
		});

		it('should throw after max retries exceeded', async () => {
			const fn = vi.fn().mockRejectedValue(new Error('network error'));

			await expect(retry(fn, 2, 10)).rejects.toThrow('network error');
		});

		it('should throw immediately on non-retryable errors', async () => {
			const fn = vi.fn().mockRejectedValue(new Error('TypeError: something specific'));

			await expect(retry(fn, 3, 10)).rejects.toThrow();
		});

		it('should succeed after retrying on timeout error', async () => {
			const fn = vi
				.fn()
				.mockRejectedValueOnce(new Error('timeout error'))
				.mockResolvedValue('success');

			const result = await retry(fn, 3, 10);
			expect(result).toBe('success');
		});

		it('should succeed after retrying on connection refused', async () => {
			const fn = vi
				.fn()
				.mockRejectedValueOnce(new Error('ECONNREFUSED'))
				.mockResolvedValue('success');

			const result = await retry(fn, 3, 10);
			expect(result).toBe('success');
		});

		it('should succeed after retrying on aborted fetch', async () => {
			const fn = vi.fn().mockRejectedValueOnce(new Error('aborted')).mockResolvedValue('success');

			const result = await retry(fn, 3, 10);
			expect(result).toBe('success');
		});
	});
});
