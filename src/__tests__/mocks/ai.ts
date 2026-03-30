import { vi } from 'vitest';

export interface MockTextResponse {
	text: string;
	finishReason: string;
	usage: {
		promptTokens: number;
		completionTokens: number;
		totalTokens: number;
	};
}

export interface MockObjectResponse<T> {
	object: T;
	finishReason: string;
	usage: {
		promptTokens: number;
		completionTokens: number;
		totalTokens: number;
	};
}

export interface MockStreamTextResponse {
	text: string;
	finishReason: string;
	usage: {
		promptTokens: number;
		completionTokens: number;
		totalTokens: number;
	};
}

export const mockTutoringResponse = {
	text: `Great question! Let me help you understand this concept.

**Key Points:**
1. First, identify what the question is asking
2. Apply the relevant formula or concept
3. Show all your working steps

**Example:**
If we have 2x + 5 = 15, then:
- Subtract 5 from both sides: 2x = 10
- Divide by 2: x = 5

**Tip:** Always check your answer by substituting back into the original equation.

Would you like me to explain any part in more detail?`,
	finishReason: 'stop',
	usage: {
		promptTokens: 50,
		completionTokens: 150,
		totalTokens: 200,
	},
};

export const mockGradingResponse = {
	object: {
		score: 85,
		feedback: 'Excellent work! Your answer shows a good understanding of the concept.',
		breakdown: {
			correctness: 90,
			completeness: 80,
			clarity: 85,
		},
		corrections: [],
	},
	finishReason: 'stop',
	usage: {
		promptTokens: 100,
		completionTokens: 50,
		totalTokens: 150,
	},
};

export const mockRecommendationsResponse = {
	object: {
		recommendedTopics: [
			{
				topic: 'Quadratic Equations',
				priority: 'high',
				reason: 'Based on your recent quiz performance, this topic needs more practice.',
			},
			{
				topic: 'Linear Inequalities',
				priority: 'medium',
				reason: 'Good progress, but keep practicing to master this topic.',
			},
		],
		studyPlan: {
			dailyGoal: 'Complete 5 quadratic equation problems',
			weeklyTarget: 'Master the quadratic formula',
		},
	},
	finishReason: 'stop',
	usage: {
		promptTokens: 80,
		completionTokens: 70,
		totalTokens: 150,
	},
};

export const mockGenerateText = vi.fn().mockResolvedValue(mockTutoringResponse);

export const mockGenerateObject = vi.fn().mockResolvedValue(mockGradingResponse);

export const mockStreamText = vi.fn().mockResolvedValue({
	text: mockTutoringResponse.text,
	finishReason: mockTutoringResponse.finishReason,
	usage: mockTutoringResponse.usage,
});

export function createMockGenerateText(
	text: string,
	options?: Partial<MockTextResponse>
): MockTextResponse {
	return {
		text,
		finishReason: 'stop',
		usage: {
			promptTokens: 50,
			completionTokens: Math.ceil(text.length / 4),
			totalTokens: 50 + Math.ceil(text.length / 4),
		},
		...options,
	};
}

export function createMockGenerateObject<T>(
	obj: T,
	options?: Partial<MockObjectResponse<T>>
): MockObjectResponse<T> {
	return {
		object: obj,
		finishReason: 'stop',
		usage: {
			promptTokens: 50,
			completionTokens: 50,
			totalTokens: 100,
		},
		...options,
	};
}

export function createTutoringResponse(
	overrides: Partial<MockTextResponse> = {}
): MockTextResponse {
	return {
		...mockTutoringResponse,
		...overrides,
	};
}

export function createGradingResponse<T>(
	grade: T,
	overrides: Partial<MockObjectResponse<T>> = {}
): MockObjectResponse<T> {
	return createMockGenerateObject(grade, overrides);
}

export function createRecommendationsResponse(
	overrides: Partial<MockObjectResponse<typeof mockRecommendationsResponse.object>> = {}
): MockObjectResponse<typeof mockRecommendationsResponse.object> {
	return createMockGenerateObject(mockRecommendationsResponse.object, overrides);
}

export function setupAiMocks() {
	vi.mock('ai', () => ({
		generateText: mockGenerateText,
		generateObject: mockGenerateObject,
		streamText: mockStreamText,
	}));

	vi.mock('@/lib/ai/provider', () => ({
		generateText: mockGenerateText,
		generateObject: mockGenerateObject,
		streamText: mockStreamText,
		getApiKey: vi.fn().mockReturnValue('mock-api-key'),
		getModel: vi.fn().mockReturnValue('gemini-2.5-flash'),
	}));
}

export function resetAiMocks() {
	mockGenerateText.mockReset();
	mockGenerateObject.mockReset();
	mockStreamText.mockReset();
}

export function setMockGenerateTextResponse(response: MockTextResponse) {
	mockGenerateText.mockResolvedValue(response);
}

export function setMockGenerateObjectResponse<T>(response: MockObjectResponse<T>) {
	mockGenerateObject.mockResolvedValue(response);
}

export function setMockGenerateTextError(error: Error) {
	mockGenerateText.mockRejectedValue(error);
}

export function setMockGenerateObjectError(error: Error) {
	mockGenerateObject.mockRejectedValue(error);
}
