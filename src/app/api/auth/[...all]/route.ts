import { toNextJsHandler } from 'better-auth/next-js';
import type { NextRequest } from 'next/server';
import { getAuth } from '@/lib/auth';

let handler: ReturnType<typeof toNextJsHandler> | null = null;

async function getHandler() {
	if (!handler) {
		const auth = await getAuth();
		handler = toNextJsHandler(auth);
	}
	return handler;
}

export async function GET(request: NextRequest) {
	const h = await getHandler();
	return h.GET(request);
}

export async function POST(request: NextRequest) {
	const h = await getHandler();
	return h.POST(request);
}
