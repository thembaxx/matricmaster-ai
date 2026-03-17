'use client';

import {
	ArrowLeftIcon,
	Chat01Icon,
	CopyIcon,
	GridIcon,
	Loading03Icon,
	MicIcon,
	PhoneOffIcon,
	PlayIcon,
	StopIcon,
	UserMultiple02Icon,
	VolumeMute01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

declare global {
	interface Window {
		DailyIframe: {
			createFrame: (element: HTMLElement, options: Record<string, unknown>) => DailyCallFrame;
		};
	}
}

interface DailyCallFrame {
	join: (options: Record<string, unknown>) => Promise<void>;
	leave: () => Promise<void>;
	destroy: () => void;
	on: (event: string, callback: (data: unknown) => void) => void;
	off: (event: string, callback: (data: unknown) => void) => void;
	setLocalVideo: (enabled: boolean) => void;
	setLocalAudio: (enabled: boolean) => void;
	startScreenShare: () => Promise<void>;
	stopScreenShare: () => void;
	participants: () => Record<string, unknown>;
}

export default function TutoringSessionPage() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const containerRef = useRef<HTMLDivElement>(null);
	const callFrameRef = useRef<DailyCallFrame | null>(null);

	const roomName = searchParams.get('room');
	const token = searchParams.get('token');
	const isHost = searchParams.get('host') === 'true';

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
					updateParticipants();
				});

				callFrameRef.current.on('leftMeeting', () => {
					toast.info('You left the session');
					router.push('/tutoring');
				});

				callFrameRef.current.on('participantJoined', () => {
					updateParticipants();
					toast.success('A participant joined');
				});

				callFrameRef.current.on('participantLeft', () => {
					updateParticipants();
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
	}, [roomName, token, router, updateParticipants]);

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

	return (
		<div className="min-h-screen bg-background flex flex-col">
			<header className="border-b px-4 py-3 flex items-center justify-between">
				<div className="flex items-center gap-3">
					<Button variant="ghost" size="icon" onClick={() => router.push('/tutoring')}>
						<HugeiconsIcon icon={ArrowLeftIcon} className="w-5 h-5" />
					</Button>
					<div>
						<h1 className="font-semibold">Live Tutoring Session</h1>
						<p className="text-sm text-muted-foreground">
							{isHost ? 'Hosting a session' : 'In a session'}
						</p>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Badge variant="outline" className="gap-1">
						<HugeiconsIcon icon={UserMultiple02Icon} className="w-4 h-4" />
						{participantCount}
					</Badge>
					<Button variant="outline" size="sm" onClick={copyRoomLink}>
						<HugeiconsIcon icon={CopyIcon} className="w-4 h-4 mr-1" />
						Copy Link
					</Button>
				</div>
			</header>

			<main className="flex-1 flex">
				<div className="flex-1 relative">
					{isLoading && (
						<div className="absolute inset-0 flex items-center justify-center bg-background z-10">
							<div className="flex flex-col items-center gap-4">
								<HugeiconsIcon icon={Loading03Icon} className="w-8 h-8 animate-spin text-primary" />
								<p className="text-muted-foreground">Joining session...</p>
							</div>
						</div>
					)}
					<div ref={containerRef} className="w-full h-full" />
				</div>

				{isChatOpen && (
					<Card className="w-80 border-l-0 rounded-none">
						<CardHeader className="border-b py-3">
							<CardTitle className="text-sm">Chat</CardTitle>
						</CardHeader>
						<CardContent className="p-0 flex flex-col h-[calc(100%-52px)]">
							<div className="flex-1 p-4 overflow-y-auto">
								<p className="text-sm text-muted-foreground text-center">No messages yet</p>
							</div>
							<div className="p-3 border-t">
								<Input placeholder="Type a message..." />
							</div>
						</CardContent>
					</Card>
				)}
			</main>

			<div className="border-t p-4">
				<div className="flex items-center justify-center gap-3">
					<Button
						variant={isAudioOn ? 'default' : 'destructive'}
						size="lg"
						onClick={toggleAudio}
						className="w-12 h-12 rounded-full"
					>
						<HugeiconsIcon icon={isAudioOn ? MicIcon : VolumeMute01Icon} className="w-5 h-5" />
					</Button>

					<Button
						variant={isVideoOn ? 'default' : 'destructive'}
						size="lg"
						onClick={toggleVideo}
						className="w-12 h-12 rounded-full"
					>
						<HugeiconsIcon icon={isVideoOn ? PlayIcon : StopIcon} className="w-5 h-5" />
					</Button>

					<Button
						variant={isScreenSharing ? 'default' : 'outline'}
						size="lg"
						onClick={toggleScreenShare}
						className="w-12 h-12 rounded-full"
					>
						<HugeiconsIcon icon={GridIcon} className="w-5 h-5" />
					</Button>

					<Button
						variant={isChatOpen ? 'default' : 'outline'}
						size="lg"
						onClick={() => setIsChatOpen(!isChatOpen)}
						className="w-12 h-12 rounded-full"
					>
						<HugeiconsIcon icon={Chat01Icon} className="w-5 h-5" />
					</Button>

					<Button
						variant="destructive"
						size="lg"
						onClick={leaveCall}
						className="w-12 h-12 rounded-full"
					>
						<HugeiconsIcon icon={PhoneOffIcon} className="w-5 h-5" />
					</Button>
				</div>
			</div>
		</div>
	);
}
