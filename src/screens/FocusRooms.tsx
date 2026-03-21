'use client';

import {
	ArrowLeft01Icon,
	Medal01Icon,
	Message01Icon,
	PlayIcon,
	StopIcon,
	UserGroupIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { usePresence, usePresenceListener } from 'ably/react';
import { m } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useSession } from '@/lib/auth-client';
import { cn } from '@/lib/utils';
import { useFocusRoomStore } from '@/stores/useFocusRoomStore';

interface FocusSession {
	clientId: string;
	data: {
		user?: string;
		status?: string;
		focusMinutes?: number;
	};
}

interface BuddyLeaderboard {
	userId: string;
	name: string;
	focusMinutes: number;
	avatar: string;
}

const MOCK_LEADERBOARD: BuddyLeaderboard[] = [
	{ userId: '1', name: 'Themba', focusMinutes: 245, avatar: 'T' },
	{ userId: '2', name: 'Lerato', focusMinutes: 198, avatar: 'L' },
	{ userId: '3', name: 'Sibusiso', focusMinutes: 156, avatar: 'S' },
	{ userId: '4', name: 'Priya', focusMinutes: 134, avatar: 'P' },
];

export default function FocusRooms() {
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
	const [leaderboard] = useState<BuddyLeaderboard[]>(MOCK_LEADERBOARD);

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

	// eslint-disable-next-line react-hooks/setState-in-use-effect
	useEffect(() => {
		let interval: NodeJS.Timeout | null = null;
		if (isActive && timeLeft > 0) {
			interval = setInterval(() => {
				tick();
			}, 1000);
		} else if (timeLeft === 0) {
			setIsActive(false);
			setFocusMinutes(focusMinutes + 25);
		}
		return () => {
			if (interval) clearInterval(interval);
		};
	}, [isActive, timeLeft, tick, setFocusMinutes, setIsActive, focusMinutes]);

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
					<span className="font-black uppercase tracking-widest text-[10px]">Leave Room</span>
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
					</div>
				</div>

				<div className="grid lg:grid-cols-3 gap-8">
					<div className="lg:col-span-2 space-y-8">
						<Card className="rounded-[2.5rem] p-8 sm:p-12 text-center bg-card border-border/50 shadow-tiimo overflow-hidden relative">
							<div className="absolute inset-0 bg-primary/5 -z-10" />
							{isGroupMode && (
								<div className="absolute top-4 right-4 px-3 py-1 bg-tiimo-green/10 rounded-full">
									<span className="text-xs font-black uppercase tracking-widest text-tiimo-green">
										Group Mode Active
									</span>
								</div>
							)}
							<div className="space-y-6">
								<h2 className="text-xl font-black uppercase tracking-widest text-primary">
									{isGroupMode ? 'Group Focus Session' : 'Solo Focus Session'}
								</h2>
								<div className="text-8xl font-black tracking-tighter tabular-nums text-foreground">
									{formatTime(timeLeft)}
								</div>
								<div className="flex justify-center gap-4">
									<Button
										size="lg"
										onClick={() => setIsActive(!isActive)}
										className={cn(
											'rounded-full px-8 h-16 text-lg font-black uppercase tracking-widest transition-all shadow-xl',
											isActive ? 'bg-tiimo-yellow text-white' : 'bg-primary text-white'
										)}
									>
										<HugeiconsIcon icon={isActive ? StopIcon : PlayIcon} className="w-6 h-6 mr-2" />
										{isActive ? 'Pause' : 'Start Focus'}
									</Button>
								</div>
								<div className="flex items-center justify-center gap-8 text-sm">
									<div className="text-center">
										<p className="text-2xl font-black text-primary tabular-nums">{focusMinutes}</p>
										<p className="text-xs text-muted-foreground">Minutes Today</p>
									</div>
									{isGroupMode && (
										<>
											<div className="w-px h-8 bg-border" />
											<div className="text-center">
												<p className="text-2xl font-black text-tiimo-green tabular-nums">
													{activeMembers.length}
												</p>
												<p className="text-xs text-muted-foreground">Studying Now</p>
											</div>
										</>
									)}
								</div>
							</div>
						</Card>

						<div className="space-y-6">
							<div className="flex items-center justify-between">
								<h3 className="text-xs font-black uppercase tracking-[0.2em] text-tiimo-gray-muted ml-4 flex items-center gap-2">
									<HugeiconsIcon icon={UserGroupIcon} className="w-4 h-4" />
									{isGroupMode ? 'Study Buddies' : 'Active Scholars'} (
									{Array.isArray(presenceData) ? presenceData.length : 0})
								</h3>
							</div>
							<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
								{Array.isArray(presenceData) &&
									presenceData.map((member: FocusSession) => (
										<m.div
											key={member.clientId}
											initial={{ opacity: 0, scale: 0.9 }}
											animate={{ opacity: 1, scale: 1 }}
											className="bg-card p-4 rounded-3xl border border-border/50 shadow-tiimo flex flex-col items-center text-center gap-3"
										>
											<div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center font-black text-primary text-xl">
												{member.data?.user?.charAt(0) || 'S'}
											</div>
											<div>
												<p className="font-black text-xs uppercase truncate w-full">
													{member.data?.user || 'Scholar'}
												</p>
												<span
													className={cn(
														'text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full',
														member.data?.status === 'Studying'
															? 'bg-tiimo-green/10 text-tiimo-green'
															: 'bg-tiimo-yellow/10 text-tiimo-yellow'
													)}
												>
													{member.data?.status || 'Resting'}
												</span>
											</div>
											{member.data?.focusMinutes && member.data.focusMinutes > 0 && (
												<p className="text-[10px] text-muted-foreground">
													{member.data.focusMinutes} min
												</p>
											)}
										</m.div>
									))}
							</div>
						</div>
					</div>

					<div className="space-y-6">
						{isGroupMode && (
							<Card className="rounded-[2.5rem] overflow-hidden bg-card border-border/50 shadow-tiimo">
								<CardHeader className="pb-3">
									<CardTitle className="flex items-center gap-2 text-sm">
										<HugeiconsIcon icon={Medal01Icon} className="w-4 h-4 text-yellow-500" />
										Weekly Leaderboard
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									{leaderboard.map((buddy, index) => (
										<div
											key={buddy.userId}
											className={cn(
												'flex items-center gap-3 p-2 rounded-xl',
												index === 0 && 'bg-yellow-500/10'
											)}
										>
											<div
												className={cn(
													'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black',
													index === 0
														? 'bg-yellow-500 text-white'
														: index === 1
															? 'bg-gray-400 text-white'
															: index === 2
																? 'bg-amber-600 text-white'
																: 'bg-muted text-muted-foreground'
												)}
											>
												{index + 1}
											</div>
											<div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-black text-primary text-sm">
												{buddy.avatar}
											</div>
											<div className="flex-1 min-w-0">
												<p className="font-bold text-sm truncate">{buddy.name}</p>
												<Progress
													value={(buddy.focusMinutes / leaderboard[0].focusMinutes) * 100}
													className="h-1.5"
												/>
											</div>
											<p className="text-sm font-black text-primary">{buddy.focusMinutes}m</p>
										</div>
									))}
								</CardContent>
							</Card>
						)}

						<Card className="rounded-[2.5rem] h-[400px] flex flex-col bg-card border-border/50 shadow-tiimo overflow-hidden">
							<div className="p-6 border-b border-border/50 bg-muted/30 flex items-center gap-3">
								<HugeiconsIcon icon={Message01Icon} className="w-5 h-5 text-primary" />
								<h3 className="font-black uppercase tracking-widest text-[10px]">Study Chat</h3>
							</div>
							<CardContent className="flex-1 p-6 overflow-y-auto no-scrollbar">
								<div className="space-y-4">
									<div className="bg-secondary/50 p-4 rounded-2xl rounded-tl-none mr-8">
										<p className="text-[10px] font-black text-primary uppercase mb-1">System</p>
										<p className="text-xs font-medium text-tiimo-gray-muted">
											{isGroupMode
												? 'Group Sprint Mode! Study together with your buddies.'
												: 'Welcome to the shared study room! Messages are real-time.'}
										</p>
									</div>
								</div>
							</CardContent>
							<div className="p-4 bg-muted/30 border-t border-border/50">
								<div className="flex gap-2">
									<input
										type="text"
										placeholder="Say something motivating..."
										className="flex-1 bg-card border-none rounded-xl h-12 px-4 text-sm font-medium focus:ring-2 focus:ring-primary/50"
									/>
									<Button className="rounded-xl h-12 w-12 p-0">
										<HugeiconsIcon icon={PlayIcon} className="w-5 h-5" />
									</Button>
								</div>
							</div>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}
