import { headers } from 'next/headers';
import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { UploadThingError } from 'uploadthing/server';
import { auth } from '@/lib/auth';

const f = createUploadthing();

// FileRouter for your app
export const ourFileRouter = {
	// Question image uploader
	questionImage: f({ image: { maxFileSize: '4MB', maxFileCount: 1 } })
		.middleware(async () => {
			// Verify user is authenticated
			const session = await auth.api.getSession({
				headers: await headers(),
			});

			if (!session?.user) throw new UploadThingError('Unauthorized');

			// Return user ID to be available in onUploadComplete
			return { userId: session.user.id };
		})
		.onUploadComplete(async ({ metadata, file }) => {
			// Log successful upload
			console.log('Upload complete for userId:', metadata.userId);
			console.log('File URL:', file.ufsUrl);

			// Return data that will be sent to the client
			return { uploadedBy: metadata.userId, url: file.ufsUrl };
		}),

	// Past paper PDF uploader (for extracted PDFs)
	pastPaperPDF: f({
		pdf: { maxFileSize: '16MB', maxFileCount: 1 },
	})
		.middleware(async () => {
			// Public access - no auth required for past papers
			return {};
		})
		.onUploadComplete(async ({ file }) => {
			console.log('Past paper PDF uploaded:', file.ufsUrl);
			return { url: file.ufsUrl };
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
			console.log('Past paper markdown uploaded:', file.ufsUrl);
			return { url: file.ufsUrl };
		}),

	// Paper image extractor (for images extracted from PDFs)
	paperImage: f({ image: { maxFileSize: '8MB', maxFileCount: 10 } })
		.middleware(async () => {
			// Public access - no auth required
			return {};
		})
		.onUploadComplete(async ({ file }) => {
			// Note: When maxFileCount > 1, file is actually an array
			// UploadThing handles this differently - we upload one at a time for paper images
			console.log('Paper image uploaded:', file.ufsUrl);
			return { url: file.ufsUrl };
		}),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
