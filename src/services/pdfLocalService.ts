/**
 * Local PDF text extraction service for MatricMaster AI.
 * Provides fallback extraction when AI services are unavailable.
 */

// Define the text item type from pdfjs
interface TextItem {
	str: string;
	dir: string;
	width: number;
	height: number;
	transform: number[];
	fontName: string;
}

/**
 * Extracts raw text from a PDF buffer locally without AI.
 * This is used as a fallback when AI providers are unavailable or at quota.
 */
export async function extractTextFromPDFLocal(pdfBuffer: ArrayBuffer): Promise<string> {
	// Polyfill for Node.js environment - MUST be done before importing pdfjs-dist
	// since pdfjs-dist evaluates these at the module level in some builds.
	if (typeof global !== 'undefined') {
		if (!('DOMMatrix' in global)) {
			(global as any).DOMMatrix = class DOMMatrix {
				static fromMatrix() {
					return new DOMMatrix();
				}
				multiply() {
					return this;
				}
			};
		}
		if (!('DOMPoint' in global)) {
			(global as any).DOMPoint = class DOMPoint {};
		}
	}

	try {
		// Import from legacy build for better Node.js compatibility
		const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');

		if (typeof window === 'undefined') {
			try {
				// Use node:path for server-side path resolution
				const path = await import('node:path');
				// Resolve the absolute path to the worker file in node_modules
				const workerPath = path.resolve(
					process.cwd(),
					'node_modules',
					'pdfjs-dist',
					'legacy',
					'build',
					'pdf.worker.mjs'
				);

				// Set the workerSrc to the absolute path
				(pdfjs as any).GlobalWorkerOptions.workerSrc = workerPath;
			} catch (workerError) {
				console.warn('[PDF Local Service] Could not set absolute worker path:', workerError);
				// Fallback to a CDN if local resolution fails on the server (less ideal but keeps it working)
				(pdfjs as any).GlobalWorkerOptions.workerSrc =
					`https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${(pdfjs as any).version}/pdf.worker.min.mjs`;
			}
		}

		const loadingTask = pdfjs.getDocument({
			data: pdfBuffer,
			useWorkerFetch: false,
			isEvalSupported: false,
			// Disabling the worker explicitly can sometimes help in Node environments
			// to force the use of the "fake worker" which we just configured
		});

		const pdf = await loadingTask.promise;
		let fullText = '';

		for (let i = 1; i <= pdf.numPages; i++) {
			const page = await pdf.getPage(i);
			const textContent = await page.getTextContent();

			const pageText = textContent.items.map((item: any) => (item as TextItem).str || '').join(' ');

			fullText += `--- Page ${i} ---\n${pageText}\n\n`;
		}

		return fullText;
	} catch (error) {
		console.error('[PDF Local Service] Extraction failed:', error);
		throw new Error(
			`Failed to extract text from PDF locally: ${error instanceof Error ? error.message : 'Unknown error'}`
		);
	}
}

/**
 * Converts a base64 string to an ArrayBuffer
 */
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
	const binaryString = atob(base64);
	const len = binaryString.length;
	const bytes = new Uint8Array(len);
	for (let i = 0; i < len; i++) {
		bytes[i] = binaryString.charCodeAt(i);
	}
	return bytes.buffer;
}
