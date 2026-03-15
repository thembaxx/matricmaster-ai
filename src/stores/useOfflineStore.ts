'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface OfflineState {
	isOnline: boolean;
	lastSynced: Date | null;
	downloadedQuizzes: string[];
	downloadQuiz: (quizId: string) => void;
	removeDownloadedQuiz: (quizId: string) => void;
	isQuizDownloaded: (quizId: string) => boolean;
	setOnlineStatus: (isOnline: boolean) => void;
}

export const useOfflineStore = create<OfflineState>()(
	persist(
		(set, get) => ({
			isOnline: true,
			lastSynced: null,
			downloadedQuizzes: [],

			downloadQuiz: (quizId: string) => {
				const current = get().downloadedQuizzes;
				if (!current.includes(quizId)) {
					set({ downloadedQuizzes: [...current, quizId] });
				}
			},

			removeDownloadedQuiz: (quizId: string) => {
				set({
					downloadedQuizzes: get().downloadedQuizzes.filter((id) => id !== quizId),
				});
			},

			isQuizDownloaded: (quizId: string) => {
				return get().downloadedQuizzes.includes(quizId);
			},

			setOnlineStatus: (isOnline: boolean) => {
				set({ isOnline, lastSynced: isOnline ? new Date() : null });
			},
		}),
		{
			name: 'matricmaster-offline',
		}
	)
);
