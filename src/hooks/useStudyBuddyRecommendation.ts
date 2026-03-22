'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface StudyBuddy {
	id: string;
	name: string;
	avatar?: string;
	school?: string;
	subjectExpertise: { subject: string; level: number }[];
	currentStreak: number;
	totalXP: number;
	focusRoomActive?: boolean;
}

export interface StudyBuddyMatch {
	buddy: StudyBuddy;
	matchReason: string;
	compatibilityScore: number;
}

interface StudyBuddyStore {
	buddies: StudyBuddy[];
	recommendedBuddies: StudyBuddyMatch[];
	isLoading: boolean;
	fetchRecommendations: (
		userId: string,
		weakTopics: { topic: string; subject: string }[]
	) => Promise<void>;
	findBuddyForTopic: (topic: string, subject: string) => StudyBuddy | null;
	setOnline: (buddyId: string, isOnline: boolean) => void;
}

export const useStudyBuddyStore = create<StudyBuddyStore>()(
	persist(
		(set, get) => ({
			buddies: [],
			recommendedBuddies: [],
			isLoading: false,

			fetchRecommendations: async (userId, weakTopics) => {
				set({ isLoading: true });
				try {
					const response = await fetch('/api/buddies/recommend', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							userId,
							weakTopics,
						}),
					});

					const data = await response.json();
					set({
						recommendedBuddies: data.recommendations || [],
						buddies: data.allBuddies || get().buddies,
					});
				} catch (error) {
					console.debug('Failed to fetch buddy recommendations:', error);
				} finally {
					set({ isLoading: false });
				}
			},

			findBuddyForTopic: (_topic, subject) => {
				const { buddies, recommendedBuddies } = get();
				const candidates = [...recommendedBuddies.map((r) => r.buddy), ...buddies];

				const matching = candidates.filter((b) =>
					b.subjectExpertise.some(
						(s) => s.subject.toLowerCase() === subject.toLowerCase() && s.level >= 5
					)
				);

				if (matching.length === 0) return null;

				return matching.sort((a, b) => b.totalXP - a.totalXP)[0];
			},

			setOnline: (buddyId, isOnline) => {
				set((state) => ({
					buddies: state.buddies.map((b) =>
						b.id === buddyId ? { ...b, focusRoomActive: isOnline } : b
					),
				}));
			},
		}),
		{
			name: 'study-buddy-storage',
			partialize: (state) => ({
				buddies: state.buddies,
			}),
		}
	)
);
