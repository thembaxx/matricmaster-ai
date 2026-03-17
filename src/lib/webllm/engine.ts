/* eslint-disable @typescript-eslint/no-explicit-any */
import { CreateMLCEngine, type InitProgressReport, type MLCEngine } from '@mlc-ai/web-llm';

let engine: MLCEngine | null = null;
let isInitializing = false;
let initPromise: Promise<void> | null = null;

const MODEL_NAME = 'Llama-3.1-8B-Instruct-q4f32_1-MLC-1k';

export class WebLLMEngine {
	private progress = 0;
	private _isReady = false;

	async initialize(onProgress?: (progress: number) => void): Promise<void> {
		if (this._isReady) return;
		if (isInitializing && initPromise) {
			return initPromise;
		}

		isInitializing = true;
		initPromise = this._doInitialize(onProgress);
		return initPromise;
	}

	private async _doInitialize(onProgress?: (progress: number) => void): Promise<void> {
		try {
			engine = await CreateMLCEngine(MODEL_NAME, {
				initProgressCallback: (info: InitProgressReport) => {
					this.progress = Math.round(info.progress * 100);
					onProgress?.(this.progress);
				},
			});
			this._isReady = true;
		} catch (error) {
			console.error('WebLLM init failed:', error);
			throw error;
		}
	}

	isReady(): boolean {
		return this._isReady;
	}

	getDownloadProgress(): number {
		return this.progress;
	}

	async generate(prompt: string): Promise<string> {
		if (!engine || !this._isReady) {
			throw new Error('WebLLM not initialized');
		}

		const messages = [
			{
				role: 'system' as const,
				content:
					'You are a helpful South African matric study assistant. Answer questions about NSC curriculum, university admissions, and study tips.',
			},
			{ role: 'user' as const, content: prompt },
		];

		const output = await engine.chat.completions.create({
			messages,
			temperature: 0.7,
			max_tokens: 1024,
		});

		return output.choices[0]?.message?.content || '';
	}
}

export const webllmEngine = new WebLLMEngine();
