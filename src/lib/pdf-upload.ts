/**
 * PDF Upload Helper
 * Handles uploading PDFs to UploadThing for storage/backup
 */

import { uploadFiles } from '@/lib/uploadthing';

export interface UploadResult {
	success: boolean;
	url?: string;
	error?: string;
}

/**
 * Upload a PDF file from a URL to UploadThing
 * This is useful for backing up extracted past paper PDFs
 */
export async function uploadPdfFromUrl(pdfUrl: string): Promise<UploadResult> {
	try {
		// First, fetch the PDF from the source URL
		const response = await fetch(pdfUrl);
		if (!response.ok) {
			return {
				success: false,
				error: `Failed to fetch PDF: ${response.status} ${response.statusText}`,
			};
		}

		// Get the blob
		const blob = await response.blob();

		// Check file size (max 16MB for pastPaperPDF endpoint)
		const maxSize = 16 * 1024 * 1024; // 16MB
		if (blob.size > maxSize) {
			return {
				success: false,
				error: `PDF file too large. Max size is 16MB, got ${(blob.size / 1024 / 1024).toFixed(2)}MB`,
			};
		}

		// Convert blob to File
		const fileName = pdfUrl.split('/').pop() || `past-paper-${Date.now()}.pdf`;
		const file = new File([blob], fileName, { type: 'application/pdf' });

		// Handle server vs client upload
		if (typeof window === 'undefined') {
			// On the server, use UTApi
			const { UTApi } = await import('uploadthing/server');
			const utapi = new UTApi();
			const result = await utapi.uploadFiles(file);

			if (result?.data?.ufsUrl) {
				return {
					success: true,
					url: result.data.ufsUrl,
				};
			}
		} else {
			// On the client, use uploadFiles
			const result = await uploadFiles('pastPaperPDF', {
				files: [file],
			});

			if (result?.[0]?.ufsUrl) {
				return {
					success: true,
					url: result[0].ufsUrl,
				};
			}
		}

		return {
			success: false,
			error: 'Upload failed - no URL returned',
		};
	} catch (error) {
		console.error('[PDF Upload] Error:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error during upload',
		};
	}
}

/**
 * Upload a PDF from a File object (client-side upload)
 */
export async function uploadPdfFile(file: File): Promise<UploadResult> {
	try {
		// Check file size
		const maxSize = 16 * 1024 * 1024; // 16MB
		if (file.size > maxSize) {
			return {
				success: false,
				error: `PDF file too large. Max size is 16MB, got ${(file.size / 1024 / 1024).toFixed(2)}MB`,
			};
		}

		// Check file type
		if (file.type !== 'application/pdf') {
			return {
				success: false,
				error: 'Invalid file type. Only PDF files are allowed.',
			};
		}

		// Handle server vs client upload
		if (typeof window === 'undefined') {
			// On the server, use UTApi
			const { UTApi } = await import('uploadthing/server');
			const utapi = new UTApi();
			const result = await utapi.uploadFiles(file);

			if (result?.data?.ufsUrl) {
				return {
					success: true,
					url: result.data.ufsUrl,
				};
			}
		} else {
			// On the client, use uploadFiles
			const result = await uploadFiles('pastPaperPDF', {
				files: [file],
			});

			if (result?.[0]?.ufsUrl) {
				return {
					success: true,
					url: result[0].ufsUrl,
				};
			}
		}

		return {
			success: false,
			error: 'Upload failed - no URL returned',
		};
	} catch (error) {
		console.error('[PDF Upload] Error:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error during upload',
		};
	}
}
