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
	fallbackReason?: string;
}

export async function createStudyRoom(
	participantIds: string[],
	subject: string
): Promise<StudyRoomResult> {
	const timestamp = Date.now();
	const slug = slugifySubject(subject);
	const roomName = `study-${slug}-${timestamp}`;

	const dailyRoomResult = await createDailyRoom({
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

	if (dailyRoomResult.success) {
		return {
			roomName: dailyRoomResult.room.name,
			roomUrl: dailyRoomResult.room.url,
			isMock: false,
		};
	}

	const fallbackReason = dailyRoomResult.error;
	console.warn(`[VideoCall] Daily.co API fallback triggered: ${fallbackReason}`);

	const domain = process.env.NEXT_PUBLIC_DAILY_DOMAIN || 'lumni';
	return {
		roomName,
		roomUrl: `https://${domain}.daily.co/${roomName}`,
		isMock: true,
		fallbackReason,
	};
}

export interface StudyRoomInfo {
	roomName: string;
	roomUrl: string;
	exists: boolean;
}

export async function getStudyRoom(roomName: string): Promise<StudyRoomInfo> {
	const dailyRoom = await getDailyRoomInfo(roomName);

	if (dailyRoom?.success) {
		return {
			roomName: dailyRoom.room.name,
			roomUrl: dailyRoom.room.url,
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
