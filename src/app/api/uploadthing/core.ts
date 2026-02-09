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
			console.log('File URL:', file.url);

			// Return data that will be sent to the client
			return { uploadedBy: metadata.userId, url: file.url };
		}),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
