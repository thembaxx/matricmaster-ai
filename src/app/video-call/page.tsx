'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { VideoCall } from '@/components/StudyBuddies/VideoCall';
import { useSession } from '@/lib/auth-client';

interface Participant {
	id: string;
	name: string;
	avatar?: string;
	isMuted: boolean;
	hasVideo: boolean;
}

export default function VideoCallPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { data: session } = useSession();

	const roomName = searchParams.get('room') || '';
	const subject = searchParams.get('subject') || 'Study Session';
	const roomUrl = searchParams.get('url') || '';
	const participantsParam = searchParams.get('participants') || '[]';

	const [participants, setParticipants] = useState<Participant[]>([]);

	useEffect(() => {
		try {
			const parsed = JSON.parse(participantsParam);
			setParticipants(
				Array.isArray(parsed)
					? parsed.map((p: Participant) => ({
							...p,
							isMuted: p.isMuted ?? false,
							hasVideo: p.hasVideo ?? true,
						}))
					: []
			);
		} catch {
			setParticipants([]);
		}
	}, [participantsParam]);

	useEffect(() => {
		if (!roomName || !roomUrl) {
			router.push('/study-buddies');
		}
	}, [roomName, roomUrl, router]);

	const handleLeave = useCallback(() => {
		router.push('/study-buddies');
	}, [router]);

	if (!session?.user || !roomName || !roomUrl) {
		return null;
	}

	return (
		<VideoCall
			roomUrl={roomUrl}
			roomName={roomName}
			subject={subject}
			currentUserId={session.user.id}
			currentUserName={session.user.name || 'You'}
			participants={participants}
			onLeave={handleLeave}
		/>
	);
}
