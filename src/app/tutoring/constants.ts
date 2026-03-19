export interface TutoringSession {
	id: string;
	roomName: string;
	hostName: string;
	subject: string;
	startTime: Date;
	maxParticipants: number;
	currentParticipants: number;
	status: 'scheduled' | 'live' | 'ended';
}

export const MOCK_SESSIONS: TutoringSession[] = [
	{
		id: '1',
		roomName: 'math-papers',
		hostName: 'Mr. Johnson',
		subject: 'Mathematics',
		startTime: new Date(),
		maxParticipants: 4,
		currentParticipants: 2,
		status: 'live',
	},
	{
		id: '2',
		roomName: 'physics-101',
		hostName: 'Ms. Williams',
		subject: 'Physical Sciences',
		startTime: new Date(Date.now() + 3600000),
		maxParticipants: 6,
		currentParticipants: 0,
		status: 'scheduled',
	},
];
