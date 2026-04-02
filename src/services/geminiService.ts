import { checkTokenBudget, getAvailableModel, recordTokenUsage } from '@/lib/ai-config';
import {
	generateEssayFeedbackAction,
	generateMathSolutionAction,
	generateQuestionsAction,
	generateStudyPlanAction,
	getExplanationAction,
	smartSearchAction,
} from './aiActions';

export const getExplanation = async (subject: string, topic: string) => {
	try {
		await getAvailableModel('moderate');
		if (!checkTokenBudget(10000)) throw new Error('Token budget exceeded');
		const result = await getExplanationAction(subject, topic);
		recordTokenUsage(10000);
		return result;
	} catch (error) {
		console.error('getExplanation failed:', error);
		throw error instanceof Error ? error : new Error('Failed to get explanation');
	}
};

export const generateStudyPlan = async (subjects: string[], hours: number) => {
	try {
		await getAvailableModel('complex');
		if (!checkTokenBudget(30000)) throw new Error('Token budget exceeded');
		const result = await generateStudyPlanAction(subjects, hours);
		recordTokenUsage(30000);
		return result;
	} catch (error) {
		console.error('generateStudyPlan failed:', error);
		throw error instanceof Error ? error : new Error('Failed to generate study plan');
	}
};

export const smartSearch = async (query: string) => {
	try {
		await getAvailableModel('simple');
		if (!checkTokenBudget(5000)) throw new Error('Token budget exceeded');
		const result = await smartSearchAction(query);
		recordTokenUsage(5000);
		return result;
	} catch (error) {
		console.error('smartSearch failed:', error);
		throw error instanceof Error ? error : new Error('Failed to search');
	}
};

export const generateQuestions = async (
	subject: string,
	topic: string,
	difficulty?: 'easy' | 'medium' | 'hard',
	questionType?: 'multiple_choice' | 'true_false' | 'short_answer',
	count?: number
) => {
	try {
		await getAvailableModel('moderate');
		if (!checkTokenBudget(15000)) throw new Error('Token budget exceeded');
		const result = await generateQuestionsAction(subject, topic, difficulty, questionType, count);
		recordTokenUsage(15000);
		return result;
	} catch (error) {
		console.error('generateQuestions failed:', error);
		throw error instanceof Error ? error : new Error('Failed to generate questions');
	}
};

export const generateMathSolution = async (subject: string, topic: string, problem: string) => {
	try {
		await getAvailableModel('complex');
		if (!checkTokenBudget(25000)) throw new Error('Token budget exceeded');
		const result = await generateMathSolutionAction(subject, topic, problem);
		recordTokenUsage(25000);
		return result;
	} catch (error) {
		console.error('generateMathSolution failed:', error);
		throw error instanceof Error ? error : new Error('Failed to generate math solution');
	}
};

export const generateEssayFeedback = async (
	essayTopic: string,
	essayContent: string,
	wordCount?: number
) => {
	try {
		await getAvailableModel('creative');
		if (!checkTokenBudget(40000)) throw new Error('Token budget exceeded');
		const result = await generateEssayFeedbackAction(essayTopic, essayContent, wordCount);
		recordTokenUsage(40000);
		return result;
	} catch (error) {
		console.error('generateEssayFeedback failed:', error);
		throw error instanceof Error ? error : new Error('Failed to generate essay feedback');
	}
};

export const quickAnswer = async (question: string) => {
	try {
		await getAvailableModel('simple');
		if (!checkTokenBudget(3000)) throw new Error('Token budget exceeded');
		const result = await smartSearchAction(question);
		recordTokenUsage(3000);
		return result;
	} catch (error) {
		console.error('quickAnswer failed:', error);
		throw error instanceof Error ? error : new Error('Failed to get quick answer');
	}
};

export type { EssayFeedback, GeneratedQuestion, MathStep } from './aiActions';
