'use client';

import {
	ArrowLeft01Icon,
	Message01Icon,
	PauseIcon,
	PlayIcon,
	UserGroupIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { usePresence } from 'ably/react';
import { m } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSession } from '@/lib/auth-client';
import { cn } from '@/lib/utils';

export default function FocusRooms() {
	const router = useRouter();
	const { data: session } = useSession();
	const [timeLeft, setTimeLeft] = useState(25 * 60);
	const [isActive, setIsActive] = useState(false);

	// Ably Presence for Collaborative Room
	const { presenceData } = usePresence('focus:global-room', {
		user: session?.user?.name || 'Anonymous',
		status: isActive ? 'Studying' : 'Resting',
	}) as any;

	useEffect(() => {
		let interval: any = null;
		if (isActive && timeLeft > 0) {
			interval = setInterval(() => {
				setTimeLeft((time) => time - 1);
			}, 1000);
		} else if (timeLeft === 0) {
			setIsActive(false);
			clearInterval(interval);
		}
		return () => clearInterval(interval);
	}, [isActive, timeLeft]);

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	};

	return (
		<div className="flex flex-col h-full bg-background min-w-0">
			<header className="px-6 pt-12 pb-6 flex items-center justify-between shrink-0 max-w-4xl mx-auto w-full">
				<Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
					<HugeiconsIcon icon={ArrowLeft01Icon} className="w-6 h-6" />
				</Button>
				<div className="flex flex-col items-center">
					<h1 className="text-xl font-black uppercase tracking-tight">Global Focus Room</h1>
					<div className="flex items-center gap-1.5 mt-1">
						<div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
						<span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
							{presenceData.length} Online Now
						</span>
					</div>
				</div>
				<div className="w-10" />
			</header>

			<ScrollArea className="flex-1">
				<main className="px-6 py-4 flex flex-col items-center pb-32 max-w-4xl mx-auto w-full gap-12">
					{/* Collaborative Timer */}
					<div className="relative">
						<m.div
							initial={{ scale: 0.9, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							className="w-64 h-64 rounded-full border-8 border-primary/10 flex flex-col items-center justify-center relative z-10 bg-card shadow-2xl"
						>
							<span className="text-5xl font-black font-mono tracking-tighter text-foreground">
								{formatTime(timeLeft)}
							</span>
							<p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-2">
								{isActive ? 'Session Active' : 'Ready to Focus'}
							</p>
						</m.div>

						{/* Pulse Ring when active */}
						{isActive && (
							<m.div
								animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
								transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
								className="absolute inset-0 rounded-full border-4 border-primary/30 z-0"
							/>
						)}
					</div>

					<div className="flex gap-4">
						<Button
							onClick={() => setIsActive(!isActive)}
							className={cn(
								'h-16 px-10 rounded-3xl font-black uppercase text-xs tracking-widest gap-2 shadow-2xl transition-all',
								isActive
									? 'bg-destructive text-white shadow-destructive/20'
									: 'bg-primary text-white shadow-primary/20'
							)}
						>
							<HugeiconsIcon icon={isActive ? PauseIcon : PlayIcon} className="w-5 h-5" />
							{isActive ? 'Take a Break' : 'Start Focus'}
						</Button>
					</div>

					{/* Collaborative Grid */}
					<div className="w-full space-y-6">
						<div className="flex items-center justify-between px-2">
							<h3 className="text-sm font-black uppercase text-foreground tracking-widest">
								Study Buddies
							</h3>
							<Button
								variant="ghost"
								size="sm"
								className="h-8 rounded-full text-[10px] uppercase font-black gap-1"
							>
								<HugeiconsIcon icon={Message01Icon} className="w-3 h-3" />
								Group Chat
							</Button>
						</div>

						<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
							{presenceData.map((member: any, i: number) => (
								<m.div
									key={member.clientId}
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: i * 0.05 }}
								>
									<Card className="rounded-[2rem] border border-border/50 shadow-tiimo bg-card/50 overflow-hidden group">
										<CardContent className="p-4 flex flex-col items-center text-center gap-3">
											<div className="relative">
												<div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center overflow-hidden">
													<HugeiconsIcon
														icon={UserGroupIcon}
														className="w-8 h-8 text-muted-foreground"
													/>
												</div>
												<div
													className={cn(
														'absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-card',
														member.data?.status === 'Studying' ? 'bg-success' : 'bg-warning'
													)}
												/>
											</div>
											<div>
												<p className="font-bold text-xs truncate max-w-[100px]">
													{member.data?.user || 'Scholar'}
												</p>
												<p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">
													{member.data?.status}
												</p>
											</div>
										</CardContent>
									</Card>
								</m.div>
							))}
						</div>
					</div>
				</main>
			</ScrollArea>
		</div>
	);
}
