'use server';

import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';

const explanationSchema = z.object({
	subject: z.string().min(1).max(100),
	topic: z.string().min(1).max(500),
});

const studyPlanSchema = z.object({
	subjects: z.array(z.string().min(1).max(100)).min(1).max(20),
	hours: z.number().min(1).max(168),
});

const searchSchema = z.object({
	query: z.string().min(1).max(500),
});

let ai: GoogleGenAI | null = null;

function getAI(): GoogleGenAI | null {
	if (!ai) {
		const apiKey = process.env.GEMINI_API_KEY;
		if (!apiKey) {
			console.warn('GEMINI_API_KEY not configured. AI features disabled.');
			return null;
		}
		ai = new GoogleGenAI({ apiKey });
	}
	return ai;
}

function sanitizeInput(input: string): string {
	return input.replace(/[<>]/g, '').trim().slice(0, 1000);
}

function cleanJson(text: string): string {
	return text.replace(/```json\n?|```/g, '').trim();
}

export async function getExplanationAction(subject: string, topic: string): Promise<string> {
	try {
		const validated = explanationSchema.parse({ subject, topic });
		const client = getAI();

		if (!client) {
			return 'AI features are not configured. Please contact support.';
		}

		const sanitizedSubject = sanitizeInput(validated.subject);
		const sanitizedTopic = sanitizeInput(validated.topic);

		const response = await client.models.generateContent({
			model: 'gemini-2.5-flash',
			contents: [
				{
					role: 'user',
					parts: [
						{
							text: `You are an expert Grade 12 tutor in South Africa. Explain the topic "${sanitizedTopic}" in the subject "${sanitizedSubject}" in a way that is interactive and easy to understand for a student. Use simple analogies and highlight key formulas if applicable.`,
						},
					],
				},
			],
		});

		return (
			response.text ?? "I'm sorry, I couldn't generate an explanation for this topic at the moment."
		);
	} catch (error) {
		if (error instanceof z.ZodError) {
			return 'Invalid input provided.';
		}
		console.error('Gemini API Error:', error);
		return "Sorry, I couldn't generate an explanation right now. Please try again later.";
	}
}

export async function generateStudyPlanAction(subjects: string[], hours: number): Promise<string> {
	try {
		const validated = studyPlanSchema.parse({ subjects, hours });
		const client = getAI();

		if (!client) {
			return 'AI features are not configured. Please contact support.';
		}

		const sanitizedSubjects = validated.subjects.map(sanitizeInput);
		const sanitizedHours = Math.min(Math.max(validated.hours, 1), 168);

		const response = await client.models.generateContent({
			model: 'gemini-2.5-flash',
			contents: [
				{
					role: 'user',
					parts: [
						{
							text: `Generate a focused Grade 12 study plan for these subjects: ${sanitizedSubjects.join(', ')}. The student has ${sanitizedHours} hours per week. Structure it as a daily quest path with specific topics to cover. Return as a list.`,
						},
					],
				},
			],
		});

		return response.text ?? "I'll help you create a plan soon!";
	} catch (error) {
		if (error instanceof z.ZodError) {
			return 'Invalid input provided.';
		}
		console.error('Study Plan Generation Error:', error);
		return "I'll help you create a plan soon!";
	}
}

export async function smartSearchAction(
	query: string
): Promise<{ suggestions: string[]; tip: string } | null> {
	try {
		const validated = searchSchema.parse({ query });
		const client = getAI();

		if (!client) return null;

		const sanitizedQuery = sanitizeInput(validated.query);

		const response = await client.models.generateContent({
			model: 'gemini-2.5-flash',
			contents: [
				{
					role: 'user',
					parts: [
						{
							text: `Based on the search query "${sanitizedQuery}", suggest 3-4 specific Grade 12 South African curriculum topics or questions that a student might be looking for. Also provide a very brief (1 sentence) helpful tip related to the query. Format the response as a JSON object with keys "suggestions" (array of strings) and "tip" (string).`,
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
			const parsed = JSON.parse(cleaned) as unknown;

			if (
				typeof parsed === 'object' &&
				parsed !== null &&
				'suggestions' in parsed &&
				'tip' in parsed &&
				Array.isArray((parsed as { suggestions: unknown }).suggestions) &&
				typeof (parsed as { tip: unknown }).tip === 'string'
			) {
				return parsed as { suggestions: string[]; tip: string };
			}
		}
		return null;
	} catch (error) {
		if (error instanceof z.ZodError) {
			return null;
		}
		console.error('Smart Search Error:', error);
		return null;
	}
}
