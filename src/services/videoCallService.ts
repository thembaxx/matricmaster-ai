'use server';

import { createDailyRoom, getDailyRoom as getDailyRoomInfo } from '@/lib/video/daily';

function slugifySubject(subject: string): string {
	return subject
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)/g, '');
}

export interface StudyRoomResult {
	roomName: string;
	roomUrl: string;
	isMock: boolean;
}

export async function createStudyRoom(
	participantIds: string[],
	subject: string
): Promise<StudyRoomResult> {
	const timestamp = Date.now();
	const slug = slugifySubject(subject);
	const roomName = `study-${slug}-${timestamp}`;

	const dailyRoom = await createDailyRoom({
		name: roomName,
		privacy: 'private',
		properties: {
			enable_screenshare: true,
			enable_chat: true,
			enable_knocking: false,
			start_video_off: false,
			start_audio_off: false,
			exp: Math.floor(Date.now() / 1000) + 3600 * 2,
			max_participants: Math.max(participantIds.length + 2, 4),
		},
	});

	if (dailyRoom) {
		return {
			roomName: dailyRoom.name,
			roomUrl: dailyRoom.url,
			isMock: false,
		};
	}

	const domain = process.env.NEXT_PUBLIC_DAILY_DOMAIN || 'lumni';
	return {
		roomName,
		roomUrl: `https://${domain}.daily.co/${roomName}`,
		isMock: true,
	};
}

export interface StudyRoomInfo {
	roomName: string;
	roomUrl: string;
	exists: boolean;
}

export async function getStudyRoom(roomName: string): Promise<StudyRoomInfo> {
	const dailyRoom = await getDailyRoomInfo(roomName);

	if (dailyRoom) {
		return {
			roomName: dailyRoom.name,
			roomUrl: dailyRoom.url,
			exists: true,
		};
	}

	const domain = process.env.NEXT_PUBLIC_DAILY_DOMAIN || 'lumni';
	return {
		roomName,
		roomUrl: `https://${domain}.daily.co/${roomName}`,
		exists: false,
	};
}
