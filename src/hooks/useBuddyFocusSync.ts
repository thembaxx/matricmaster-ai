'use client';

import { usePresence, usePresenceListener } from 'ably/react';
import { useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useSession } from '@/lib/auth-client';
import { type FocusInvite, useCollaborativeFocusStore } from '@/stores/useCollaborativeFocusStore';
import { useStudyBuddyStore } from '@/stores/useStudyBuddyStore';

const FOCUS_SESSION_DURATION = 25 * 60;

interface BuddyFocusData {
	buddyId: string;
	buddyName: string;
	avatar?: string;
	isFocusing: boolean;
	timeLeft?: number;
	startedAt?: number;
}

export function useBuddyFocusSync() {
	const { data: session } = useSession();
	const { myBuddies } = useStudyBuddyStore();
	const {
		updateBuddyFocusStatus,
		removeBuddyFocusStatus,
		addPendingInvite,
		updateInviteStatus,
		updateCollaborativeStats,
		onlineBuddiesFocusing,
	} = useCollaborativeFocusStore();

	const { updateStatus } = usePresence<{
		userId: string;
		userName: string;
		buddyId?: string;
		isFocusing: boolean;
		focusMinutes: number;
		timeLeft?: number;
		avatar?: string;
	}>('buddy-focus', {
		userId: session?.user?.id || '',
		userName: session?.user?.name || 'Anonymous',
		buddyId: undefined,
		isFocusing: false,
		focusMinutes: 0,
		avatar: session?.user?.image ?? undefined,
	});

	const { presenceData } = usePresenceListener<{
		userId: string;
		userName: string;
		buddyId?: string;
		isFocusing: boolean;
		focusMinutes: number;
		timeLeft?: number;
		avatar?: string;
	}>('buddy-focus');

	const focusStartTime = useRef<number | null>(null);

	const myBuddyIds = myBuddies.map((b) => b.id);

	useEffect(() => {
		const focusingBuddies: Record<string, { timeLeft: number; startedAt: number }> = {};

		if (Array.isArray(presenceData)) {
			presenceData.forEach((presence) => {
				if (!presence.clientId) return;
				if (presence.clientId === session?.user?.id) return;
				if (!myBuddyIds.includes(presence.clientId)) return;

				const data = presence.data;
				if (data?.isFocusing && data?.timeLeft) {
					focusingBuddies[presence.clientId] = {
						timeLeft: data.timeLeft,
						startedAt: Date.now() - (FOCUS_SESSION_DURATION - data.timeLeft) * 1000,
					};
				}
			});
		}

		Object.entries(focusingBuddies).forEach(([buddyId, status]) => {
			updateBuddyFocusStatus(buddyId, status.timeLeft, status.startedAt);
		});

		Object.keys(onlineBuddiesFocusing).forEach((buddyId) => {
			if (!focusingBuddies[buddyId]) {
				removeBuddyFocusStatus(buddyId);
			}
		});
	}, [
		presenceData,
		myBuddyIds,
		session?.user?.id,
		updateBuddyFocusStatus,
		removeBuddyFocusStatus,
		onlineBuddiesFocusing,
	]);

	const startFocusSession = useCallback(() => {
		focusStartTime.current = Date.now();
		updateStatus({
			userId: session?.user?.id || '',
			userName: session?.user?.name || 'Anonymous',
			buddyId: undefined,
			isFocusing: true,
			focusMinutes: 0,
			timeLeft: FOCUS_SESSION_DURATION,
			avatar: session?.user?.image ?? undefined,
		});
		toast.info('Focus session started - your buddies can see you are studying!', {
			duration: 3000,
		});
	}, [session, updateStatus]);

	const endFocusSession = useCallback(() => {
		if (focusStartTime.current) {
			const minutesFocused = Math.round((Date.now() - focusStartTime.current) / 60000);
			if (minutesFocused > 0) {
				myBuddyIds.forEach((buddyId) => {
					updateCollaborativeStats(buddyId, minutesFocused);
				});
			}
			focusStartTime.current = null;
		}

		updateStatus({
			userId: session?.user?.id || '',
			userName: session?.user?.name || 'Anonymous',
			buddyId: undefined,
			isFocusing: false,
			focusMinutes: 0,
			avatar: session?.user?.image ?? undefined,
		});
	}, [session, updateStatus, myBuddyIds, updateCollaborativeStats]);

	const sendInvite = useCallback(
		(_buddyId: string, buddyName: string) => {
			const invite: FocusInvite = {
				id: `invite-${Date.now()}`,
				fromUserId: session?.user?.id || '',
				fromUserName: session?.user?.name || 'Anonymous',
				sessionId: `session-${Date.now()}`,
				timestamp: Date.now(),
				status: 'pending',
			};

			addPendingInvite(invite);

			toast.success(`Invitation sent to ${buddyName}`);

			setTimeout(() => {
				updateInviteStatus(invite.id, 'accepted');
				toast.info(`${buddyName} joined your focus session!`);
			}, 2000);
		},
		[session, addPendingInvite, updateInviteStatus]
	);

	const acceptInvite = useCallback(
		(inviteId: string) => {
			updateInviteStatus(inviteId, 'accepted');
			startFocusSession();
		},
		[updateInviteStatus, startFocusSession]
	);

	const declineInvite = useCallback(
		(inviteId: string) => {
			updateInviteStatus(inviteId, 'declined');
		},
		[updateInviteStatus]
	);

	const getFocusingBuddies = useCallback((): BuddyFocusData[] => {
		return myBuddies
			.filter((buddy) => onlineBuddiesFocusing[buddy.id])
			.map((buddy) => ({
				buddyId: buddy.id,
				buddyName: buddy.name,
				avatar: buddy.avatar,
				isFocusing: true,
				timeLeft: onlineBuddiesFocusing[buddy.id]?.timeLeft,
				startedAt: onlineBuddiesFocusing[buddy.id]?.startedAt,
			}));
	}, [myBuddies, onlineBuddiesFocusing]);

	const getBuddyLeaderboard = useCallback(() => {
		return myBuddies
			.map((buddy) => ({
				buddyId: buddy.id,
				name: buddy.name,
				avatar: buddy.avatar,
				focusMinutes: 0,
			}))
			.sort((a, b) => b.focusMinutes - a.focusMinutes);
	}, [myBuddies]);

	const joinBuddySession = useCallback(
		(buddyId: string) => {
			const buddy = myBuddies.find((b) => b.id === buddyId);
			if (buddy) {
				startFocusSession();
				toast.success(`Joined ${buddy.name}'s focus session!`);
			}
		},
		[myBuddies, startFocusSession]
	);

	return {
		startFocusSession,
		endFocusSession,
		sendInvite,
		acceptInvite,
		declineInvite,
		getFocusingBuddies,
		getBuddyLeaderboard,
		joinBuddySession,
		focusingBuddies: getFocusingBuddies(),
	};
}
