'use client';

import { redirect, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { VideoCall } from '@/components/StudyBuddies/VideoCall';
import { useSession } from '@/lib/auth-client';

interface Participant {
	id: string;
	name: string;
	avatar?: string;
	isMuted: boolean;
	hasVideo: boolean;
}

function VideoCallPageContent() {
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
		} catch (error) {
			console.error('Failed to parse participants:', error);
			setParticipants([]);
		}
	}, [participantsParam]);

	useEffect(() => {
		if (!roomName || !roomUrl) {
			redirect('/study-buddies');
		}
	}, [roomName, roomUrl]);

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

function VideoCallPageSkeleton() {
	return (
		<div className="min-h-screen bg-background flex items-center justify-center">
			<div className="animate-pulse space-y-4">
				<div className="h-8 w-32 bg-muted rounded" />
				<div className="h-64 w-96 bg-muted rounded-lg" />
			</div>
		</div>
	);
}

export default function VideoCallPage() {
	return (
		<Suspense fallback={<VideoCallPageSkeleton />}>
			<VideoCallPageContent />
		</Suspense>
	);
}
