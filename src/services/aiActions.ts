'use server';

import { GoogleGenAI } from '@google/genai';

let ai: GoogleGenAI | null = null;

function getAI() {
	if (!ai) {
		const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
		if (!apiKey) {
			console.warn('GEMINI_API_KEY not set. Gemini features will not work.');
			return null;
		}
		console.log('✓ Initializing Gemini with API key');
		ai = new GoogleGenAI({ apiKey });
	}
	return ai;
}

const cleanJson = (text: string) => {
	return text.replace(/```json\n?|```/g, '').trim();
};

export async function getExplanationAction(subject: string, topic: string) {
	try {
		const client = getAI();
		if (!client) {
			return 'API key not configured.';
		}
		const response = await client.models.generateContent({
			model: 'gemini-2.5-flash',
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
}

export async function generateStudyPlanAction(subjects: string[], hours: number) {
	try {
		const client = getAI();
		if (!client) {
			return 'API key not configured.';
		}
		const response = await client.models.generateContent({
			model: 'gemini-2.5-flash',
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
	} catch (error) {
		console.error('Study Plan Generation Error:', error);
		return "I'll help you create a plan soon!";
	}
}

export async function smartSearchAction(query: string) {
	try {
		const client = getAI();
		if (!client) return null;

		const response = await client.models.generateContent({
			model: 'gemini-2.5-flash',
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
			const cleaned = cleanJson(response.text);
			return JSON.parse(cleaned) as { suggestions: string[]; tip: string };
		}
		return null;
	} catch (error) {
		console.error('Smart Search Error:', error);
		return null;
	}
}
