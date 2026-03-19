/* eslint-disable @typescript-eslint/no-explicit-any */
const ctx = self as unknown as Worker;

interface WorkerMessage {
	type: 'init' | 'generate' | 'abort';
	payload?: unknown;
	id: string;
}

interface InitPayload {
	modelName: string;
}

interface GeneratePayload {
	prompt: string;
	system?: string;
	temperature?: number;
	maxTokens?: number;
}

interface WorkerResponse {
	type: 'progress' | 'ready' | 'error' | 'chunk' | 'complete';
	payload?: unknown;
	id: string;
}

let engine: any = null;
let abortController: AbortController | null = null;

async function initEngine(modelName: string, onProgress?: (progress: number) => void) {
	const { CreateMLCEngine } = await import('@mlc-ai/web-llm');

	engine = await CreateMLCEngine(modelName, {
		initProgressCallback: (info: { progress: number }) => {
			const progress = Math.round(info.progress * 100);
			onProgress?.(progress);
			ctx.postMessage({
				type: 'progress',
				payload: { progress },
				id: '',
			} as WorkerResponse);
		},
	});

	ctx.postMessage({ type: 'ready', id: '' } as WorkerResponse);
}

async function generateText(payload: GeneratePayload, messageId: string): Promise<void> {
	if (!engine) {
		ctx.postMessage({
			type: 'error',
			payload: { message: 'Engine not initialized' },
			id: messageId,
		} as WorkerResponse);
		return;
	}

	abortController = new AbortController();

	const messages = [
		{
			role: 'system' as const,
			content:
				payload.system ||
				'You are a helpful South African matric study assistant. Answer questions about NSC curriculum, university admissions, and study tips.',
		},
		{ role: 'user' as const, content: payload.prompt },
	];

	try {
		const stream = await engine.chat.completions.create({
			messages,
			temperature: payload.temperature ?? 0.7,
			max_tokens: payload.maxTokens ?? 1024,
			stream: true,
		});

		let fullContent = '';

		for await (const chunk of stream) {
			if (abortController?.signal.aborted) break;

			const content = chunk.choices[0]?.delta?.content || '';
			if (content) {
				fullContent += content;
				ctx.postMessage({
					type: 'chunk',
					payload: { content, done: false },
					id: messageId,
				} as WorkerResponse);
			}
		}

		ctx.postMessage({
			type: 'complete',
			payload: { content: fullContent, done: true },
			id: messageId,
		} as WorkerResponse);
	} catch (error) {
		ctx.postMessage({
			type: 'error',
			payload: { message: error instanceof Error ? error.message : String(error) },
			id: messageId,
		} as WorkerResponse);
	}
}

ctx.onmessage = async (event: MessageEvent<WorkerMessage>) => {
	const { type, payload, id } = event.data;

	switch (type) {
		case 'init':
			await initEngine((payload as InitPayload).modelName, (progress) => {
				ctx.postMessage({
					type: 'progress',
					payload: { progress },
					id,
				} as WorkerResponse);
			});
			break;

		case 'generate':
			await generateText(payload as GeneratePayload, id);
			break;

		case 'abort':
			abortController?.abort();
			break;
	}
};
