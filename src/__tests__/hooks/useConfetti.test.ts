import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useConfetti } from '@/hooks/useConfetti';

describe('useConfetti', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('should start inactive', () => {
		const { result } = renderHook(() => useConfetti());
		expect(result.current.active).toBe(false);
	});

	it('should activate on trigger', () => {
		const { result } = renderHook(() => useConfetti());
		act(() => result.current.trigger('lesson-complete'));
		expect(result.current.active).toBe(true);
	});

	it('should stop on stop call', () => {
		const { result } = renderHook(() => useConfetti());
		act(() => result.current.trigger('lesson-complete'));
		act(() => result.current.stop());
		expect(result.current.active).toBe(false);
	});

	it('should set config correctly on trigger', () => {
		const { result } = renderHook(() => useConfetti());
		act(() => result.current.trigger('quiz-perfect', ['#ff0000', '#00ff00']));
		expect(result.current.config.type).toBe('quiz-perfect');
		expect(result.current.config.colors).toEqual(['#ff0000', '#00ff00']);
	});

	it('should return correct config for each type', () => {
		const { result } = renderHook(() => useConfetti());

		const lessonConfig = result.current.getConfig('lesson-complete');
		expect(lessonConfig.particleCount).toBe(50);
		expect(lessonConfig.duration).toBe(2000);

		const quizConfig = result.current.getConfig('quiz-perfect');
		expect(quizConfig.particleCount).toBe(100);
		expect(quizConfig.duration).toBe(3000);

		const streakConfig = result.current.getConfig('streak-milestone');
		expect(streakConfig.particleCount).toBe(75);
		expect(streakConfig.duration).toBe(2500);

		const dailyConfig = result.current.getConfig('daily-first');
		expect(dailyConfig.particleCount).toBe(30);
		expect(dailyConfig.duration).toBe(1500);
	});
});
