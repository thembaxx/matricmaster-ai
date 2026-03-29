'use client';

import { ArrowLeft01Icon, UserGroupIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { usePresence, usePresenceListener } from 'ably/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { type FocusSession, MOCK_LEADERBOARD } from '@/components/FocusRooms/constants';
import { FocusLeaderboard } from '@/components/FocusRooms/FocusLeaderboard';
import { FocusMembersGrid } from '@/components/FocusRooms/FocusMembersGrid';
import { FocusTimerCard } from '@/components/FocusRooms/FocusTimerCard';
import { StudyChat } from '@/components/FocusRooms/StudyChat';
import { FeatureGate } from '@/components/Subscription/FeatureGate';
import { Button } from '@/components/ui/button';
import { useSession } from '@/lib/auth-client';
import { cn } from '@/lib/utils';
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
	const [leaderboard] = useState(MOCK_LEADERBOARD);

	const { updateStatus } = usePresence<{ user: string; status: string; focusMinutes: number }>(
		'focus-room',
		{
			user: session?.user?.name || 'Anonymous',
			status: isActive ? 'Studying' : 'Resting',
			focusMinutes,
		}
	);
	const { presenceData } = usePresenceListener<{
		user: string;
		status: string;
		focusMinutes: number;
	}>('focus-room');

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
				}).catch(() => {
					// Silently fail
				});
			}
		}
		return () => {
			if (interval) clearInterval(interval);
		};
	}, [isActive, timeLeft, tick, setFocusMinutes, setIsActive, focusMinutes, isGroupMode, session]);

	useEffect(() => {
		updateStatus({
			user: session?.user?.name || 'Anonymous',
			status: isActive ? 'Studying' : 'Resting',
			focusMinutes,
		});
	}, [isActive, session, updateStatus, focusMinutes]);

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	};

	const activeMembers = Array.isArray(presenceData)
		? presenceData.filter((m: FocusSession) => m.data?.status === 'Studying')
		: [];

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
					<span className="font-black  tracking-widest text-[10px]">Leave Room</span>
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

						<FocusMembersGrid isGroupMode={isGroupMode} presenceData={presenceData || []} />
					</div>

					<div className="space-y-6">
						{isGroupMode && <FocusLeaderboard leaderboard={leaderboard} />}

						<StudyChat isGroupMode={isGroupMode} />
					</div>
				</div>
			</div>
		</div>
	);
}
