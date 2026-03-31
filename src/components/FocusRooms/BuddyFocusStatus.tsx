'use client';

import { TimerIcon, UserGroupIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useMemo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCollaborativeFocusStore } from '@/stores/useCollaborativeFocusStore';
import { useStudyBuddyStore } from '@/stores/useStudyBuddyStore';

interface BuddyFocusStatusProps {
	onJoinSession?: (buddyId: string) => void;
}

export function BuddyFocusStatus({ onJoinSession }: BuddyFocusStatusProps) {
	const { onlineBuddiesFocusing } = useCollaborativeFocusStore();
	const { myBuddies } = useStudyBuddyStore();

	const focusingBuddies = useMemo(() => {
		return myBuddies
			.filter((buddy) => onlineBuddiesFocusing[buddy.id])
			.map((buddy) => ({
				...buddy,
				timeLeft: onlineBuddiesFocusing[buddy.id]?.timeLeft || 0,
				startedAt: onlineBuddiesFocusing[buddy.id]?.startedAt || 0,
			}));
	}, [myBuddies, onlineBuddiesFocusing]);

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	};

	const getTimeRemaining = (startedAt: number) => {
		const elapsed = Math.floor((Date.now() - startedAt) / 1000);
		const totalDuration = 25 * 60;
		const remaining = Math.max(0, totalDuration - elapsed);
		return remaining;
	};

	if (focusingBuddies.length === 0) {
		return (
			<Card className="bg-muted/30 border-dashed">
				<CardHeader className="pb-3">
					<CardTitle className="text-sm font-medium flex items-center gap-2">
						<HugeiconsIcon icon={UserGroupIcon} className="w-4 h-4 text-muted-foreground" />
						Buddy Focus Status
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col items-center justify-center py-4 text-center">
						<HugeiconsIcon icon={TimerIcon} className="w-8 h-8 text-muted-foreground/50 mb-2" />
						<p className="text-sm text-muted-foreground">No buddies currently focusing</p>
						<p className="text-xs text-muted-foreground mt-1">
							Invite your study buddies to focus together!
						</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader className="pb-3">
				<CardTitle className="text-sm font-medium flex items-center gap-2">
					<HugeiconsIcon icon={UserGroupIcon} className="w-4 h-4 text-primary" />
					Buddies Focusing ({focusingBuddies.length})
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3">
				{focusingBuddies.map((buddy) => {
					const timeRemaining = getTimeRemaining(buddy.startedAt);

					return (
						<div
							key={buddy.id}
							className="flex items-center justify-between p-2 rounded-lg bg-primary/5 border border-primary/10"
						>
							<div className="flex items-center gap-3">
								<Avatar className="h-8 w-8">
									<AvatarImage src={buddy.avatar} alt={buddy.name} />
									<AvatarFallback className="text-xs">
										{buddy.name.charAt(0).toUpperCase()}
									</AvatarFallback>
								</Avatar>
								<div>
									<p className="text-sm font-medium">{buddy.name}</p>
									<p className="text-xs text-muted-foreground flex items-center gap-1">
										<HugeiconsIcon icon={TimerIcon} className="w-3 h-3" />
										{formatTime(timeRemaining)} remaining
									</p>
								</div>
							</div>

							<Button
								variant="outline"
								size="sm"
								onClick={() => onJoinSession?.(buddy.id)}
								className="text-xs h-7 gap-1"
							>
								<HugeiconsIcon icon={UserGroupIcon} className="w-3 h-3" />
								Join
							</Button>
						</div>
					);
				})}

				{focusingBuddies.length > 1 && (
					<div className="pt-2 border-t">
						<p className="text-xs text-muted-foreground text-center">
							{focusingBuddies.length} buddies are focusing together
						</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
