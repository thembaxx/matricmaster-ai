import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { useFocusMode } from '@/hooks/useFocusMode';

describe('useFocusMode', () => {
	beforeEach(() => {
		localStorage.clear();
	});

	afterEach(() => {
		localStorage.clear();
	});

	it('should initialize with isEnabled false', () => {
		const { result } = renderHook(() => useFocusMode());
		expect(result.current.isEnabled).toBe(false);
	});

	it('should toggle focus mode', () => {
		const { result } = renderHook(() => useFocusMode());

		act(() => {
			result.current.toggle();
		});

		expect(result.current.isEnabled).toBe(true);

		act(() => {
			result.current.toggle();
		});

		expect(result.current.isEnabled).toBe(false);
	});

	it('should enable focus mode', () => {
		const { result } = renderHook(() => useFocusMode());

		act(() => {
			result.current.enable();
		});

		expect(result.current.isEnabled).toBe(true);
	});

	it('should disable focus mode', () => {
		const { result } = renderHook(() => useFocusMode());

		act(() => {
			result.current.enable();
		});

		expect(result.current.isEnabled).toBe(true);

		act(() => {
			result.current.disable();
		});

		expect(result.current.isEnabled).toBe(false);
	});

	it('should persist focus mode state', () => {
		const { result: result1 } = renderHook(() => useFocusMode());

		act(() => {
			result1.current.enable();
		});

		expect(localStorage.getItem('focus-mode-storage')).toBeTruthy();

		const { result: result2 } = renderHook(() => useFocusMode());
		expect(result2.current.isEnabled).toBe(true);
	});

	it('should restore persisted state on new hook instance', () => {
		localStorage.setItem(
			'focus-mode-storage',
			JSON.stringify({ state: { isEnabled: true }, version: 0 })
		);

		const { result } = renderHook(() => useFocusMode());
		expect(result.current.isEnabled).toBe(true);
	});
});
