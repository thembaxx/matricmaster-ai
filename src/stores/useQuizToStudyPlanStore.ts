'use client';

import { create } from 'zustand';

export interface WeakTopic {
	id: string;
	topic: string;
	subject: string;
	confidence: number;
	attempts: number;
	source: 'quiz' | 'review' | 'manual';
	addedAt: Date;
}

interface QuizToStudyPlanState {
	weakTopics: WeakTopic[];
	hasSyncedFromQuiz: boolean;
	addWeakTopic: (topic: WeakTopic) => void;
	addWeakTopics: (topics: WeakTopic[]) => void;
	removeWeakTopic: (id: string) => void;
	clearWeakTopics: () => void;
	setHasSyncedFromQuiz: (synced: boolean) => void;
	getWeakTopicsForStudyPlan: () => WeakTopic[];
}

export const useQuizToStudyPlanStore = create<QuizToStudyPlanState>((set, get) => ({
	weakTopics: [],
	hasSyncedFromQuiz: false,

	addWeakTopic: (topic) => {
		set((state) => {
			const exists = state.weakTopics.some(
				(t) => t.topic === topic.topic && t.subject === topic.subject
			);
			if (exists) return state;
			return { weakTopics: [...state.weakTopics, topic] };
		});
	},

	addWeakTopics: (topics) => {
		set((state) => {
			const newTopics = topics.filter(
				(t) =>
					!state.weakTopics.some(
						(existing) => existing.topic === t.topic && existing.subject === t.subject
					)
			);
			return { weakTopics: [...state.weakTopics, ...newTopics] };
		});
	},

	removeWeakTopic: (id) => {
		set((state) => ({
			weakTopics: state.weakTopics.filter((t) => t.id !== id),
		}));
	},

	clearWeakTopics: () => {
		set({ weakTopics: [], hasSyncedFromQuiz: false });
	},

	setHasSyncedFromQuiz: (synced) => {
		set({ hasSyncedFromQuiz: synced });
	},

	getWeakTopicsForStudyPlan: () => {
		return get().weakTopics.filter((t) => t.confidence < 0.6);
	},
}));
