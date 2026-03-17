import { type NextRequest, NextResponse } from 'next/server';
import { whatsappClient } from '@/lib/whatsapp/client';
import { handleWhatsAppMessage } from '@/services/whatsapp-service';

export async function GET(request: NextRequest) {
	const searchParams = request.nextUrl.searchParams;
	const mode = searchParams.get('hub.mode');
	const token = searchParams.get('hub.verify_token');
	const challenge = searchParams.get('hub.challenge');

	const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

	if (mode === 'subscribe' && token === verifyToken) {
		return new NextResponse(challenge, { status: 200 });
	}

	return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();

		const entry = body.entry?.[0];
		const changes = entry?.changes?.[0];
		const message = changes?.value?.messages?.[0];

		if (!message) {
			return NextResponse.json({ ok: true });
		}

		const from = message.from;
		const text = message.text?.body;

		if (!text) {
			return NextResponse.json({ ok: true });
		}

		const response = await handleWhatsAppMessage(from, text);

		await whatsappClient.sendMessage(from, response);

		return NextResponse.json({ ok: true });
	} catch (error) {
		console.error('WhatsApp webhook error:', error);
		return NextResponse.json({ error: 'Internal error' }, { status: 500 });
	}
}
