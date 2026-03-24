import { eq } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';
import { AI_MODELS, generateAI } from '@/lib/ai-config';
import { type DbType, dbManager } from '@/lib/db';
import { whatsappPreferences } from '@/lib/db/schema';
import { handleWhatsAppMessage, sendVerificationCode } from '@/services/whatsapp-service';

async function getDb(): Promise<DbType> {
	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) {
		throw new Error('Database not available');
	}
	return dbManager.getDb() as DbType;
}

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

interface WhatsAppMessage {
	from: string;
	id: string;
	timestamp: string;
	type: string;
	text?: { body: string };
	image?: { id: string; mime_type: string; sha256: string; url?: string };
	voice?: { id: string; mime_type: string; sha256: string };
	location?: { latitude: number; longitude: number; name?: string };
}

interface WhatsAppStatus {
	id: string;
	status: string;
	timestamp: string;
	recipient_id: string;
}

interface WhatsAppChange {
	value: {
		messaging_product: string;
		to: string;
		from?: string;
		timestamp?: string;
		messages?: WhatsAppMessage[];
		statuses?: WhatsAppStatus[];
	};
	field: string;
}

interface WhatsAppEntry {
	id: string;
	changes: WhatsAppChange[];
}

interface WhatsAppWebhookBody {
	object: string;
	entry: WhatsAppEntry[];
}

export async function GET(request: NextRequest): Promise<NextResponse> {
	const searchParams = request.nextUrl.searchParams;
	const mode = searchParams.get('hub.mode');
	const token = searchParams.get('hub.verify_token');
	const challenge = searchParams.get('hub.challenge');

	if (mode === 'subscribe' && token === VERIFY_TOKEN) {
		console.log('WhatsApp webhook verified');
		return new NextResponse(challenge, { status: 200 });
	}

	return new NextResponse('Verification failed', { status: 403 });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
	try {
		const body: WhatsAppWebhookBody = await request.json();
		const db = await getDb();

		for (const entry of body.entry) {
			for (const change of entry.changes) {
				const value = change.value;

				if (value.statuses) {
					for (const status of value.statuses) {
						if (status.status === 'delivered' || status.status === 'read') {
							await db
								.update(whatsappPreferences)
								.set({
									lastMessageAt: new Date(),
									updatedAt: new Date(),
								})
								.where(eq(whatsappPreferences.phoneNumber, status.recipient_id));
						}
					}
					continue;
				}

				const messages = value.messages;
				if (!messages) continue;

				for (const message of messages) {
					const from = message.from;
					const messageType = message.type;

					let messageContent = '';
					if (messageType === 'text' && message.text) {
						messageContent = message.text.body;
					} else if (messageType === 'image' && message.image) {
						messageContent = '[Image received - use app to view]';
					} else if (messageType === 'voice' && message.voice) {
						const transcription = await transcribeVoiceNote(message.voice.id, from);
						messageContent = transcription;
					}

					if (!messageContent) continue;

					await db
						.update(whatsappPreferences)
						.set({
							lastMessageAt: new Date(),
							updatedAt: new Date(),
						})
						.where(eq(whatsappPreferences.phoneNumber, from));

					let response: string;

					const normalizedMsg = messageContent.toLowerCase().trim();

					if (normalizedMsg.startsWith('verify:') || normalizedMsg.startsWith('code:')) {
						const code = normalizedMsg.split(':')[1]?.trim();
						if (code) {
							const isValid = await verifyPhoneNumberWithPhone(from, code);
							response = isValid
								? '✅ Your phone number has been verified! Welcome to Lumni WhatsApp.'
								: '❌ Invalid verification code. Please check the code and try again.';
						} else {
							response = 'Please use the format: verify:123456';
						}
					} else if (normalizedMsg === 'stop' || normalizedMsg === 'unsubscribe') {
						await db
							.update(whatsappPreferences)
							.set({ isOptedIn: false, updatedAt: new Date() })
							.where(eq(whatsappPreferences.phoneNumber, from));
						response =
							"You've been unsubscribed from Lumni WhatsApp notifications.\n\nTo resubscribe, visit lumni.ai/settings";
					} else if (normalizedMsg === 'start' || normalizedMsg === 'subscribe') {
						const prefs = await getUserPreferencesByPhone(from);
						if (prefs?.isVerified) {
							await db
								.update(whatsappPreferences)
								.set({ isOptedIn: true, updatedAt: new Date() })
								.where(eq(whatsappPreferences.phoneNumber, from));
							response = "✅ You've been resubscribed to Lumni WhatsApp notifications!";
						} else {
							const code = await generateVerificationCodeByPhone(from);
							if (code) {
								await sendVerificationCode(from, code);
								response = `Welcome to Lumni! Please verify your number.\n\nYour verification code: ${code}\n\nOr reply with: verify:123456`;
							} else {
								response = 'Please register your number first at lumni.ai/settings';
							}
						}
					} else if (normalizedMsg === 'settings' || normalizedMsg === 'preferences') {
						const prefs = await getUserPreferencesByPhone(from);
						const types = prefs?.notificationTypes || [];
						response = `📱 Your WhatsApp Settings:\n\nNotifications: ${prefs?.isOptedIn ? 'ON' : 'OFF'}\nVerified: ${prefs?.isVerified ? 'Yes' : 'No'}\n\nEnabled:\n${types.includes('study_reminder') ? '✓' : '✗'} Study reminders\n${types.includes('achievement_share') ? '✓' : '✗'} Achievement updates\n${types.includes('buddy_update') ? '✓' : '✗'} Buddy score updates\n${types.includes('daily_tip') ? '✓' : '✗'} Daily tips\n\nManage at: lumni.ai/settings`;
					} else if (normalizedMsg.startsWith('tip')) {
						const tipResponse = await generateStudyTip(messageContent);
						response = tipResponse;
					} else {
						response = await handleWhatsAppMessage(from, messageContent);
					}

					await sendWhatsAppReply(from, response);
				}
			}
		}

		return new NextResponse('OK', { status: 200 });
	} catch (error) {
		console.error('WhatsApp webhook error:', error);
		return new NextResponse('Internal Server Error', { status: 500 });
	}
}

