import { create } from 'zustand';

export interface CollaborativeSession {
	id: string;
	hostId: string;
	participantIds: string[];
	startTime: number;
	focusMinutes: number;
	isActive: boolean;
}

export interface BuddyFocusStats {
	buddyId: string;
	totalFocusMinutes: number;
	sessionCount: number;
	lastSessionDate?: string;
	recentSessions: {
		date: string;
		minutes: number;
	}[];
}

export interface FocusInvite {
	id: string;
	fromUserId: string;
	fromUserName: string;
	sessionId: string;
	timestamp: number;
	status: 'pending' | 'accepted' | 'declined';
}

interface CollaborativeFocusState {
	activeSession: CollaborativeSession | null;
	collaborativeStats: Record<string, BuddyFocusStats>;
	pendingInvites: FocusInvite[];
	onlineBuddiesFocusing: Record<string, { timeLeft: number; startedAt: number }>;
	buddyLeaderboard: { buddyId: string; name: string; focusMinutes: number; avatar?: string }[];

	setActiveSession: (session: CollaborativeSession | null) => void;
	addParticipant: (buddyId: string) => void;
	removeParticipant: (buddyId: string) => void;
	updateBuddyFocusStatus: (buddyId: string, timeLeft: number, startedAt: number) => void;
	removeBuddyFocusStatus: (buddyId: string) => void;
	addPendingInvite: (invite: FocusInvite) => void;
	updateInviteStatus: (inviteId: string, status: 'accepted' | 'declined') => void;
	updateCollaborativeStats: (buddyId: string, minutes: number) => void;
	setBuddyLeaderboard: (
		leaderboard: { buddyId: string; name: string; focusMinutes: number; avatar?: string }[]
	) => void;
	incrementFocusTime: (buddyId: string, minutes: number) => void;
	reset: () => void;
}

export const useCollaborativeFocusStore = create<CollaborativeFocusState>((set) => ({
	activeSession: null,
	collaborativeStats: {},
	pendingInvites: [],
	onlineBuddiesFocusing: {},
	buddyLeaderboard: [],

	setActiveSession: (session) => set({ activeSession: session }),

	addParticipant: (buddyId) =>
		set((state) => {
			if (!state.activeSession) return state;
			if (state.activeSession.participantIds.includes(buddyId)) return state;
			return {
				activeSession: {
					...state.activeSession,
					participantIds: [...state.activeSession.participantIds, buddyId],
				},
			};
		}),

	removeParticipant: (buddyId) =>
		set((state) => {
			if (!state.activeSession) return state;
			return {
				activeSession: {
					...state.activeSession,
					participantIds: state.activeSession.participantIds.filter((id) => id !== buddyId),
				},
			};
		}),

	updateBuddyFocusStatus: (buddyId, timeLeft, startedAt) =>
		set((state) => ({
			onlineBuddiesFocusing: {
				...state.onlineBuddiesFocusing,
				[buddyId]: { timeLeft, startedAt },
			},
		})),

	removeBuddyFocusStatus: (buddyId) =>
		set((state) => {
			const newFocusing = { ...state.onlineBuddiesFocusing };
			delete newFocusing[buddyId];
			return { onlineBuddiesFocusing: newFocusing };
		}),

	addPendingInvite: (invite) =>
		set((state) => ({
			pendingInvites: [...state.pendingInvites, invite],
		})),

	updateInviteStatus: (inviteId, status) =>
		set((state) => ({
			pendingInvites: state.pendingInvites.map((invite) =>
				invite.id === inviteId ? { ...invite, status } : invite
			),
		})),

	updateCollaborativeStats: (buddyId, minutes) =>
		set((state) => {
			const existing = state.collaborativeStats[buddyId] || {
				buddyId,
				totalFocusMinutes: 0,
				sessionCount: 0,
				recentSessions: [],
			};
			const today = new Date().toISOString().split('T')[0];
			const existingTodaySession = existing.recentSessions.find((s) => s.date === today);

			return {
				collaborativeStats: {
					...state.collaborativeStats,
					[buddyId]: {
						...existing,
						totalFocusMinutes: existing.totalFocusMinutes + minutes,
						sessionCount: existing.sessionCount + 1,
						lastSessionDate: new Date().toISOString(),
						recentSessions: existingTodaySession
							? existing.recentSessions.map((s) =>
									s.date === today ? { ...s, minutes: s.minutes + minutes } : s
								)
							: [...existing.recentSessions.slice(-6), { date: today, minutes }],
					},
				},
			};
		}),

	setBuddyLeaderboard: (leaderboard) => set({ buddyLeaderboard: leaderboard }),

	incrementFocusTime: (buddyId, minutes) =>
		set((state) => {
			const stats = state.collaborativeStats[buddyId] || {
				buddyId,
				totalFocusMinutes: 0,
				sessionCount: 0,
				recentSessions: [],
			};
			return {
				collaborativeStats: {
					...state.collaborativeStats,
					[buddyId]: {
						...stats,
						totalFocusMinutes: stats.totalFocusMinutes + minutes,
					},
				},
			};
		}),

	reset: () =>
		set({
			activeSession: null,
			pendingInvites: [],
			onlineBuddiesFocusing: {},
		}),
}));
