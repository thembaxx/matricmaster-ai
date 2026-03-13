'use client';

import {
	ArrowLeft01Icon,
	Message01Icon,
	PlayIcon,
	StopIcon,
	UserGroupIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { usePresence } from 'ably/react';
import { m } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useSession } from '@/lib/auth-client';
import { cn } from '@/lib/utils';

export default function FocusRooms() {
	const router = useRouter();
	const { data: session } = useSession();
	const [isActive, setIsActive] = useState(false);
	const [timeLeft, setTimeLeft] = useState(25 * 60);
	const { presenceData, updateStatus } = usePresence('focus-room', {
		user: session?.user?.name || 'Anonymous',
		status: isActive ? 'Studying' : 'Resting',
	}) as any;

	useEffect(() => {
		let interval: NodeJS.Timeout | null = null;
		if (isActive && timeLeft > 0) {
			interval = setInterval(() => {
				setTimeLeft((prev) => prev - 1);
			}, 1000);
		} else if (timeLeft === 0) {
			setIsActive(false);
		}
		return () => {
			if (interval) clearInterval(interval);
		};
	}, [isActive, timeLeft]);

	useEffect(() => {
		updateStatus({
			user: session?.user?.name || 'Anonymous',
			status: isActive ? 'Studying' : 'Resting',
		});
	}, [isActive, session, updateStatus]);

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	};

	return (
		<div className="min-h-screen bg-background p-4 sm:p-8 pb-32">
			<div className="max-w-6xl mx-auto space-y-8">
				<button
					type="button"
					onClick={() => router.back()}
					className="flex items-center gap-2 text-tiimo-gray-muted hover:text-foreground transition-colors group"
				>
					<HugeiconsIcon
						icon={ArrowLeft01Icon}
						className="w-5 h-5 transition-transform group-hover:-translate-x-1"
					/>
					<span className="font-black uppercase tracking-widest text-[10px]">Leave Room</span>
				</button>

				<div className="grid lg:grid-cols-3 gap-8">
					<div className="lg:col-span-2 space-y-8">
						<Card className="rounded-[2.5rem] p-12 text-center bg-card border-border/50 shadow-tiimo overflow-hidden relative">
							<div className="absolute inset-0 bg-primary/5 -z-10" />
							<div className="space-y-6">
								<h2 className="text-xl font-black uppercase tracking-widest text-primary">
									Global Focus Session
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
							</div>
						</Card>

						<div className="space-y-6">
							<div className="flex items-center justify-between">
								<h3 className="text-xs font-black uppercase tracking-[0.2em] text-tiimo-gray-muted ml-4 flex items-center gap-2">
									<HugeiconsIcon icon={UserGroupIcon} className="w-4 h-4" />
									Active Scholars ({Array.isArray(presenceData) ? presenceData.length : 0})
								</h3>
							</div>
							<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
								{Array.isArray(presenceData) &&
									presenceData.map((member: any) => (
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
										</m.div>
									))}
							</div>
						</div>
					</div>

					<div className="space-y-6">
						<Card className="rounded-[2.5rem] h-[600px] flex flex-col bg-card border-border/50 shadow-tiimo overflow-hidden">
							<div className="p-6 border-b border-border/50 bg-muted/30 flex items-center gap-3">
								<HugeiconsIcon icon={Message01Icon} className="w-5 h-5 text-primary" />
								<h3 className="font-black uppercase tracking-widest text-[10px]">Study Chat</h3>
							</div>
							<CardContent className="flex-1 p-6 overflow-y-auto no-scrollbar">
								<div className="space-y-4">
									<div className="bg-secondary/50 p-4 rounded-2xl rounded-tl-none mr-8">
										<p className="text-[10px] font-black text-primary uppercase mb-1">System</p>
										<p className="text-xs font-medium text-tiimo-gray-muted">
											Welcome to the shared study room! Messages are real-time.
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
