'use client';

import {
	CallEnd01Icon,
	CctvCameraIcon,
	CircleIcon,
	Mic01Icon,
	MicOff01Icon,
	VideoOffIcon,
	VideoReplayIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/contexts/SettingsContext';
import { cn } from '@/lib/utils';

interface Participant {
	id: string;
	name: string;
	avatar?: string;
	isMuted: boolean;
	hasVideo: boolean;
}

interface VideoCallProps {
	roomUrl: string;
	roomName: string;
	subject: string;
	currentUserId: string;
	currentUserName: string;
	participants: Participant[];
	onLeave: () => void;
}

function formatDuration(seconds: number): string {
	const mins = Math.floor(seconds / 60);
	const secs = seconds % 60;
	return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function VideoCall({
	roomUrl,
	roomName,
	subject,
	currentUserId,
	currentUserName,
	participants,
	onLeave,
}: VideoCallProps) {
	const router = useRouter();
	const { dataSaverMode } = useSettings();
	const [isMuted, setIsMuted] = useState(false);
	const [isVideoOn, setIsVideoOn] = useState(!dataSaverMode);
	const [isScreenSharing, setIsScreenSharing] = useState(false);
	const [elapsed, setElapsed] = useState(0);
	const [showSidebar, setShowSidebar] = useState(true);
	const iframeRef = useRef<HTMLIFrameElement>(null);

	useEffect(() => {
		const interval = setInterval(() => {
			setElapsed((prev) => prev + 1);
		}, 1000);
		return () => clearInterval(interval);
	}, []);

	const handleToggleMute = useCallback(() => {
		setIsMuted((prev) => !prev);
	}, []);

	const handleToggleVideo = useCallback(() => {
		setIsVideoOn((prev) => !prev);
	}, []);

	const handleScreenShare = useCallback(() => {
		setIsScreenSharing((prev) => !prev);
	}, []);

	const handleEndCall = useCallback(() => {
		onLeave();
		router.push('/study-buddies');
	}, [onLeave, router]);

	const allParticipants: Participant[] = [
		{
			id: currentUserId,
			name: currentUserName,
			isMuted,
			hasVideo: isVideoOn,
		},
		...participants.filter((p) => p.id !== currentUserId),
	];

	return (
		<div className="flex flex-col h-screen bg-black">
			{/* Header */}
			<div className="flex items-center justify-between px-6 py-3 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/50">
				<div className="flex items-center gap-3">
					<div className="flex items-center gap-2">
						<div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
						<span className="text-sm text-zinc-400">Live</span>
					</div>
					<Badge variant="secondary" className="bg-zinc-800 text-zinc-200 border-zinc-700">
						{subject}
					</Badge>
					<span className="text-sm font-mono text-zinc-400">{roomName}</span>
				</div>

				<div className="flex items-center gap-4">
					<span className="font-mono text-sm text-zinc-400">
						<HugeiconsIcon icon={CctvCameraIcon} className="h-4 w-4 inline mr-1.5" />
						{formatDuration(elapsed)}
					</span>
					<span className="text-sm text-zinc-400">
						{allParticipants.length} participant{allParticipants.length !== 1 ? 's' : ''}
					</span>
				</div>
			</div>

			<div className="flex flex-1 overflow-hidden">
				{/* Main video area */}
				<div className="flex-1 flex flex-col">
					<div className="flex-1 flex items-center justify-center p-6">
						<div className="relative w-full max-w-5xl aspect-video rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800/50">
							{/* Video iframe (Daily.co) */}
							<iframe
								ref={iframeRef}
								src={roomUrl}
								title={`Study session: ${subject}`}
								className="w-full h-full"
								allow="camera;microphone;fullscreen;display-capture;autoplay"
							/>

							{/* Fallback overlay when no real room */}
							<div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/90 pointer-events-none opacity-0 transition-opacity">
								<div className="w-24 h-24 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
									<span className="text-3xl font-semibold text-zinc-300">
										{currentUserName[0]?.toUpperCase()}
									</span>
								</div>
								<p className="text-zinc-400 text-sm">Connecting to video...</p>
							</div>
						</div>
					</div>

					{/* Controls bar */}
					<div className="flex items-center justify-center gap-3 py-4 bg-zinc-950/80 backdrop-blur-xl border-t border-zinc-800/50">
						<Button
							variant="ghost"
							size="icon"
							onClick={handleToggleMute}
							className={cn(
								'h-12 w-12 rounded-full transition-all',
								isMuted
									? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
									: 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
							)}
						>
							<HugeiconsIcon icon={isMuted ? MicOff01Icon : Mic01Icon} className="h-5 w-5" />
						</Button>

						<Button
							variant="ghost"
							size="icon"
							onClick={handleToggleVideo}
							className={cn(
								'h-12 w-12 rounded-full transition-all',
								!isVideoOn
									? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
									: 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
							)}
						>
							<HugeiconsIcon
								icon={isVideoOn ? VideoReplayIcon : VideoOffIcon}
								className="h-5 w-5"
							/>
						</Button>

						<Button
							variant="ghost"
							size="icon"
							onClick={handleScreenShare}
							disabled
							className={cn(
								'h-12 w-12 rounded-full transition-all',
								isScreenSharing
									? 'bg-blue-500/20 text-blue-400'
									: 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
							)}
						>
							<HugeiconsIcon icon={CctvCameraIcon} className="h-5 w-5" />
						</Button>

						<Button
							variant="ghost"
							size="icon"
							onClick={() => setShowSidebar((prev) => !prev)}
							className="h-12 w-12 rounded-full bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
						>
							<HugeiconsIcon icon={CircleIcon} className="h-5 w-5" />
						</Button>

						<Button
							variant="ghost"
							size="icon"
							onClick={handleEndCall}
							className="h-12 w-12 rounded-full bg-red-600 text-white hover:bg-red-700 ml-4"
						>
							<HugeiconsIcon icon={CallEnd01Icon} className="h-5 w-5" />
						</Button>
					</div>
				</div>

				{/* Participants sidebar */}
				{showSidebar && (
					<div className="w-72 bg-zinc-950/80 backdrop-blur-xl border-l border-zinc-800/50 overflow-y-auto">
						<div className="p-4">
							<h3 className="text-sm font-medium text-zinc-400 mb-4">
								Participants ({allParticipants.length})
							</h3>

							<div className="space-y-2">
								{allParticipants.map((participant) => (
									<div
										key={participant.id}
										className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/50 hover:bg-zinc-800/50 transition-colors"
									>
										<Avatar className="h-9 w-9">
											<AvatarImage src={participant.avatar} />
											<AvatarFallback className="text-xs bg-zinc-700 text-zinc-200">
												{participant.name[0]?.toUpperCase()}
											</AvatarFallback>
										</Avatar>
										<div className="flex-1 min-w-0">
											<p className="text-sm font-medium text-zinc-200 truncate">
												{participant.name}
												{participant.id === currentUserId && (
													<span className="text-zinc-500 ml-1">(you)</span>
												)}
											</p>
										</div>
										<div className="flex items-center gap-1.5">
											{participant.isMuted && (
												<div className="h-6 w-6 rounded-full bg-red-500/20 flex items-center justify-center">
													<HugeiconsIcon icon={MicOff01Icon} className="h-3 w-3 text-red-400" />
												</div>
											)}
											{!participant.hasVideo && (
												<div className="h-6 w-6 rounded-full bg-zinc-700 flex items-center justify-center">
													<HugeiconsIcon icon={VideoOffIcon} className="h-3 w-3 text-zinc-400" />
												</div>
											)}
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
