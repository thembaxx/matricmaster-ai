import { generateReactHelpers } from '@uploadthing/react';

import type { OurFileRouter } from '@/app/api/uploadthing/core';

export const { useUploadThing, uploadFiles } = generateReactHelpers<OurFileRouter>({
	url: process.env.NEXT_PUBLIC_APP_URL
		? `${process.env.NEXT_PUBLIC_APP_URL}/api/uploadthing`
		: '/api/uploadthing',
});
