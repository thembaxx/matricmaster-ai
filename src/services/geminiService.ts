import { GoogleGenAI } from '@google/genai';

let ai: GoogleGenAI | null = null;

function getAI() {
	if (!ai) {
		const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
		if (!apiKey) {
			console.warn('NEXT_PUBLIC_GEMINI_API_KEY not set. Gemini features will not work.');
			return null;
		}
		ai = new GoogleGenAI({ apiKey });
	}
	return ai;
}

export const getExplanation = async (subject: string, topic: string) => {
	try {
		const client = getAI();
		if (!client) {
			return 'API key not configured. Please add NEXT_PUBLIC_GEMINI_API_KEY to your .env file.';
		}
		const response = await client.models.generateContent({
			model: 'gemini-1.5-flash',
			contents: [
				{
					role: 'user',
					parts: [
						{
							text: `You are an expert Grade 12 tutor in South Africa. Explain the topic "${topic}" in the subject "${subject}" in a way that is interactive and easy to understand for a student. Use simple analogies and highlight key formulas if applicable.`,
						},
					],
				},
			],
		});
		return (
			response.text ?? "I'm sorry, I couldn't generate an explanation for this topic at the moment."
		);
	} catch (error) {
		console.error('Gemini API Error:', error);
		return "Sorry, I couldn't generate an explanation right now. Please try again later.";
	}
};

export const generateStudyPlan = async (subjects: string[], hours: number) => {
	try {
		const client = getAI();
		if (!client) {
			return 'API key not configured. Please add NEXT_PUBLIC_GEMINI_API_KEY to your .env file.';
		}
		const response = await client.models.generateContent({
			model: 'gemini-1.5-flash',
			contents: [
				{
					role: 'user',
					parts: [
						{
							text: `Generate a focused Grade 12 study plan for these subjects: ${subjects.join(', ')}. The student has ${hours} hours per week. Structure it as a daily quest path with specific topics to cover. Return as a list.`,
						},
					],
				},
			],
		});
		return response.text ?? "I'll help you create a plan soon!";
	} catch (_error) {
		return "I'll help you create a plan soon!";
	}
};

export const smartSearch = async (query: string) => {
	try {
		const client = getAI();
		if (!client) return null;

		const response = await client.models.generateContent({
			model: 'gemini-1.5-flash',
			contents: [
				{
					role: 'user',
					parts: [
						{
							text: `Based on the search query "${query}", suggest 3-4 specific Grade 12 South African curriculum topics or questions that a student might be looking for. Also provide a very brief (1 sentence) helpful tip related to the query. Format the response as a JSON object with keys "suggestions" (array of strings) and "tip" (string).`,
						},
					],
				},
			],
			config: {
				responseMimeType: 'application/json',
			},
		});

		if (response.text) {
			return JSON.parse(response.text) as { suggestions: string[]; tip: string };
		}
		return null;
	} catch (error) {
		console.error('Smart Search Error:', error);
		return null;
	}
};
