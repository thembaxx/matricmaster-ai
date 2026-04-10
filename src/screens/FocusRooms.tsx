'use client';

import { AddIcon, ArrowLeft01Icon, UserGroupIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { usePresence, usePresenceListener } from 'ably/react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { BuddyFocusStatus } from '@/components/FocusRooms/BuddyFocusStatus';
import { type FocusSession, MOCK_LEADERBOARD } from '@/components/FocusRooms/constants';
import { FocusLeaderboard } from '@/components/FocusRooms/FocusLeaderboard';
import { FocusMembersGrid } from '@/components/FocusRooms/FocusMembersGrid';
import { FocusTimerCard } from '@/components/FocusRooms/FocusTimerCard';
import { InviteBuddyModal } from '@/components/FocusRooms/InviteBuddyModal';
import { StudyChat } from '@/components/FocusRooms/StudyChat';
import { FeatureGate } from '@/components/Subscription/FeatureGate';
import { Button } from '@/components/ui/button';
import { useSession } from '@/lib/auth-client';
import { cn } from '@/lib/utils';
import { useCollaborativeFocusStore } from '@/stores/useCollaborativeFocusStore';
import { useFocusRoomStore } from '@/stores/useFocusRoomStore';

function FocusRoomsWrapper() {
	return (
		<FeatureGate
			feature="focusRooms"
			showPreviewButton={true}
			upgradeMessage="Focus rooms help you study with others in real-time"
		>
			<FocusRoomsContent />
		</FeatureGate>
	);
}

export default function FocusRoomsPage() {
	return <FocusRoomsWrapper />;
}

function FocusRoomsContent() {
	const router = useRouter();
	const { data: session } = useSession();
	const {
		isActive,
		isGroupMode,
		timeLeft,
		focusMinutes,
		setIsActive,
		setIsGroupMode,
		setFocusMinutes,
		tick,
	} = useFocusRoomStore();
	const { activeSession, addParticipant } = useCollaborativeFocusStore();
	const [leaderboard] = useState(MOCK_LEADERBOARD);
	const [showInviteModal, setShowInviteModal] = useState(false);

	const presenceChannel = useMemo(() => {
		if (isGroupMode && activeSession?.id) {
			return `focus:session:${activeSession.id}`;
		}
		return 'focus:global';
	}, [isGroupMode, activeSession?.id]);

	const presenceData = usePresenceListener<{
		user: string;
		status: string;
		focusMinutes: number;
		sessionId?: string;
	}>(presenceChannel);

	const updateStatus = usePresence<{
		user: string;
		status: string;
		focusMinutes: number;
		sessionId?: string;
	}>(presenceChannel, {
		user: session?.user?.name || 'Anonymous',
		status: isActive ? 'Studying' : 'Resting',
		focusMinutes,
		sessionId: activeSession?.id,
	});

	useEffect(() => {
		let interval: NodeJS.Timeout | null = null;
		if (isActive && timeLeft > 0) {
			interval = setInterval(() => {
				tick();
			}, 1000);
		} else if (timeLeft === 0) {
			setIsActive(false);
			setFocusMinutes(focusMinutes + 25);

			if (session?.user?.id) {
				fetch('/api/gamification/focus-session', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						userId: session.user.id,
						minutes: 25,
						isGroupMode,
					}),
				}).catch(() => {});
			}
		}
		return () => {
			if (interval) clearInterval(interval);
		};
	}, [isActive, timeLeft, tick, setFocusMinutes, setIsActive, focusMinutes, isGroupMode, session]);

	useEffect(() => {
		(updateStatus as unknown as (data: unknown) => void)({
			user: session?.user?.name || 'Anonymous',
			status: isActive ? 'Studying' : 'Resting',
			focusMinutes,
			sessionId: activeSession?.id,
		});
	}, [isActive, session, focusMinutes, activeSession?.id]);

	const formatTime = useCallback((seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	}, []);

	const activeMembers = useMemo(() => {
		if (!Array.isArray(presenceData)) return [];
		return presenceData.filter(
			(m: FocusSession) =>
				m.data?.status === 'Studying' && (!isGroupMode || m.data?.sessionId === activeSession?.id)
		);
	}, [presenceData, isGroupMode, activeSession?.id]);

	const handleInviteBuddy = useCallback(
		(buddyId: string, _buddyName: string) => {
			const { setActiveSession } = useCollaborativeFocusStore.getState();
			if (!activeSession) {
				setActiveSession({
					id: `session-${Date.now()}`,
					hostId: session?.user?.id || '',
					participantIds: [buddyId],
					startTime: Date.now(),
					focusMinutes: 0,
					isActive: false,
				});
			} else {
				addParticipant(buddyId);
			}
			setIsGroupMode(true);
		},
		[activeSession, session, addParticipant, setIsGroupMode]
	);

	const handleJoinBuddySession = useCallback(() => {
		setIsGroupMode(true);
		setIsActive(true);
	}, [setIsGroupMode, setIsActive]);

	return (
		<div className="min-h-screen bg-background p-4 sm:p-8 pb-32">
			<div className="max-w-6xl mx-auto space-y-8">
				<Button
					type="button"
					variant="ghost"
					onClick={() => router.back()}
					className="flex items-center gap-2 text-tiimo-gray-muted hover:text-foreground transition-colors group"
				>
					<HugeiconsIcon
						icon={ArrowLeft01Icon}
						className="w-5 h-5 transition-transform group-hover:-translate-x-1"
					/>
					<span className="font-black tracking-widest text-[10px]">Leave Room</span>
				</Button>

				<div className="flex items-center justify-between">
					<h1 className="text-2xl font-black tracking-tight">Focus Rooms</h1>
					<div className="flex gap-2">
						<Button
							variant={isGroupMode ? 'default' : 'outline'}
							size="sm"
							onClick={() => setIsGroupMode(!isGroupMode)}
							className={cn('rounded-full', isGroupMode && 'bg-primary')}
						>
							<HugeiconsIcon icon={UserGroupIcon} className="w-4 h-4 mr-2" />
							Group Sprint
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => setShowInviteModal(true)}
							className="rounded-full"
						>
							<HugeiconsIcon icon={AddIcon} className="w-4 h-4 mr-2" />
							Invite Buddy
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => router.push('/video-call')}
							className="rounded-full"
						>
							Join Video Call
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => router.push('/exam-timer')}
							className="rounded-full border-dashed hover:bg-tiimo-orange/10 hover:text-tiimo-orange"
						>
							Start Exam Timer
						</Button>
					</div>
				</div>

				<div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
					<p className="text-sm text-center">
						<span className="font-semibold">XP Multiplier:</span> {isGroupMode ? '1.5x' : '1x'} for
						focus sessions
					</p>
				</div>

				<div className="grid lg:grid-cols-3 gap-8">
					<div className="lg:col-span-2 space-y-8">
						<FocusTimerCard
							isGroupMode={isGroupMode}
							timeLeft={timeLeft}
							focusMinutes={focusMinutes}
							isActive={isActive}
							activeMembersCount={activeMembers.length}
							onToggleActive={() => setIsActive(!isActive)}
							formatTime={formatTime}
						/>

						<FocusMembersGrid
							isGroupMode={isGroupMode}
							presenceData={presenceData as unknown as FocusSession[]}
						/>
					</div>

					<div className="space-y-6">
						{isGroupMode && <FocusLeaderboard leaderboard={leaderboard} />}

						<BuddyFocusStatus onJoinSession={handleJoinBuddySession} />

						<StudyChat isGroupMode={isGroupMode} />
					</div>
				</div>

				<InviteBuddyModal
					open={showInviteModal}
					onOpenChange={setShowInviteModal}
					onInvite={handleInviteBuddy}
				/>
			</div>
		</div>
	);
}
