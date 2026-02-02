
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getExplanation = async (subject: string, topic: string) => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `You are an expert Grade 12 tutor in South Africa. Explain the topic "${topic}" in the subject "${subject}" in a way that is interactive and easy to understand for a student. Use simple analogies and highlight key formulas if applicable.`,
        });
        return response.text;
    } catch (error) {
        console.error("Gemini API Error:", error);
        return "Sorry, I couldn't generate an explanation right now. Please try again later.";
    }
};

export const generateStudyPlan = async (subjects: string[], hours: number) => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Generate a focused Grade 12 study plan for these subjects: ${subjects.join(', ')}. The student has ${hours} hours per week. Structure it as a daily quest path with specific topics to cover. Return as a list.`,
        });
        return response.text;
    } catch (error) {
        return "I'll help you create a plan soon!";
    }
};
