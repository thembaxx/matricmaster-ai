import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FocusModeState {
	isEnabled: boolean;
	toggle: () => void;
	enable: () => void;
	disable: () => void;
}

const createFocusModeStore = () =>
	create<FocusModeState>()(
		persist(
			(set) => ({
				isEnabled: false,
				toggle: () => set((state) => ({ isEnabled: !state.isEnabled })),
				enable: () => set({ isEnabled: true }),
				disable: () => set({ isEnabled: false }),
			}),
			{ name: 'focus-mode-storage' }
		)
	);

describe('useFocusMode', () => {
	beforeEach(() => {
		localStorage.clear();
		vi.restoreAllMocks();
	});

	afterEach(() => {
		localStorage.clear();
		vi.restoreAllMocks();
	});

	describe('initialization', () => {
		it('should initialize with isEnabled as false', () => {
			const useFocusMode = createFocusModeStore();
			const { result } = renderHook(() => useFocusMode());

			expect(result.current.isEnabled).toBe(false);
		});

		it('should load persisted state from localStorage', () => {
			localStorage.setItem(
				'focus-mode-storage',
				JSON.stringify({ state: { isEnabled: true }, version: 0 })
			);

			const useFocusMode = createFocusModeStore();
			const { result } = renderHook(() => useFocusMode());

			expect(result.current.isEnabled).toBe(true);
		});
	});

	describe('enable/disable functions', () => {
		it('should enable focus mode', () => {
			const useFocusMode = createFocusModeStore();
			const { result } = renderHook(() => useFocusMode());

			act(() => result.current.enable());

			expect(result.current.isEnabled).toBe(true);
		});

		it('should disable focus mode', () => {
			const useFocusMode = createFocusModeStore();
			const { result } = renderHook(() => useFocusMode());

			act(() => result.current.enable());
			act(() => result.current.disable());

			expect(result.current.isEnabled).toBe(false);
		});

		it('should toggle focus mode from disabled to enabled', () => {
			const useFocusMode = createFocusModeStore();
			const { result } = renderHook(() => useFocusMode());

			act(() => result.current.toggle());

			expect(result.current.isEnabled).toBe(true);
		});

		it('should toggle focus mode from enabled to disabled', () => {
			const useFocusMode = createFocusModeStore();
			const { result } = renderHook(() => useFocusMode());

			act(() => result.current.enable());
			act(() => result.current.toggle());

			expect(result.current.isEnabled).toBe(false);
		});
	});

	describe('persistence to localStorage', () => {
		it('should persist enabled state to localStorage', () => {
			const useFocusMode = createFocusModeStore();
			const { result } = renderHook(() => useFocusMode());

			act(() => result.current.enable());

			const stored = localStorage.getItem('focus-mode-storage');
			expect(stored).toBeTruthy();

			const parsed = JSON.parse(stored!);
			expect(parsed.state.isEnabled).toBe(true);
		});

		it('should persist disabled state to localStorage', () => {
			const useFocusMode = createFocusModeStore();
			const { result } = renderHook(() => useFocusMode());

			act(() => result.current.enable());
			act(() => result.current.disable());

			const stored = localStorage.getItem('focus-mode-storage');
			expect(stored).toBeTruthy();

			const parsed = JSON.parse(stored!);
			expect(parsed.state.isEnabled).toBe(false);
		});

		it('should persist toggle to localStorage', () => {
			const useFocusMode = createFocusModeStore();
			const { result } = renderHook(() => useFocusMode());

			act(() => result.current.toggle());

			const stored = localStorage.getItem('focus-mode-storage');
			expect(stored).toBeTruthy();

			const parsed = JSON.parse(stored!);
			expect(parsed.state.isEnabled).toBe(true);
		});
	});

	describe('edge cases', () => {
		it('should handle multiple toggles correctly', () => {
			const useFocusMode = createFocusModeStore();
			const { result } = renderHook(() => useFocusMode());

			act(() => result.current.toggle());
			expect(result.current.isEnabled).toBe(true);

			act(() => result.current.toggle());
			expect(result.current.isEnabled).toBe(false);

			act(() => result.current.toggle());
			expect(result.current.isEnabled).toBe(true);
		});

		it('should handle rapid enable/disable', () => {
			const useFocusMode = createFocusModeStore();
			const { result } = renderHook(() => useFocusMode());

			act(() => result.current.enable());
			act(() => result.current.disable());
			act(() => result.current.enable());
			act(() => result.current.disable());

			expect(result.current.isEnabled).toBe(false);
		});

		it('should have toggle, enable, and disable as functions', () => {
			const useFocusMode = createFocusModeStore();
			const { result } = renderHook(() => useFocusMode());

			expect(typeof result.current.toggle).toBe('function');
			expect(typeof result.current.enable).toBe('function');
			expect(typeof result.current.disable).toBe('function');
		});
	});
});
