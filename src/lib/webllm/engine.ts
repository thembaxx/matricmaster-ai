/* eslint-disable @typescript-eslint/no-explicit-any */
import { CreateMLCEngine, type InitProgressReport, type MLCEngine } from '@mlc-ai/web-llm';

const MODEL_NAME = 'Llama-3.2-1B-Instruct-q4f32_1-MLC';

export interface StreamChunk {
	content: string;
	done: boolean;
}

export type StreamCallback = (chunk: StreamChunk) => void;

class WebLLMEngineClass {
	private progress = 0;
	private _isReady = false;
	private _isSupported = true;
	private _useWorker = false;
	private worker: Worker | null = null;
	private legacyEngine: MLCEngine | null = null;
	private pendingStreamCallback: StreamCallback | null = null;
	private messageId = 0;

	async initialize(onProgress?: (progress: number) => void): Promise<void> {
		if (!this._isSupported) {
			console.debug('WebGPU not supported, skipping WebLLM initialization');
			return;
		}

		if (this._isReady) return;

		try {
			const gpu = (navigator as unknown as { gpu?: { requestAdapter: () => Promise<unknown> } })
				.gpu;
			if (!gpu) {
				this._isSupported = false;
				console.debug('WebGPU not available in browser');
				return;
			}

			const adapter = await gpu.requestAdapter();
			if (!adapter) {
				this._isSupported = false;
				console.debug('No WebGPU adapter available');
				return;
			}

			await this._initWithWorker(onProgress);
		} catch (error) {
			this._isSupported = false;
			console.debug('WebLLM init skipped:', error);
		}
	}

	private async _initWithWorker(onProgress?: (progress: number) => void): Promise<void> {
		try {
			this.worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });

			this.worker.onmessage = (event) => {
				const { type, payload } = event.data;

				switch (type) {
					case 'progress':
						this.progress = (payload as { progress: number }).progress;
						onProgress?.(this.progress);
						break;
					case 'ready':
						this._isReady = true;
						this._useWorker = true;
						break;
					case 'chunk':
						this.pendingStreamCallback?.({
							content: (payload as { content: string }).content,
							done: (payload as { done: boolean }).done,
						});
						break;
					case 'complete':
						this._isReady = true;
						break;
					case 'error':
						console.error('WebLLM worker error:', payload);
						this._isSupported = false;
						break;
				}
			};

			this.worker.onerror = (error) => {
				console.error('WebLLM worker error:', error);
				this._isSupported = false;
			};

			this.worker.postMessage({ type: 'init', payload: { modelName: MODEL_NAME }, id: '' });

			await this._waitForReady();
		} catch (error) {
			console.error('WebLLM initialization failed:', error);
			this._isSupported = false;
			await this._initLegacy(onProgress);
		}
	}

	private async _initLegacy(onProgress?: (progress: number) => void): Promise<void> {
		try {
			this.legacyEngine = await CreateMLCEngine(MODEL_NAME, {
				initProgressCallback: (info: InitProgressReport) => {
					this.progress = Math.round(info.progress * 100);
					onProgress?.(this.progress);
				},
			});
			this._isReady = true;
			this._useWorker = false;
		} catch (error) {
			this._isSupported = false;
			console.debug('WebLLM legacy init failed:', error);
		}
	}

	private _waitForReady(): Promise<void> {
		return new Promise((resolve) => {
			const check = () => {
				if (this._isReady) {
					resolve();
				} else {
					setTimeout(check, 100);
				}
			};
			check();
		});
	}

	isReady(): boolean {
		return this._isReady;
	}

	isSupported(): boolean {
		return this._isSupported;
	}

	isUsingWorker(): boolean {
		return this._useWorker;
	}

	getDownloadProgress(): number {
		return this.progress;
	}

	async generate(prompt: string): Promise<string> {
		if (!this._isReady) {
			throw new Error('WebLLM not initialized');
		}

		if (this._useWorker && this.worker) {
			const id = `msg_${++this.messageId}`;

			return new Promise((resolve, reject) => {
				const handleMessage = (event: MessageEvent) => {
					const { type, payload, id: msgId } = event.data;
					if (msgId !== id) return;

					if (type === 'complete') {
						this.worker?.removeEventListener('message', handleMessage);
						resolve((payload as { content: string }).content);
					} else if (type === 'error') {
						this.worker?.removeEventListener('message', handleMessage);
						reject(new Error((payload as { message: string }).message));
					}
				};

				this.worker?.addEventListener('message', handleMessage);
				this.worker?.postMessage({
					type: 'generate',
					payload: {
						prompt,
						system:
							'You are a helpful South African matric study assistant. Answer questions about NSC curriculum, university admissions, and study tips.',
						temperature: 0.7,
						maxTokens: 1024,
					},
					id,
				});
			});
		}

		if (!this.legacyEngine) {
			throw new Error('WebLLM engine not available');
		}

		const messages = [
			{
				role: 'system' as const,
				content:
					'You are a helpful South African matric study assistant. Answer questions about NSC curriculum, university admissions, and study tips.',
			},
			{ role: 'user' as const, content: prompt },
		];

		const output = await this.legacyEngine.chat.completions.create({
			messages,
			temperature: 0.7,
			max_tokens: 1024,
		});

		return output.choices[0]?.message?.content || '';
	}

	async *streamGenerate(prompt: string): AsyncGenerator<StreamChunk> {
		if (!this._isReady) {
			throw new Error('WebLLM not initialized');
		}

		if (this._useWorker && this.worker) {
			const id = `msg_${++this.messageId}`;
			const chunks: string[] = [];

			await new Promise<void>((resolve, reject) => {
				const handler = (event: MessageEvent) => {
					const { type, payload, id: msgId } = event.data;
					if (msgId !== id) return;

					if (type === 'chunk') {
						const content = (payload as { content: string }).content;
						chunks.push(content);
					} else if (type === 'complete') {
						this.worker?.removeEventListener('message', handler);
						resolve();
					} else if (type === 'error') {
						this.worker?.removeEventListener('message', handler);
						reject(new Error((payload as { message: string }).message));
					}
				};

				this.worker?.addEventListener('message', handler);

				this.worker?.postMessage({
					type: 'generate',
					payload: {
						prompt,
						system: 'You are a helpful South African matric study assistant.',
						temperature: 0.7,
						maxTokens: 1024,
					},
					id,
				});
			});

			for (const content of chunks) {
				yield { content, done: false };
			}
			yield { content: '', done: true };
			return;
		}

		if (!this.legacyEngine) {
			throw new Error('WebLLM engine not available');
		}

		const messages = [
			{
				role: 'system' as const,
				content:
					'You are a helpful South African matric study assistant. Answer questions about NSC curriculum, university admissions, and study tips.',
			},
			{ role: 'user' as const, content: prompt },
		];

		const stream = await this.legacyEngine.chat.completions.create({
			messages,
			temperature: 0.7,
			max_tokens: 1024,
			stream: true,
		});

		for await (const chunk of stream) {
			const content = chunk.choices[0]?.delta?.content || '';
			if (content) {
				yield { content, done: false };
			}
		}

		yield { content: '', done: true };
	}

	abort(): void {
		if (this.worker) {
			this.worker.postMessage({ type: 'abort', id: '' });
		}
	}

	terminate(): void {
		this.worker?.terminate();
		this.worker = null;
		this.legacyEngine = null;
		this._isReady = false;
	}
}

export const webllmEngine = new WebLLMEngineClass();
