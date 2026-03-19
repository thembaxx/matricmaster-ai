'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateTextWithAI } from '@/lib/ai/provider';
import { type StreamChunk, webllmEngine } from '@/lib/webllm/engine';

interface OfflineAIState {
	isModelReady: boolean;
	downloadProgress: number;
	isOffline: boolean;
	isSupported: boolean;
	isUsingWorker: boolean;
	initialize: () => Promise<void>;
	setOnlineStatus: (isOnline: boolean) => void;
	generateText: (prompt: string) => Promise<string>;
	streamGenerate: (prompt: string, onChunk: (chunk: StreamChunk) => void) => Promise<void>;
	abort: () => void;
}

export const useOfflineAIStore = create<OfflineAIState>()(
	persist(
		(set, get) => ({
			isModelReady: false,
			downloadProgress: 0,
			isOffline: false,
			isSupported: true,
			isUsingWorker: false,

			initialize: async () => {
				if (!webllmEngine.isSupported()) {
					set({ isSupported: false, downloadProgress: 0 });
					return;
				}

				try {
					await webllmEngine.initialize((progress) => {
						set({ downloadProgress: progress });
					});
					set({
						isModelReady: true,
						downloadProgress: 100,
						isUsingWorker: webllmEngine.isUsingWorker(),
					});
				} catch (error) {
					console.debug('WebLLM init failed:', error);
					set({ isSupported: false, downloadProgress: 0 });
				}
			},

			setOnlineStatus: (isOnline: boolean) => {
				set({ isOffline: !isOnline });
			},

			generateText: async (prompt: string) => {
				const state = get();

				if (state.isModelReady && state.isSupported) {
					try {
						return await webllmEngine.generate(prompt);
					} catch (error) {
						console.debug('Offline AI failed, falling back to remote:', error);
					}
				}

				return generateTextWithAI({
					prompt,
					system:
						'You are a helpful South African matric study assistant. Answer questions about NSC curriculum, university admissions, and study tips.',
				});
			},

			streamGenerate: async (prompt: string, onChunk: (chunk: StreamChunk) => void) => {
				const state = get();

				if (state.isModelReady && state.isSupported) {
					try {
						for await (const chunk of webllmEngine.streamGenerate(prompt)) {
							onChunk(chunk);
							if (chunk.done) break;
						}
						return;
					} catch (error) {
						console.debug('Offline AI stream failed, falling back to remote:', error);
					}
				}

				const result = await generateTextWithAI({
					prompt,
					system:
						'You are a helpful South African matric study assistant. Answer questions about NSC curriculum, university admissions, and study tips.',
				});
				onChunk({ content: result, done: true });
			},

			abort: () => {
				webllmEngine.abort();
			},
		}),
		{
			name: 'offline-ai-store',
			partialize: (state) => ({
				isModelReady: state.isModelReady,
				isUsingWorker: state.isUsingWorker,
			}),
		}
	)
);
