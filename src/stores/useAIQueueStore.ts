'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type QueuedAIRequest = {
	id: string;
	type: 'snap-and-solve' | 'ai-tutor' | 'essay-grader';
	payload: Record<string, unknown>;
	status: 'pending' | 'processing' | 'completed' | 'failed';
	result?: string;
	createdAt: number;
	completedAt?: number;
	error?: string;
};

interface AIQueueStore {
	queue: QueuedAIRequest[];
	isOnline: boolean;
	addToQueue: (request: Omit<QueuedAIRequest, 'id' | 'status' | 'createdAt'>) => string;
	processQueue: () => Promise<void>;
	markComplete: (id: string, result: string) => void;
	markFailed: (id: string, error: string) => void;
	removeFromQueue: (id: string) => void;
	clearCompleted: () => void;
	setOnlineStatus: (isOnline: boolean) => void;
	getPendingCount: () => number;
}

export const useAIQueueStore = create<AIQueueStore>()(
	persist(
		(set, get) => ({
			queue: [],
			isOnline: true,

			addToQueue: (request) => {
				const id = `queue-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
				const newRequest: QueuedAIRequest = {
					...request,
					id,
					status: 'pending',
					createdAt: Date.now(),
				};

				set((state) => ({
					queue: [...state.queue, newRequest],
				}));

				if (get().isOnline) {
					get().processQueue();
				}

				return id;
			},

			processQueue: async () => {
				const { queue, isOnline } = get();
				if (!isOnline) return;

				const pending = queue.filter((r) => r.status === 'pending');

				for (const request of pending) {
					set((state) => ({
						queue: state.queue.map((r) =>
							r.id === request.id ? { ...r, status: 'processing' as const } : r
						),
					}));

					try {
						let endpoint = '/api/ai-tutor';
						const method = 'POST';

						switch (request.type) {
							case 'snap-and-solve':
								endpoint = '/api/snap-and-solve';
								break;
							case 'essay-grader':
								endpoint = '/api/ai-tutor/essay-grader';
								break;
							default:
								endpoint = '/api/ai-tutor';
						}

						const response = await fetch(endpoint, {
							method,
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify(request.payload),
						});

						if (!response.ok) {
							throw new Error(`HTTP ${response.status}`);
						}

						const data = await response.json();
						const result = data.response || data.solution || JSON.stringify(data);

						get().markComplete(request.id, result);

						if (typeof window !== 'undefined' && 'Notification' in window) {
							if (Notification.permission === 'granted') {
								new Notification('MatricMaster AI', {
									body: 'Your AI response is ready!',
									icon: '/icon.png',
								});
							}
						}
					} catch (error) {
						get().markFailed(request.id, error instanceof Error ? error.message : 'Unknown error');
					}
				}
			},

			markComplete: (id, result) => {
				set((state) => ({
					queue: state.queue.map((r) =>
						r.id === id
							? { ...r, status: 'completed' as const, result, completedAt: Date.now() }
							: r
					),
				}));
			},

			markFailed: (id, error) => {
				set((state) => ({
					queue: state.queue.map((r) =>
						r.id === id ? { ...r, status: 'failed' as const, error, completedAt: Date.now() } : r
					),
				}));
			},

			removeFromQueue: (id) => {
				set((state) => ({
					queue: state.queue.filter((r) => r.id !== id),
				}));
			},

			clearCompleted: () => {
				set((state) => ({
					queue: state.queue.filter((r) => r.status !== 'completed' && r.status !== 'failed'),
				}));
			},

			setOnlineStatus: (isOnline) => {
				set({ isOnline });
				if (isOnline) {
					get().processQueue();
				}
			},

			getPendingCount: () => {
				return get().queue.filter((r) => r.status === 'pending' || r.status === 'processing')
					.length;
			},
		}),
		{
			name: 'ai-queue-storage',
			partialize: (state) => ({
				queue: state.queue,
			}),
		}
	)
);
