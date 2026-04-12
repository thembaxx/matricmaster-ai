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
import { Suspense } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useDailyCall } from './useDailyCall';

function TutoringSessionPageContent() {
	const searchParams = useSearchParams();
	const router = useRouter();

	const roomName = searchParams.get('room');
	const token = searchParams.get('token');
	const isHost = searchParams.get('host') === 'true';

	const {
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
	} = useDailyCall(roomName, token);

	return (
		<div className="min-h-screen bg-background flex flex-col">
			<header className="border-b px-4 py-3 flex items-center justify-between">
				<div className="flex items-center gap-3">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => router.push('/tutoring')}
						aria-label="Back to tutoring"
					>
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
					<Card className="w-full sm:w-80 border-l-0 rounded-none">
						<CardHeader className="border-b py-3">
							<CardTitle className="text-sm">Chat</CardTitle>
						</CardHeader>
						<CardContent className="p-0 flex flex-col h-[calc(100%-52px)]">
							<div className="flex-1 p-4 overflow-y-auto">
								<p className="text-sm text-muted-foreground text-center">No messages yet</p>
							</div>
							<div className="p-3 border-t">
								<Input
									placeholder="Type a message..."
									aria-label="Type a message in the tutoring session"
								/>
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
						aria-label={isAudioOn ? 'Mute microphone' : 'Unmute microphone'}
						className="w-12 h-12 rounded-full"
					>
						<HugeiconsIcon icon={isAudioOn ? MicIcon : VolumeMute01Icon} className="w-5 h-5" />
					</Button>

					<Button
						variant={isVideoOn ? 'default' : 'destructive'}
						size="lg"
						onClick={toggleVideo}
						aria-label={isVideoOn ? 'Turn off camera' : 'Turn on camera'}
						className="w-12 h-12 rounded-full"
					>
						<HugeiconsIcon icon={isVideoOn ? PlayIcon : StopIcon} className="w-5 h-5" />
					</Button>

					<Button
						variant={isScreenSharing ? 'default' : 'outline'}
						size="lg"
						onClick={toggleScreenShare}
						aria-label={isScreenSharing ? 'Stop screen share' : 'Share screen'}
						className="w-12 h-12 rounded-full"
					>
						<HugeiconsIcon icon={GridIcon} className="w-5 h-5" />
					</Button>

					<Button
						variant={isChatOpen ? 'default' : 'outline'}
						size="lg"
						onClick={() => setIsChatOpen(!isChatOpen)}
						aria-label={isChatOpen ? 'Close chat' : 'Open chat'}
						className="w-12 h-12 rounded-full"
					>
						<HugeiconsIcon icon={Chat01Icon} className="w-5 h-5" />
					</Button>

					<Button
						variant="destructive"
						size="lg"
						onClick={leaveCall}
						aria-label="End call"
						className="w-12 h-12 rounded-full"
					>
						<HugeiconsIcon icon={PhoneOffIcon} className="w-5 h-5" />
					</Button>
				</div>
			</div>
		</div>
	);
}

function TutoringSessionPageSkeleton() {
	return (
		<div className="min-h-screen bg-background flex flex-col">
			<header className="border-b px-4 py-3 flex items-center justify-between animate-pulse">
				<div className="flex items-center gap-3">
					<div className="w-10 h-10 bg-muted rounded-full" />
					<div className="space-y-2">
						<div className="h-5 w-32 bg-muted rounded" />
						<div className="h-4 w-24 bg-muted rounded" />
					</div>
				</div>
			</header>
			<main className="flex-1 flex items-center justify-center">
				<div className="flex flex-col items-center gap-4">
					<div className="w-8 h-8 bg-muted rounded-full animate-spin" />
					<p className="text-muted-foreground">Joining session...</p>
				</div>
			</main>
		</div>
	);
}

export default function TutoringSessionPage() {
	return (
		<Suspense fallback={<TutoringSessionPageSkeleton />}>
			<TutoringSessionPageContent />
		</Suspense>
	);
}
