import { generateStudyPlanAction, getExplanationAction, smartSearchAction } from './aiActions';

export const getExplanation = async (subject: string, topic: string) => {
	return getExplanationAction(subject, topic);
};

export const generateStudyPlan = async (subjects: string[], hours: number) => {
	return generateStudyPlanAction(subjects, hours);
};

export const smartSearch = async (query: string) => {
	return smartSearchAction(query);
};
