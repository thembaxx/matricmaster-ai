'use client';

import { CallEnd01Icon, VideoReplayIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useCallback, useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface VideoCallInviteProps {
	inviteId: string;
	callerName: string;
	callerAvatar?: string;
	callerInitials: string;
	subject: string;
	roomName: string;
	roomUrl: string;
	onAccept: (roomName: string, roomUrl: string) => void;
	onDecline: (inviteId: string) => void;
}

export function VideoCallInvite({
	inviteId,
	callerName,
	callerAvatar,
	callerInitials,
	subject,
	roomName,
	roomUrl,
	onAccept,
	onDecline,
}: VideoCallInviteProps) {
	const [timeLeft, setTimeLeft] = useState(30);
	const isDismissed = timeLeft === 0;

	useEffect(() => {
		if (isDismissed) return;

		const interval = setInterval(() => {
			setTimeLeft((prev) => {
				if (prev <= 1) {
					onDecline(inviteId);
					return 0;
				}
				return prev - 1;
			});
		}, 1000);

		return () => clearInterval(interval);
	}, [isDismissed, inviteId, onDecline]);

	const handleAccept = useCallback(() => {
		setTimeLeft(0);
		onAccept(roomName, roomUrl);
	}, [roomName, roomUrl, onAccept]);

	const handleDecline = useCallback(() => {
		setTimeLeft(0);
		onDecline(inviteId);
	}, [inviteId, onDecline]);

	if (isDismissed) return null;

	return (
		<Card className="w-full sm:max-w-80 overflow-hidden animate-in slide-in-from-right-8 duration-300 border-primary/30 shadow-lg shadow-primary/10">
			<div className="relative">
				{/* Gradient header */}
				<div className="absolute inset-0 h-16 bg-gradient-to-r from-primary/20 to-primary/10" />

				<CardContent className="relative pt-4 pb-4">
					<div className="flex items-center gap-3 mb-4">
						<div className="relative">
							<Avatar className="h-12 w-12 ring-2 ring-primary/30 ring-offset-2 ring-offset-background">
								<AvatarImage src={callerAvatar} />
								<AvatarFallback className="text-sm font-semibold bg-primary/10 text-primary">
									{callerInitials}
								</AvatarFallback>
							</Avatar>
							<div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-green-500 border-2 border-background animate-pulse" />
						</div>

						<div className="flex-1 min-w-0">
							<p className="font-semibold text-sm truncate">{callerName}</p>
							<p className="text-xs text-muted-foreground">Video call &middot; {subject}</p>
						</div>

						<div className="flex items-center gap-1">
							<div className="h-6 w-6 rounded-full bg-green-500/10 flex items-center justify-center">
								<HugeiconsIcon icon={VideoReplayIcon} className="h-3 w-3 text-green-500" />
							</div>
						</div>
					</div>

					{/* Timer bar */}
					<div className="mb-3">
						<div className="h-1 w-full bg-muted rounded-full overflow-hidden">
							<div
								className="h-full bg-primary rounded-full transition-all duration-1000 ease-linear"
								style={{ width: `${(timeLeft / 30) * 100}%` }}
							/>
						</div>
						<p className="text-[10px] text-muted-foreground mt-1 text-right">
							Expires in {timeLeft}s
						</p>
					</div>

					<div className="flex gap-2">
						<Button variant="destructive" size="sm" className="flex-1" onClick={handleDecline}>
							<HugeiconsIcon icon={CallEnd01Icon} className="h-4 w-4 mr-1.5" />
							Decline
						</Button>
						<Button
							size="sm"
							className={cn(
								'flex-1 bg-green-600 hover:bg-green-700 text-white',
								timeLeft <= 10 && 'animate-pulse'
							)}
							onClick={handleAccept}
						>
							<HugeiconsIcon icon={VideoReplayIcon} className="h-4 w-4 mr-1.5" />
							Accept
						</Button>
					</div>
				</CardContent>
			</div>
		</Card>
	);
}
