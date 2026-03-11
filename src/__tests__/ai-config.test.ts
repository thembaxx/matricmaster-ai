import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AI_MODELS, checkAIProviderHealth, createAIClient } from '@/lib/ai-config';

// Mock the Google Generative AI library (legacy)
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

// Mock the new AI provider
vi.mock('@/lib/ai', () => ({
	generateTextWithAI: vi.fn().mockResolvedValue('Test response'),
	generateWithFallback: vi.fn().mockResolvedValue('Test response'),
	streamTextWithAI: vi.fn().mockReturnValue({}),
}));

describe('AI Configuration', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		process.env.GEMINI_API_KEY = 'test-api-key';
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
			expect(result.error).toBe('GEMINI_API_KEY not configured');
		});

		it('should return healthy when API is working', async () => {
			process.env.GEMINI_API_KEY = 'test-api-key';
			const { generateTextWithAI } = await import('@/lib/ai');
			(generateTextWithAI as any).mockResolvedValue('ok');

			const result = await checkAIProviderHealth();
			expect(result.status).toBe('healthy');
			expect(result.latency).toBeDefined();
			expect(typeof result.latency).toBe('number');
		});

		it('should return unhealthy when API fails', async () => {
			process.env.GEMINI_API_KEY = 'test-api-key';
			const { generateTextWithAI } = await import('@/lib/ai');
			(generateTextWithAI as any).mockRejectedValue(new Error('API Error'));

			const result = await checkAIProviderHealth();
			expect(result.status).toBe('unhealthy');
			expect(result.error).toBe('API Error');
			expect(result.latency).toBeDefined();
		});
	});
});
