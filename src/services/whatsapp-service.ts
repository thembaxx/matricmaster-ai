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

export async function sendWeeklyProgressReport(
	to: string,
	stats: {
		weekXp: number;
		totalXp: number;
		quizzesCompleted: number;
		streakDays: number;
		topicsImproved: string[];
	}
): Promise<void> {
	const report = `📊 Weekly Progress Report

XP Earned: +${stats.weekXp} (Total: ${stats.totalXp})
Quizzes: ${stats.quizzesCompleted} completed
Streak: ${stats.streakDays} days 🔥
Topics Improved: ${stats.topicsImproved.slice(0, 3).join(', ') || 'None yet'}

Keep it up! Visit matricmaster.ai`;

	await whatsappClient.sendMessage(to, report);
}

export async function sendRevisionDueNotification(
	to: string,
	topic: string,
	subject: string
): Promise<void> {
	const notification = `📚 Time to Review!

${subject}: ${topic} needs review.
Don't lose your progress - practice now!

matricmaster.ai/review`;

	await whatsappClient.sendMessage(to, notification);
}

export async function sendStruggleAlert(
	to: string,
	parentNumber: string,
	topic: string,
	subject: string,
	score: number
): Promise<void> {
	const alert = `⚠️ Study Alert for Parent

${subject}: ${topic}
Current understanding: ${Math.round(score * 100)}%

Your child may need extra help with this topic.
matricmaster.ai/ai-tutor`;

	await whatsappClient.sendMessage(to, alert);
	await whatsappClient.sendMessage(parentNumber, alert);
}

export async function sendExamCountdown(
	to: string,
	exam: { subject: string; date: string; daysUntil: number }
): Promise<void> {
	const message =
		exam.daysUntil <= 7
			? `⏰ ${exam.subject} exam in ${exam.daysUntil} days!
Focus on this subject now.`
			: `📅 ${exam.subject} exam: ${exam.daysUntil} days away
Start preparing early!

matricmaster.ai/planner`;

	await whatsappClient.sendMessage(to, message);
}
