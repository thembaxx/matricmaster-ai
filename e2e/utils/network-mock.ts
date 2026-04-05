import type { Page, Route } from '@playwright/test';

export type MockResponse<T = unknown> = {
	status?: number;
	contentType?: string;
	body?: T;
	headers?: Record<string, string>;
	delay?: number;
};

export interface ApiMock {
	url: string | RegExp;
	method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
	response: MockResponse;
}

export async function mockApiResponses(page: Page, mocks: ApiMock[]) {
	const routes: Promise<Route>[] = [];

	for (const mock of mocks) {
		const routePromise = page.route(mock.url, async (route) => {
			const {
				status = 200,
				contentType = 'application/json',
				body,
				headers = {},
				delay,
			} = mock.response;

			if (delay) {
				await new Promise((resolve) => setTimeout(resolve, delay));
			}

			await route.fulfill({
				status,
				headers: {
					'content-type': contentType,
					...headers,
				},
				body: body ? JSON.stringify(body) : undefined,
			});
		});
		routes.push(routePromise);
	}

	await Promise.all(routes);
}

export function createSuccessResponse<T>(data: T): MockResponse<T> {
	return {
		status: 200,
		body: data,
	};
}

export function createErrorResponse(
	message: string,
	status = 400
): MockResponse<{ error: string }> {
	return {
		status,
		body: { error: message },
	};
}

export function create401Response(): MockResponse<{ error: string; code: 'UNAUTHORIZED' }> {
	return {
		status: 401,
		body: { error: 'Unauthorized', code: 'UNAUTHORIZED' },
	};
}

export function create500Response(
	message = 'Internal Server Error'
): MockResponse<{ error: string }> {
	return {
		status: 500,
		body: { error: message },
	};
}

export const commonApiMocks = {
	quizGenerate: {
		url: '/api/quiz/generate',
		method: 'POST',
		response: createSuccessResponse({
			id: 'quiz-123',
			questions: [
				{
					id: 'q1',
					question: 'What is 2 + 2?',
					options: ['3', '4', '5', '6'],
					correctAnswer: 1,
				},
			],
		}),
	},
	flashcards: {
		url: '/api/flashcards/decks',
		response: createSuccessResponse([
			{ id: 'deck-1', name: 'Mathematics', cardCount: 25 },
			{ id: 'deck-2', name: 'Physics', cardCount: 30 },
		]),
	},
	progress: {
		url: '/api/progress/stats',
		response: createSuccessResponse({
			totalXP: 1500,
			streak: 7,
			completedLessons: 42,
		}),
	},
	aiChat: {
		url: '/api/ai-chat',
		method: 'POST',
		response: createSuccessResponse({
			message: 'I can help you with that!',
			suggestions: ['Learn more', 'Take a quiz'],
		}),
	},
	search: {
		url: '/api/search',
		response: createSuccessResponse({
			results: [
				{ title: 'Quadratic Equations', type: 'lesson', url: '/lessons/math/quadratic' },
				{ title: 'Past Paper 2023', type: 'past-paper', url: '/past-papers/2023' },
			],
		}),
	},
};

export async function interceptAndMock(
	page: Page,
	urlPattern: string | RegExp,
	options: {
		status?: number;
		body?: unknown;
		headers?: Record<string, string>;
		delay?: number;
	} = {}
) {
	await page.route(urlPattern, async (route) => {
		const { status = 200, body, headers = {}, delay } = options;

		if (delay) {
			await new Promise((resolve) => setTimeout(resolve, delay));
		}

		await route.fulfill({
			status,
			headers: {
				'content-type': 'application/json',
				...headers,
			},
			body: body ? JSON.stringify(body) : undefined,
		});
	});
}
