'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LearningSession, UserLearningProfile } from '@/types/learning-profile';

interface UserLearningProfileStore {
	profile: UserLearningProfile | null;
	sessions: LearningSession[];
	isLoading: boolean;
	error: string | null;

	// Actions
	setProfile: (profile: UserLearningProfile) => void;
	updateProfile: (updates: Partial<UserLearningProfile>) => void;
	addInteraction: (interaction: UserLearningProfile['interactionHistory'][0]) => void;
	addSession: (session: LearningSession) => void;
	updateSubjectMastery: (subject: string, topic: string, score: number) => void;
	updateWeakAreas: (weakAreas: string[]) => void;
	updateStrengthAreas: (strengthAreas: string[]) => void;
	resetProfile: () => void;

	// Computed
	getSubjectMastery: (subject: string) => UserLearningProfile['subjectMastery'][string] | null;
	getTopicScore: (subject: string, topic: string) => number;
	getRecommendedDifficulty: (subject: string) => 'easy' | 'medium' | 'hard';
	getPersonalizedTips: (subject: string, topic: string) => string[];
}

const defaultProfile: UserLearningProfile = {
	userId: '',
	createdAt: new Date(),
	updatedAt: new Date(),
	preferredDifficulty: 'medium',
	preferredPace: 'moderate',
	learningStyle: 'visual',
	sessionDuration: 45,
	preferredSubjects: [],
	contentTypes: ['text', 'visual', 'examples'],
	subjectMastery: {},
	interactionHistory: [],
	strengthAreas: [],
	weakAreas: [],
	improvementRate: {},
	responseToDifficulty: {
		easy: 0.8,
		medium: 0.7,
		hard: 0.5,
	},
	learningVelocity: 0,
	consistencyScore: 0,
	riskOfBurnout: 'low',
	lastPersonalizationUpdate: new Date(),
	preferredContentTypes: ['text', 'visual', 'examples'],
};

// Keep for future use when we want default profile initialization
void defaultProfile;

export const useUserLearningProfileStore = create<UserLearningProfileStore>()(
	persist(
		(set, get) => ({
			profile: null,
			sessions: [],
			isLoading: false,
			error: null,

			setProfile: (profile) => set({ profile }),

			updateProfile: (updates) => {
				const current = get().profile;
				if (!current) return;

				const updated = {
					...current,
					...updates,
					updatedAt: new Date(),
				};
				set({ profile: updated });
			},

			addInteraction: (interaction) => {
				const current = get().profile;
				if (!current) return;

				const updatedHistory = [...current.interactionHistory, interaction].slice(-100); // Keep last 100 interactions
				get().updateProfile({ interactionHistory: updatedHistory });
			},

			addSession: (session) => {
				const sessions = [...get().sessions, session].slice(-50); // Keep last 50 sessions
				set({ sessions });
			},

			updateSubjectMastery: (subject, topic, score) => {
				const current = get().profile;
				if (!current) return;

				const subjectMastery = { ...current.subjectMastery };
				if (!subjectMastery[subject]) {
					subjectMastery[subject] = {
						overallScore: score,
						topicScores: { [topic]: score },
						attempts: 1,
						lastAttempted: new Date(),
					};
				} else {
					const topicScores = { ...subjectMastery[subject].topicScores };
					topicScores[topic] = score;

					const topicScoreValues = Object.values(topicScores);
					const overallScore =
						topicScoreValues.reduce((sum, s) => sum + s, 0) / topicScoreValues.length;

					subjectMastery[subject] = {
						overallScore,
						topicScores,
						attempts: subjectMastery[subject].attempts + 1,
						lastAttempted: new Date(),
					};
				}

				get().updateProfile({ subjectMastery });
			},

			updateWeakAreas: (weakAreas) => {
				get().updateProfile({ weakAreas });
			},

			updateStrengthAreas: (strengthAreas) => {
				get().updateProfile({ strengthAreas });
			},

			resetProfile: () => {
				set({ profile: null, sessions: [] });
			},

			getSubjectMastery: (subject) => {
				const profile = get().profile;
				return profile?.subjectMastery[subject] || null;
			},

			getTopicScore: (subject, topic) => {
				const subjectMastery = get().getSubjectMastery(subject);
				return subjectMastery?.topicScores[topic] || 0;
			},

			getRecommendedDifficulty: (subject) => {
				const profile = get().profile;
				if (!profile) return 'medium';

				const subjectMastery = profile.subjectMastery[subject];
				if (!subjectMastery) return profile.preferredDifficulty;

				const overallScore = subjectMastery.overallScore;

				if (overallScore >= 80) return 'hard';
				if (overallScore >= 60) return 'medium';
				return 'easy';
			},

			getPersonalizedTips: (subject, topic) => {
				const profile = get().profile;
				if (!profile) return [];

				const tips: string[] = [];

				const topicScore = get().getTopicScore(subject, topic);
				if (topicScore < 50) {
					tips.push(`Focus on foundational concepts in ${topic}`);
				}

				if (profile.learningStyle === 'visual') {
					tips.push('Try using diagrams and visual aids');
				} else if (profile.learningStyle === 'auditory') {
					tips.push('Consider recording explanations and listening back');
				}

				if (profile.preferredContentTypes.includes('examples')) {
					tips.push('Look for real-world examples and applications');
				}

				return tips;
			},
		}),
		{
			name: 'user-learning-profile',
			partialize: (state) => ({
				profile: state.profile,
				sessions: state.sessions,
			}),
		}
	)
);
