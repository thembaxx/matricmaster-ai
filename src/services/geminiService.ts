import {
	generateEssayFeedbackAction,
	generateMathSolutionAction,
	generateQuestionsAction,
	generateStudyPlanAction,
	getExplanationAction,
	smartSearchAction,
} from './aiActions';

export const getExplanation = async (subject: string, topic: string) => {
	return getExplanationAction(subject, topic);
};

export const generateStudyPlan = async (subjects: string[], hours: number) => {
	return generateStudyPlanAction(subjects, hours);
};

export const smartSearch = async (query: string) => {
	return smartSearchAction(query);
};

export const generateQuestions = async (
	subject: string,
	topic: string,
	difficulty?: 'easy' | 'medium' | 'hard',
	questionType?: 'multiple_choice' | 'true_false' | 'short_answer',
	count?: number
) => {
	return generateQuestionsAction(subject, topic, difficulty, questionType, count);
};

export const generateMathSolution = async (subject: string, topic: string, problem: string) => {
	return generateMathSolutionAction(subject, topic, problem);
};

export const generateEssayFeedback = async (
	essayTopic: string,
	essayContent: string,
	wordCount?: number
) => {
	return generateEssayFeedbackAction(essayTopic, essayContent, wordCount);
};

export type { EssayFeedback, GeneratedQuestion, MathStep } from './aiActions';
