'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { appConfig } from '@/app.config';

interface DownloadProgress {
	[id: string]: number;
}

interface OfflineState {
	isOnline: boolean;
	lastSynced: Date | null;
	downloadedQuizzes: string[];
	downloadedPapers: string[];
	downloadProgress: DownloadProgress;
	totalDownloaded: number;
	downloadQuiz: (quizId: string) => void;
	removeDownloadedQuiz: (quizId: string) => void;
	isQuizDownloaded: (quizId: string) => boolean;
	downloadPaper: (paperId: string) => void;
	removeDownloadedPaper: (paperId: string) => void;
	isPaperDownloaded: (paperId: string) => boolean;
	setDownloadProgress: (id: string, progress: number) => void;
	clearDownloadProgress: (id: string) => void;
	setOnlineStatus: (isOnline: boolean) => void;
	updateTotalDownloaded: () => void;
}

export const useOfflineStore = create<OfflineState>()(
	persist(
		(set, get) => ({
			isOnline: true,
			lastSynced: null,
			downloadedQuizzes: [],
			downloadedPapers: [],
			downloadProgress: {},
			totalDownloaded: 0,

			downloadQuiz: (quizId: string) => {
				const current = get().downloadedQuizzes;
				if (!current.includes(quizId)) {
					set({ downloadedQuizzes: [...current, quizId] });
					get().updateTotalDownloaded();
				}
			},

			removeDownloadedQuiz: (quizId: string) => {
				set({
					downloadedQuizzes: get().downloadedQuizzes.filter((id) => id !== quizId),
				});
				get().updateTotalDownloaded();
			},

			isQuizDownloaded: (quizId: string) => {
				return get().downloadedQuizzes.includes(quizId);
			},

			downloadPaper: (paperId: string) => {
				const current = get().downloadedPapers;
				if (!current.includes(paperId)) {
					set({ downloadedPapers: [...current, paperId] });
					get().updateTotalDownloaded();
				}
			},

			removeDownloadedPaper: (paperId: string) => {
				set({
					downloadedPapers: get().downloadedPapers.filter((id) => id !== paperId),
				});
				get().updateTotalDownloaded();
			},

			isPaperDownloaded: (paperId: string) => {
				return get().downloadedPapers.includes(paperId);
			},

			setDownloadProgress: (id: string, progress: number) => {
				set((state) => ({
					downloadProgress: { ...state.downloadProgress, [id]: progress },
				}));
			},

			clearDownloadProgress: (id: string) => {
				set((state) => {
					const { [id]: _, ...rest } = state.downloadProgress;
					return { downloadProgress: rest };
				});
			},

			setOnlineStatus: (isOnline: boolean) => {
				set({ isOnline, lastSynced: isOnline ? new Date() : null });
			},

			updateTotalDownloaded: () => {
				const state = get();
				set({
					totalDownloaded: state.downloadedQuizzes.length + state.downloadedPapers.length,
				});
			},
		}),
		{
			name: `${appConfig.name}-offline`,
			partialize: (state) => ({
				downloadedQuizzes: state.downloadedQuizzes,
				downloadedPapers: state.downloadedPapers,
				totalDownloaded: state.totalDownloaded,
			}),
		}
	)
);
