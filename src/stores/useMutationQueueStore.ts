import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SerializedMutation {
	id: string;
	url: string;
	method: string;
	body: any;
	headers: Record<string, string>;
	timestamp: number;
}

interface MutationQueueState {
	queue: SerializedMutation[];
	isProcessing: boolean;
	addToQueue: (mutation: Omit<SerializedMutation, 'id' | 'timestamp'>) => void;
	removeFromQueue: (id: string) => void;
	setProcessing: (processing: boolean) => void;
	peek: () => SerializedMutation | null;
}

export const useMutationQueueStore = create<MutationQueueState>()(
	persist(
		(set, get) => ({
			queue: [],
			isProcessing: false,

			addToQueue: (mutation) => {
				const id = crypto.randomUUID();
				const timestamp = Date.now();
				set((state) => ({
					queue: [...state.queue, { ...mutation, id, timestamp }],
				}));
			},

			removeFromQueue: (id) => {
				set((state) => ({
					queue: state.queue.filter((m) => m.id !== id),
				}));
			},

			setProcessing: (processing) => set({ isProcessing: processing }),

			peek: () => {
				const { queue } = get();
				return queue.length > 0 ? queue[0] : null;
			},
		}),
		{
			name: 'matricmaster-mutation-queue',
		}
	)
);