async function transcribeVoiceNote(mediaId: string, _from: string): Promise<string> {
	try {
		const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
		if (!accessToken) return '[Voice note - transcription unavailable]';

		const mediaResponse = await fetch(`https://graph.facebook.com/v18.0/${mediaId}`, {
			headers: { Authorization: `Bearer ${accessToken}` },
		});

		if (!mediaResponse.ok) {
			return '[Voice note - could not transcribe]';
		}

		const mediaData = (await mediaResponse.json()) as { url?: string };
		const audioUrl = mediaData.url;

		if (!audioUrl) {
			return '[Voice note - no audio URL]';
		}

		const audioResponse = await fetch(audioUrl, {
			headers: { Authorization: `Bearer ${accessToken}` },
		});

		if (!audioResponse.ok) {
			return '[Voice note - could not download audio]';
		}

		const audioBuffer = await audioResponse.arrayBuffer();
		const audioBase64 = Buffer.from(audioBuffer).toString('base64').slice(0, 50000);

		const transcription = await generateAI({
			prompt: `Transcribe this audio message. Return only the text content in English or any South African language. If it's not clear speech, say "Could not understand audio".

Audio (base64 encoded first 500KB): ${audioBase64}...`,
			model: AI_MODELS.PRIMARY,
		});

		return transcription || '[Voice note - transcription failed]';
	} catch (error) {
		console.error('Voice transcription error:', error);
		return '[Voice note - transcription error]';
	}
}

async function generateStudyTip(message: string): Promise<string> {
	try {
		const response = await generateAI({
			prompt: `Based on this student query: "${message}"

Provide a brief study tip or motivation (under 200 characters) related to matric studies in South Africa.`,
			model: AI_MODELS.PRIMARY,
		});

		return `💡 Study Tip:\n\n${response}\n\nLearn more at lumni.ai`;
	} catch {
		return '💡 Tip: Break your study sessions into 25-minute focused chunks with 5-minute breaks!';
	}
}

async function verifyPhoneNumberWithPhone(phone: string, code: string): Promise<boolean> {
	const db = await getDb();
	const prefs = await db
		.select()
		.from(whatsappPreferences)
		.where(eq(whatsappPreferences.phoneNumber, phone))
		.limit(1)
		.then((rows) => rows[0]);

	if (!prefs) return false;

	const isExpired = prefs.verificationExpires && new Date(prefs.verificationExpires) < new Date();
	if (isExpired) return false;

	if (prefs.verificationCode !== code) return false;

	await db
		.update(whatsappPreferences)
		.set({
			isVerified: true,
			verificationCode: null,
			verificationExpires: null,
			updatedAt: new Date(),
		})
		.where(eq(whatsappPreferences.phoneNumber, phone));

	return true;
}

async function generateVerificationCodeByPhone(phone: string): Promise<string | null> {
	const db = await getDb();
	const code = Math.floor(100000 + Math.random() * 900000).toString();
	const expires = new Date(Date.now() + 10 * 60 * 1000);

	await db
		.update(whatsappPreferences)
		.set({
			verificationCode: code,
			verificationExpires: expires,
			updatedAt: new Date(),
		})
		.where(eq(whatsappPreferences.phoneNumber, phone));

	return code;
}

async function getUserPreferencesByPhone(phone: string) {
	const db = await getDb();
	return db
		.select()
		.from(whatsappPreferences)
		.where(eq(whatsappPreferences.phoneNumber, phone))
		.limit(1)
		.then((rows) => rows[0]);
}

async function sendWhatsAppReply(to: string, message: string): Promise<void> {
	const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
	const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

	if (!accessToken || !phoneNumberId) {
		console.warn('WhatsApp not configured');
		return;
	}

	await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}/messages`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${accessToken}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			messaging_product: 'whatsapp',
			to,
			type: 'text',
			text: { body: message },
		}),
	});
}
