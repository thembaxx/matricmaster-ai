import { describe, it, expect } from 'vitest';
import { buildQuizUrl, parseQuizUrl } from './url-utils';

describe('url-utils', () => {
	it('builds a subject URL', () => {
		const url = buildQuizUrl({ subject: 'physics' });
		expect(url).toBe('/quiz/physics');
	});

	it('builds a category URL', () => {
		const url = buildQuizUrl({ subject: 'physics', category: 'mechanics' });
		expect(url).toBe('/quiz/physics/mechanics');
	});

	it('includes extra params in query string', () => {
		const url = buildQuizUrl({ subject: 'physics', difficulty: 'advanced', limit: 5 });
		expect(url).toBe('/quiz/physics?difficulty=advanced&limit=5');
	});

	it('parses a subject URL', () => {
		const params = parseQuizUrl('/quiz/physics', new URLSearchParams());
		expect(params.subject).toBe('physics');
	});
});
