import { type NextRequest, NextResponse } from 'next/server';
import { publishToChannel } from '@/lib/ably/client';
import { getAuth } from '@/lib/auth';
import { createDailyRoom, getDailyRoom } from '@/lib/video/daily';

export async function POST(request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({ headers: request.headers });

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const { participantIds, subject } = body;

		if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
			return NextResponse.json({ error: 'Participant IDs required' }, { status: 400 });
		}

		if (!subject || typeof subject !== 'string') {
			return NextResponse.json({ error: 'Subject required' }, { status: 400 });
		}

		const slug = subject
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/(^-|-$)/g, '');
		const timestamp = Date.now();
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
				max_participants: 4,
			},
		});

		const roomUrl = dailyRoom?.url || `https://${roomName}.daily.co`;
		const isReal = !!dailyRoom;

		const invitePromises = participantIds.map(async (participantId: string) => {
			if (participantId === session.user.id) return;

			try {
				await publishToChannel(`user:${participantId}:notifications`, 'video-call-invite', {
					id: `${roomName}-${participantId}`,
					type: 'video-call-invite',
					callerId: session.user.id,
					callerName: session.user.name || 'Study Buddy',
					roomName,
					roomUrl,
					subject,
					expiresAt: Date.now() + 30000,
				});
			} catch (err) {
				console.debug(`Failed to notify participant ${participantId}:`, err);
			}
		});

		await Promise.allSettled(invitePromises);

		return NextResponse.json(
			{
				success: true,
				data: {
					roomName,
					roomUrl,
					isReal,
				},
			},
			{ status: 201 }
		);
	} catch (error) {
		console.debug('Error creating video call room:', error);
		return NextResponse.json({ error: 'Failed to create video call room' }, { status: 500 });
	}
}

export async function GET(request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({ headers: request.headers });

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const roomName = searchParams.get('room');

		if (!roomName) {
			return NextResponse.json({ error: 'Room name required' }, { status: 400 });
		}

		const room = await getDailyRoom(roomName);

		if (!room) {
			return NextResponse.json({
				success: true,
				data: {
					roomName,
					exists: false,
					url: `https://${roomName}.daily.co`,
				},
			});
		}

		return NextResponse.json({
			success: true,
			data: {
				roomName: room.name,
				exists: true,
				url: room.url,
				config: room.config,
				created_at: room.created_at,
			},
		});
	} catch (error) {
		console.debug('Error getting video call room:', error);
		return NextResponse.json({ error: 'Failed to get video call room' }, { status: 500 });
	}
}
