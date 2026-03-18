import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useHaptics } from '@/hooks/useHaptics';

describe('useHaptics', () => {
	let vibrateMock: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		vibrateMock = vi.fn();
		Object.defineProperty(navigator, 'vibrate', {
			value: vibrateMock,
			writable: true,
			configurable: true,
		});
		vi.clearAllMocks();
		localStorage.clear();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('should return isSupported based on navigator.vibrate', () => {
		const { result } = renderHook(() => useHaptics());
		expect(result.current.isSupported).toBe(true);
	});

	it('should trigger vibration when enabled', () => {
		const { result } = renderHook(() => useHaptics());
		act(() => result.current.trigger('success'));
		expect(vibrateMock).toHaveBeenCalledWith([30, 50, 30]);
	});

	it('should trigger achievement pattern correctly', () => {
		const { result } = renderHook(() => useHaptics());
		act(() => result.current.trigger('achievement'));
		expect(vibrateMock).toHaveBeenCalledWith([50, 100, 50, 100, 100]);
	});

	it('should trigger light pattern correctly', () => {
		const { result } = renderHook(() => useHaptics());
		act(() => result.current.trigger('light'));
		expect(vibrateMock).toHaveBeenCalledWith([10]);
	});

	it('should not trigger when disabled', () => {
		const { result } = renderHook(() => useHaptics());
		act(() => result.current.setEnabled(false));
		act(() => result.current.trigger('success'));
		expect(vibrateMock).not.toHaveBeenCalled();
	});

	it('should persist preference to localStorage', () => {
		const { result } = renderHook(() => useHaptics());
		act(() => result.current.setEnabled(false));
		expect(localStorage.getItem('haptics-enabled')).toBe('false');
	});

	it('should load preference from localStorage', () => {
		localStorage.setItem('haptics-enabled', 'false');
		const { result } = renderHook(() => useHaptics());
		expect(result.current.enabled).toBe(false);
	});

	it('should not throw when trigger is called', () => {
		const { result } = renderHook(() => useHaptics());
		expect(() => act(() => result.current.trigger('success'))).not.toThrow();
	});
});
