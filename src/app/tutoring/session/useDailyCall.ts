import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import type { DailyCallFrame } from './types';

export function useDailyCall(roomName: string | null, token: string | null) {
	const router = useRouter();
	const containerRef = useRef<HTMLDivElement>(null);
	const callFrameRef = useRef<DailyCallFrame | null>(null);

	const [isVideoOn, setIsVideoOn] = useState(true);
	const [isAudioOn, setIsAudioOn] = useState(true);
	const [isScreenSharing, setIsScreenSharing] = useState(false);
	const [isChatOpen, setIsChatOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [participantCount, setParticipantCount] = useState(1);
	const [roomUrl, setRoomUrl] = useState('');

	const updateParticipants = useCallback(() => {
		if (callFrameRef.current) {
			const participants = callFrameRef.current.participants();
			setParticipantCount(Object.keys(participants).length);
		}
	}, []);

	const updateParticipantsRef = useRef(updateParticipants);
	updateParticipantsRef.current = updateParticipants;

	useEffect(() => {
		if (!roomName || !token) {
			toast.error('Invalid session. Please create a new tutoring session.');
			router.push('/tutoring');
			return;
		}

		const domain = process.env.NEXT_PUBLIC_DAILY_DOMAIN || 'matricmaster.daily.co';
		const url = `https://${domain}/${roomName}`;
		setRoomUrl(url);

		const initDaily = async () => {
			if (!containerRef.current) return;

			const script = document.createElement('script');
			script.src = 'https://unpkg.com/@daily-co/daily-js';
			script.async = true;
			document.body.appendChild(script);

			await new Promise<void>((resolve) => {
				script.onload = () => resolve();
			});

			if (window.DailyIframe && containerRef.current) {
				callFrameRef.current = window.DailyIframe.createFrame(containerRef.current, {
					iframeStyle: {
						width: '100%',
						height: '100%',
						border: '0',
						borderRadius: '12px',
					},
					showLeaveButton: true,
					showFullscreenButton: true,
				});

				callFrameRef.current.on('joinedMeeting', () => {
					setIsLoading(false);
					updateParticipantsRef.current();
				});

				callFrameRef.current.on('leftMeeting', () => {
					toast.info('You left the session');
					router.push('/tutoring');
				});

				callFrameRef.current.on('participantJoined', () => {
					updateParticipantsRef.current();
					toast.success('A participant joined');
				});

				callFrameRef.current.on('participantLeft', () => {
					updateParticipantsRef.current();
				});

				try {
					await callFrameRef.current.join({
						url,
						token,
						videoStart: true,
						audioStart: true,
					});
				} catch (error) {
					console.debug('Failed to join:', error);
					toast.error('Failed to join the video call');
					setIsLoading(false);
				}
			}
		};

		initDaily();

		return () => {
			if (callFrameRef.current) {
				callFrameRef.current.leave();
				callFrameRef.current.destroy();
			}
		};
	}, [roomName, token, router]);

	const toggleVideo = () => {
		if (callFrameRef.current) {
			callFrameRef.current.setLocalVideo(!isVideoOn);
			setIsVideoOn(!isVideoOn);
		}
	};

	const toggleAudio = () => {
		if (callFrameRef.current) {
			callFrameRef.current.setLocalAudio(!isAudioOn);
			setIsAudioOn(!isAudioOn);
		}
	};

	const toggleScreenShare = async () => {
		if (!callFrameRef.current) return;

		try {
			if (isScreenSharing) {
				callFrameRef.current.stopScreenShare();
				setIsScreenSharing(false);
			} else {
				await callFrameRef.current.startScreenShare();
				setIsScreenSharing(true);
			}
		} catch (_error) {
			toast.error('Screen sharing failed');
		}
	};

	const copyRoomLink = async () => {
		await navigator.clipboard.writeText(roomUrl);
		toast.success('Room link copied!');
	};

	const leaveCall = async () => {
		if (callFrameRef.current) {
			await callFrameRef.current.leave();
		}
		router.push('/tutoring');
	};

	return {
		containerRef,
		isVideoOn,
		isAudioOn,
		isScreenSharing,
		isChatOpen,
		setIsChatOpen,
		isLoading,
		participantCount,
		toggleVideo,
		toggleAudio,
		toggleScreenShare,
		copyRoomLink,
		leaveCall,
	};
}
