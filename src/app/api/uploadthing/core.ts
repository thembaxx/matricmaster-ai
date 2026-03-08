import { headers } from 'next/headers';
import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { UploadThingError } from 'uploadthing/server';
import { getAuth } from '@/lib/auth';

const f = createUploadthing();

// FileRouter for your app
export const ourFileRouter = {
	// Question image uploader
	questionImage: f({ image: { maxFileSize: '4MB', maxFileCount: 1 } })
		.middleware(async () => {
			try {
				// Get auth instance properly (it's a proxy, but better use the async getter)
				const auth = await getAuth();

				// Verify user is authenticated
				const session = await auth.api.getSession({
					headers: await headers(),
				});

				console.log('[UploadThing] Middleware session:', !!session?.user);

				if (!session?.user) throw new UploadThingError('Unauthorized');

				// Return user ID to be available in onUploadComplete
				return { userId: session.user.id };
			} catch (error) {
				console.error('[UploadThing] Middleware error:', error);
				throw new UploadThingError(
					error instanceof Error ? error.message : 'Internal Server Error'
				);
			}
		})
		.onUploadComplete(async ({ metadata, file }) => {
			// Log successful upload
			console.log('[UploadThing] Upload complete for userId:', metadata.userId);
			console.log('[UploadThing] File URL:', file.ufsUrl);

			// Return data that will be sent to the client
			return { uploadedBy: metadata.userId, url: file.ufsUrl };
		}),

	// Past paper PDF uploader (for extracted PDFs)
	pastPaperPDF: f({
		pdf: { maxFileSize: '16MB', maxFileCount: 1 },
	})
		.middleware(async () => {
			// Public access - no auth required for past papers
			return { userId: 'public' };
		})
		.onUploadComplete(async ({ file }) => {
			try {
				console.log('[UploadThing] Past paper PDF uploaded:', file.ufsUrl);
				return { url: file.ufsUrl };
			} catch (error) {
				console.error('[UploadThing] Error in pastPaperPDF onUploadComplete:', error);
				throw error;
			}
		}),

	// Past paper markdown uploader (for converted markdown files)
	pastPaperMarkdown: f({
		text: { maxFileSize: '4MB', maxFileCount: 1 },
	})
		.middleware(async () => {
			// Public access - no auth required for past papers
			return {};
		})
		.onUploadComplete(async ({ file }) => {
			try {
				console.log('[UploadThing] Past paper markdown uploaded:', file.ufsUrl);
				return { url: file.ufsUrl };
			} catch (error) {
				console.error('[UploadThing] Error in pastPaperMarkdown onUploadComplete:', error);
				throw error;
			}
		}),

	// Paper image extractor (for images extracted from PDFs)
	paperImage: f({ image: { maxFileSize: '8MB', maxFileCount: 10 } })
		.middleware(async () => {
			// Public access - no auth required
			return {};
		})
		.onUploadComplete(async ({ file }) => {
			try {
				// Note: In v7, file is a single object, not an array, even if multiple files are uploaded
				console.log('[UploadThing] Paper image uploaded:', file.ufsUrl);
				return { url: file.ufsUrl };
			} catch (error) {
				console.error('[UploadThing] Error in paperImage onUploadComplete:', error);
				throw error;
			}
		}),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
