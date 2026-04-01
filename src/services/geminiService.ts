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
	await getAvailableModel('moderate');
	if (!checkTokenBudget(10000)) throw new Error('Token budget exceeded');
	const result = await getExplanationAction(subject, topic);
	recordTokenUsage(10000);
	return result;
};

export const generateStudyPlan = async (subjects: string[], hours: number) => {
	await getAvailableModel('complex');
	if (!checkTokenBudget(30000)) throw new Error('Token budget exceeded');
	const result = await generateStudyPlanAction(subjects, hours);
	recordTokenUsage(30000);
	return result;
};

export const smartSearch = async (query: string) => {
	await getAvailableModel('simple');
	if (!checkTokenBudget(5000)) throw new Error('Token budget exceeded');
	const result = await smartSearchAction(query);
	recordTokenUsage(5000);
	return result;
};

export const generateQuestions = async (
	subject: string,
	topic: string,
	difficulty?: 'easy' | 'medium' | 'hard',
	questionType?: 'multiple_choice' | 'true_false' | 'short_answer',
	count?: number
) => {
	await getAvailableModel('moderate');
	if (!checkTokenBudget(15000)) throw new Error('Token budget exceeded');
	const result = await generateQuestionsAction(subject, topic, difficulty, questionType, count);
	recordTokenUsage(15000);
	return result;
};

export const generateMathSolution = async (subject: string, topic: string, problem: string) => {
	await getAvailableModel('complex');
	if (!checkTokenBudget(25000)) throw new Error('Token budget exceeded');
	const result = await generateMathSolutionAction(subject, topic, problem);
	recordTokenUsage(25000);
	return result;
};

export const generateEssayFeedback = async (
	essayTopic: string,
	essayContent: string,
	wordCount?: number
) => {
	await getAvailableModel('creative');
	if (!checkTokenBudget(40000)) throw new Error('Token budget exceeded');
	const result = await generateEssayFeedbackAction(essayTopic, essayContent, wordCount);
	recordTokenUsage(40000);
	return result;
};

export const quickAnswer = async (question: string) => {
	await getAvailableModel('simple');
	if (!checkTokenBudget(3000)) throw new Error('Token budget exceeded');
	const result = await smartSearchAction(question);
	recordTokenUsage(3000);
	return result;
};

export type { EssayFeedback, GeneratedQuestion, MathStep } from './aiActions';
