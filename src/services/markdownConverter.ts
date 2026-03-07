'use server';

import { logError, logInfo } from '@/lib/monitoring';
import { uploadFiles } from '@/lib/uploadthing';

export interface MarkdownConversionResult {
	success: boolean;
	markdown?: string;
	error?: string;
}

const MARKDOWN_API_BASE = 'https://markdown.new';

export async function convertPdfToMarkdown(pdfUrl: string): Promise<MarkdownConversionResult> {
	try {
		logInfo('markdown-converter', 'Converting PDF to markdown', { pdfUrl });

		const response = await fetch(`${MARKDOWN_API_BASE}/${encodeURIComponent(pdfUrl)}`, {
			headers: {
				Accept: 'text/markdown',
			},
		});

		if (!response.ok) {
			throw new Error(`Markdown API returned ${response.status}`);
		}

		const markdown = await response.text();

		if (!markdown || markdown.trim().length < 100) {
			throw new Error('Received empty or too short markdown');
		}

		logInfo('markdown-converter', 'Markdown conversion successful', {
			pdfUrl,
			length: markdown.length,
		});

		return { success: true, markdown };
	} catch (error) {
		logError('markdown-converter', 'Markdown conversion failed', {
			pdfUrl,
			error: error instanceof Error ? error.message : 'Unknown error',
		});
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error',
		};
	}
}

export async function uploadMarkdownToUploadThing(
	markdown: string,
	paperId: string
): Promise<{ success: boolean; url?: string; error?: string }> {
	try {
		const fileName = `${paperId}-${Date.now()}.md`;
		const file = new File([markdown], fileName, { type: 'text/markdown' });

		const result = await uploadFiles('pastPaperMarkdown', {
			files: [file],
		});

		if (result?.[0]?.ufsUrl) {
			return { success: true, url: result[0].ufsUrl };
		}

		return { success: false, error: 'Upload failed - no URL returned' };
	} catch (error) {
		logError('markdown-converter', 'Markdown upload failed', {
			paperId,
			error: error instanceof Error ? error.message : 'Unknown error',
		});
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error',
		};
	}
}
