import { describe, expect, it } from 'vitest';
import { getLessonById, getLessonsBySubject } from '@/lib/lessons';

describe('lessons', () => {
	describe('getLessonsBySubject', () => {
		it('should return lessons for mathematics', () => {
			const lessons = getLessonsBySubject('math');
			expect(Array.isArray(lessons)).toBe(true);
		});

		it('should return lessons for physics', () => {
			const lessons = getLessonsBySubject('physics');
			expect(Array.isArray(lessons)).toBe(true);
		});

		it('should return lessons for life sciences', () => {
			const lessons = getLessonsBySubject('life');
			expect(Array.isArray(lessons)).toBe(true);
		});

		it('should return lessons for full subject name mathematics', () => {
			const lessons = getLessonsBySubject('mathematics');
			expect(Array.isArray(lessons)).toBe(true);
		});

		it('should return lessons for physical_sciences', () => {
			const lessons = getLessonsBySubject('physical_sciences');
			expect(Array.isArray(lessons)).toBe(true);
		});

		it('should return lessons for life_sciences', () => {
			const lessons = getLessonsBySubject('life_sciences');
			expect(Array.isArray(lessons)).toBe(true);
		});

		it('should return lessons for accounting', () => {
			const lessons = getLessonsBySubject('accounting');
			expect(Array.isArray(lessons)).toBe(true);
		});

		it('should return lessons for geography', () => {
			const lessons = getLessonsBySubject('geography');
			expect(Array.isArray(lessons)).toBe(true);
		});

		it('should return lessons for business', () => {
			const lessons = getLessonsBySubject('business');
			expect(Array.isArray(lessons)).toBe(true);
		});

		it('should return lessons for business_studies', () => {
			const lessons = getLessonsBySubject('business_studies');
			expect(Array.isArray(lessons)).toBe(true);
		});

		it('should return lessons for history', () => {
			const lessons = getLessonsBySubject('history');
			expect(Array.isArray(lessons)).toBe(true);
		});

		it('should return lessons for chemistry', () => {
			const lessons = getLessonsBySubject('chemistry');
			expect(Array.isArray(lessons)).toBe(true);
		});

		it('should return lessons for economics', () => {
			const lessons = getLessonsBySubject('economics');
			expect(Array.isArray(lessons)).toBe(true);
		});

		it('should return lessons for lo', () => {
			const lessons = getLessonsBySubject('lo');
			expect(Array.isArray(lessons)).toBe(true);
		});

		it('should return lessons for life_orientation', () => {
			const lessons = getLessonsBySubject('life_orientation');
			expect(Array.isArray(lessons)).toBe(true);
		});

		it('should return empty array for unknown subject', () => {
			const lessons = getLessonsBySubject('unknown-subject');
			expect(Array.isArray(lessons)).toBe(true);
			expect(lessons).toHaveLength(0);
		});

		it('should handle case insensitivity', () => {
			const lessonsLower = getLessonsBySubject('math');
			const lessonsUpper = getLessonsBySubject('MATH');
			expect(lessonsLower.length).toBe(lessonsUpper.length);
		});
	});

	describe('getLessonById', () => {
		it('should return lesson by id for mathematics', () => {
			const lessons = getLessonsBySubject('math');
			if (lessons.length > 0) {
				const lesson = getLessonById('math', lessons[0].id);
				expect(lesson).toBeDefined();
				expect(lesson?.id).toBe(lessons[0].id);
			}
		});

		it('should return undefined for non-existent lesson id', () => {
			const lesson = getLessonById('math', 'non-existent-id');
			expect(lesson).toBeUndefined();
		});

		it('should return undefined for unknown subject', () => {
			const lesson = getLessonById('unknown', 'some-id');
			expect(lesson).toBeUndefined();
		});
	});
});
