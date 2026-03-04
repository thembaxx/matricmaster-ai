import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AI_MODELS, checkAIProviderHealth, createAIClient } from '@/lib/ai-config';

// Mock the Google Generative AI library
vi.mock('@google/generative-ai', () => ({
	GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
		getGenerativeModel: vi.fn().mockImplementation(() => ({
			generateContent: vi.fn().mockResolvedValue({
				response: {
					text: () => 'Test response',
				},
			}),
		})),
	})),
}));

describe('AI Configuration', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('createAIClient', () => {
		it('should return null when GEMINI_API_KEY is not set', () => {
			delete process.env.GEMINI_API_KEY;
			const client = createAIClient();
			expect(client).toBeNull();
		});

		it('should create client when GEMINI_API_KEY is set', () => {
			process.env.GEMINI_API_KEY = 'test-api-key';
			const client = createAIClient();
			expect(client).toBeDefined();
		});

		it('should log warning when API key is not configured', () => {
			const consoleSpy = vi.spyOn(console, 'warn');
			delete process.env.GEMINI_API_KEY;
			createAIClient();
			expect(consoleSpy).toHaveBeenCalledWith(
				'GEMINI_API_KEY not configured. AI features will be disabled.'
			);
		});
	});

	describe('AI_MODELS', () => {
		it('should have correct model hierarchy', () => {
			expect(AI_MODELS.PRIMARY).toBe('gemini-2.5-flash');
			expect(AI_MODELS.FALLBACK_1).toBe('gemini-2.0-pro');
			expect(AI_MODELS.FALLBACK_2).toBe('gemini-2.0-flash');
			expect(AI_MODELS.FALLBACK_3).toBe('gemini-1.5-pro');
			expect(AI_MODELS.FALLBACK_4).toBe('gemini-3.1-flash-lite');
		});
	});

	describe('checkAIProviderHealth', () => {
		it('should return unhealthy when API key is not configured', async () => {
			delete process.env.GEMINI_API_KEY;
			const result = await checkAIProviderHealth();
			expect(result.status).toBe('unhealthy');
			expect(result.error).toBe('AI client not configured');
		});

		it('should return healthy when API is working', async () => {
			process.env.GEMINI_API_KEY = 'test-api-key';
			const result = await checkAIProviderHealth();
			expect(result.status).toBe('healthy');
			expect(result.latency).toBeDefined();
			expect(typeof result.latency).toBe('number');
		});

		it('should return unhealthy when API fails', async () => {
			process.env.GEMINI_API_KEY = 'test-api-key';

			// Mock a failing API call
			const { GoogleGenerativeAI } = await import('@google/generative-ai');
			const mockClient = {
				getGenerativeModel: vi.fn().mockImplementation(() => ({
					generateContent: vi.fn().mockRejectedValue(new Error('API Error')),
				})),
			};
			// @ts-expect-error - Mocking a class for testing purposes
			GoogleGenerativeAI.mockImplementation(() => mockClient);

			const result = await checkAIProviderHealth();
			expect(result.status).toBe('unhealthy');
			expect(result.error).toBe('API Error');
			expect(result.latency).toBeDefined();
		});
	});
});
