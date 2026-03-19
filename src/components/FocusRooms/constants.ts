export interface FocusSession {
	clientId: string;
	data: {
		user?: string;
		status?: string;
		focusMinutes?: number;
	};
}

export interface BuddyLeaderboard {
	userId: string;
	name: string;
	focusMinutes: number;
	avatar: string;
}

export const MOCK_LEADERBOARD: BuddyLeaderboard[] = [
	{ userId: '1', name: 'Themba', focusMinutes: 245, avatar: 'T' },
	{ userId: '2', name: 'Lerato', focusMinutes: 198, avatar: 'L' },
	{ userId: '3', name: 'Sibusiso', focusMinutes: 156, avatar: 'S' },
	{ userId: '4', name: 'Priya', focusMinutes: 134, avatar: 'P' },
];
