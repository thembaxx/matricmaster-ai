import { describe, expect, it } from 'vitest';
import { convertPdfToMarkdown } from '../services/markdownConverter';
import { extractQuestionsFromMarkdown } from '../services/markdownExtractor';

// Mock the services if needed, but here we'll just test the structure
describe('Markdown Extraction', () => {
	it('should have convertPdfToMarkdown function', () => {
		expect(typeof convertPdfToMarkdown).toBe('function');
	});

	it('should have extractQuestionsFromMarkdown function', () => {
		expect(typeof extractQuestionsFromMarkdown).toBe('function');
	});
});
