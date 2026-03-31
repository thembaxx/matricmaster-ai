'use client';

import { CheckmarkCircle02Icon, UserGroupIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCollaborativeFocusStore } from '@/stores/useCollaborativeFocusStore';
import { useStudyBuddyStore } from '@/stores/useStudyBuddyStore';

interface InviteBuddyModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onInvite: (buddyId: string, buddyName: string) => void;
}

export function InviteBuddyModal({ open, onOpenChange, onInvite }: InviteBuddyModalProps) {
	const { myBuddies, isLoading } = useStudyBuddyStore();
	const { onlineBuddiesFocusing } = useCollaborativeFocusStore();
	const [selectedBuddies, setSelectedBuddies] = useState<string[]>([]);

	const toggleBuddy = (buddyId: string) => {
		setSelectedBuddies((prev) =>
			prev.includes(buddyId) ? prev.filter((id) => id !== buddyId) : [...prev, buddyId]
		);
	};

	const handleInvite = () => {
		selectedBuddies.forEach((buddyId) => {
			const buddy = myBuddies.find((b) => b.id === buddyId);
			if (buddy) {
				onInvite(buddyId, buddy.name);
			}
		});
		setSelectedBuddies([]);
		onOpenChange(false);
	};

	const onlineBuddyIds = Object.keys(onlineBuddiesFocusing);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<HugeiconsIcon icon={UserGroupIcon} className="w-5 h-5 text-primary" />
						Invite Study Buddies
					</DialogTitle>
				</DialogHeader>

				<div className="space-y-4">
					<p className="text-sm text-muted-foreground">
						Select buddies to invite to your focus session. They will be notified instantly.
					</p>

					<ScrollArea className="h-[300px] pr-4">
						{isLoading ? (
							<div className="flex items-center justify-center py-8">
								<p className="text-sm text-muted-foreground">Loading buddies...</p>
							</div>
						) : myBuddies.length === 0 ? (
							<div className="flex flex-col items-center justify-center py-8 text-center">
								<p className="text-sm text-muted-foreground mb-2">No study buddies yet</p>
								<p className="text-xs text-muted-foreground">
									Connect with buddies to start group focus sessions
								</p>
							</div>
						) : (
							<div className="space-y-2">
								{myBuddies.map((buddy) => {
									const isOnline = onlineBuddyIds.includes(buddy.id);
									const isCurrentlyFocusing = onlineBuddiesFocusing[buddy.id];
									const isSelected = selectedBuddies.includes(buddy.id);

									return (
										<button
											key={buddy.id}
											type="button"
											onClick={() => toggleBuddy(buddy.id)}
											className={`flex items-center justify-between w-full p-3 rounded-lg border cursor-pointer transition-all ${
												isSelected
													? 'border-primary bg-primary/5'
													: 'border-border hover:bg-muted/50'
											}`}
										>
											<div className="flex items-center gap-3">
												<div className="relative">
													<Avatar className="h-10 w-10">
														<AvatarImage src={buddy.avatar} alt={buddy.name} />
														<AvatarFallback>{buddy.name.charAt(0).toUpperCase()}</AvatarFallback>
													</Avatar>
													<span
														className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background ${
															isOnline ? 'bg-green-500' : 'bg-gray-400'
														}`}
													/>
												</div>
												<div>
													<p className="font-medium text-sm">{buddy.name}</p>
													<p className="text-xs text-muted-foreground">
														{isCurrentlyFocusing
															? 'Currently focusing'
															: isOnline
																? 'Online'
																: 'Offline'}
													</p>
												</div>
											</div>
											<div
												className={`w-5 h-5 rounded-full flex items-center justify-center ${
													isSelected
														? 'bg-primary text-primary-foreground'
														: 'border border-gray-300'
												}`}
											>
												{isSelected && (
													<HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-4 h-4" />
												)}
											</div>
										</button>
									);
								})}
							</div>
						)}
					</ScrollArea>

					{selectedBuddies.length > 0 && (
						<div className="flex items-center justify-between pt-2 border-t">
							<p className="text-sm text-muted-foreground">
								{selectedBuddies.length} buddy{selectedBuddies.length > 1 ? 'ies' : ''} selected
							</p>
							<Button onClick={handleInvite} size="sm">
								Send Invite{selectedBuddies.length > 1 ? 's' : ''}
							</Button>
						</div>
					)}

					{selectedBuddies.length === 0 && (
						<Button variant="outline" onClick={() => onOpenChange(false)} className="w-full">
							Cancel
						</Button>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
