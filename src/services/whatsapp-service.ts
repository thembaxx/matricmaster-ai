import { AI_MODELS, generateAI } from '@/lib/ai-config';
import { getCachedResponse } from '@/lib/cache/vercel-kv';
import { whatsappClient } from '@/lib/whatsapp/client';

const GREETING = `Hi! I'm your MatricMaster Study Buddy. 

I can help you with:
- Study questions
- APS calculation
- University info
- Past paper help

Just ask me anything!`;

const FALLBACK = `That's a great question! For detailed answers and practice, check the MatricMaster app at https://matricmaster.ai

Need more help? Ask me another question!`;

export async function handleWhatsAppMessage(_from: string, message: string): Promise<string> {
	const normalized = message.toLowerCase().trim();

	if (normalized.match(/^(hi|hello|hey|start|help)/)) {
		return GREETING;
	}

	const cached = await getCachedResponse(normalized);
	if (cached) {
		return cached;
	}

	try {
		const response = await generateAI({
			prompt: `You are a helpful South African matric study assistant. 
Keep answers concise (under 300 characters for WhatsApp).
Student asks: ${message}`,
			model: AI_MODELS.PRIMARY,
		});

		return response.slice(0, 400);
	} catch (error) {
		console.error('WhatsApp AI error:', error);
		return FALLBACK;
	}
}

export async function sendStudyReminder(to: string): Promise<void> {
	const reminder = `Study Reminder from MatricMaster!

Time to practice some questions today.
Keep your streak going!

Visit matricmaster.ai to continue learning.`;

	await whatsappClient.sendMessage(to, reminder);
}
