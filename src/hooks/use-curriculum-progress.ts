'use client';

import { useCallback, useMemo } from 'react';
import {
	CURRICULUM_DATA,
	getTopicPrerequisites,
	type StudyRecommendation,
	type Subject,
	type Topic,
} from '@/data/curriculum';

const STORAGE_KEY = 'matricmaster-custom-topics';

export interface CurriculumStats {
	totalTopics: number;
	masteredTopics: number;
	inProgressTopics: number;
	overallProgress: number;
	totalQuestions: number;
}

export interface FilteredStats {
	total: number;
	mastered: number;
	inProgress: number;
	needsAttention: number;
	questions: number;
}

export function loadCustomTopics(): Record<string, Topic[]> {
	if (typeof window === 'undefined') return {};
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		return stored ? JSON.parse(stored) : {};
	} catch (error) {
		console.warn('Failed to load custom topics:', error);
		return {};
	}
}

export function saveCustomTopics(topics: Record<string, Topic[]>) {
	if (typeof window === 'undefined') return;
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(topics));
	} catch (error) {
		console.debug('Failed to save custom topics:', error);
	}
}

export function calculateSubjectProgress(subjects: Subject[]): CurriculumStats {
	const totalTopics = subjects.reduce((acc, s) => acc + s.topics.length, 0);
	const masteredTopics = subjects.reduce(
		(acc, s) => acc + s.topics.filter((t) => t.status === 'mastered').length,
		0
	);
	const inProgressTopics = subjects.reduce(
		(acc, s) => acc + s.topics.filter((t) => t.status === 'in-progress').length,
		0
	);
	const overallProgress =
		totalTopics > 0
			? Math.round(((masteredTopics * 100 + inProgressTopics * 50) / totalTopics) * 100) / 100
			: 0;
	const totalQuestions = subjects.reduce(
		(acc, s) => acc + s.topics.reduce((a, t) => a + t.questionsAttempted, 0),
		0
	);

	return {
		totalTopics,
		masteredTopics,
		inProgressTopics,
		overallProgress,
		totalQuestions,
	};
}

export function calculateSubjectStats(subject: Subject) {
	const masteredCount = subject.topics.filter((t) => t.status === 'mastered').length;
	const inProgressCount = subject.topics.filter((t) => t.status === 'in-progress').length;
	const progressValue =
		subject.topics.length > 0
			? Math.round((masteredCount * 100 + inProgressCount * 50) / subject.topics.length)
			: 0;

	return { masteredCount, inProgressCount, progressValue };
}

export function calculateFilteredStats(subjects: Subject[]): FilteredStats {
	const allTopics = subjects.flatMap((s) => s.topics);
	const total = allTopics.length;
	const mastered = allTopics.filter((t) => t.status === 'mastered').length;
	const inProgress = allTopics.filter((t) => t.status === 'in-progress').length;
	const needsAttention = allTopics.filter(
		(t) => t.status === 'in-progress' && t.progress < 60
	).length;
	const questions = allTopics.reduce((acc, t) => acc + t.questionsAttempted, 0);
	return { total, mastered, inProgress, needsAttention, questions };
}

export function filterSubjects(
	subjects: Subject[],
	searchQuery: string,
	statusFilter: 'all' | 'mastered' | 'in-progress' | 'not-started' | 'needs-attention'
) {
	return subjects
		.map((subject) => ({
			...subject,
			topics: subject.topics.filter((topic) => {
				const matchesSearch =
					subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
					topic.name.toLowerCase().includes(searchQuery.toLowerCase());

				let matchesFilter = statusFilter === 'all' || topic.status === statusFilter;

				if (statusFilter === 'needs-attention') {
					matchesFilter = topic.status === 'in-progress' && topic.progress < 60;
				}

				return matchesSearch && matchesFilter;
			}),
		}))
		.filter((subject) => subject.topics.length > 0);
}

export function enrichSubjectsWithPrerequisites(
	subjects: Subject[],
	customTopics: Record<string, Topic[]>
) {
	return subjects.map((subject) => ({
		...subject,
		topics: [
			...subject.topics.map((t) => ({
				...t,
				prerequisites: getTopicPrerequisites(t.id),
			})),
			...(customTopics[subject.id] || []),
		],
	}));
}

export function useStudyRecommendations(subjects: Subject[]): StudyRecommendation[] {
	const getStudyRecommendations = useCallback((allSubjects: Subject[]): StudyRecommendation[] => {
		const recommendations: StudyRecommendation[] = [];

		for (const subject of allSubjects) {
			for (const topic of subject.topics) {
				if (topic.status === 'not-started') {
					const prereqs = topic.prerequisites || getTopicPrerequisites(topic.id);
					const prereqsMet = prereqs.every((prereqId) => {
						const prereqTopic = subject.topics.find((t) => t.id === prereqId);
						return prereqTopic?.status === 'mastered';
					});

					if (prereqsMet) {
						let reason = 'Ready to start';
						let priority = 50;

						if (prereqs.length > 0) {
							reason = 'Prerequisites mastered';
							priority = 80;
						}

						const weakTopics = allSubjects
							.flatMap((s) => s.topics)
							.filter((t) => t.status === 'in-progress' && t.progress < 60);

						if (weakTopics.length > 0) {
							priority = 30;
							reason = 'Focus on weak topics first';
						}

						recommendations.push({
							subjectId: subject.id,
							subjectName: subject.name,
							topicId: topic.id,
							topicName: topic.name,
							reason,
							priority,
						});
					}
				}
			}
		}

		recommendations.sort((a, b) => b.priority - a.priority);
		return recommendations.slice(0, 5);
	}, []);

	return useMemo(() => getStudyRecommendations(subjects), [subjects, getStudyRecommendations]);
}

export function useCurriculumData(customTopics: Record<string, Topic[]>) {
	return useMemo(
		() => enrichSubjectsWithPrerequisites(CURRICULUM_DATA, customTopics),
		[customTopics]
	);
}

export function createCustomTopic(subjectId: string, name: string): Topic {
	return {
		id: `${subjectId}-custom-${Date.now()}`,
		name: name.trim(),
		status: 'not-started',
		progress: 0,
		questionsAttempted: 0,
		isCustom: true,
		difficulty: 'medium',
		timeToMaster: 8,
	};
}

export function getAllTopicsCount(subjects: Subject[]): number {
	return subjects.reduce((acc, s) => acc + s.topics.length, 0);
}

export function getTopicsByStatus(
	subjects: Subject[],
	status: 'mastered' | 'in-progress' | 'not-started'
): number {
	return subjects.reduce((acc, s) => acc + s.topics.filter((t) => t.status === status).length, 0);
}
