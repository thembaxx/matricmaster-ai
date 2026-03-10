'use client';

import {
	ArrowRight01Icon,
	BookOpen01Icon,
	ChartBar,
	Chemistry01Icon,
	ComputerTerminal01Icon,
	Leaf01Icon,
	PlayIcon,
	Search01Icon,
	TranslateIcon,
	UserGroupIcon,
	Wifi01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useCallback, useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAblyChannel } from '@/hooks/use-ably-channel';
import { useSession } from '@/lib/auth-client';

const categories = ['All Paths', 'STEM Skills', 'Translate', 'Commerce', 'Humanities'];

interface Channel {
	id: string;
	title: string;
	info: string;
	tag?: string;
	icon: React.ReactNode;
	bg: string;
	onlineCount: number;
}

const stemChannels: Channel[] = [
	{
		id: 'physical-sciences',
		title: 'Physical Sciences',
		info: '12.1k',
		tag: 'NEW',
		icon: <HugeiconsIcon icon={Chemistry01Icon} className="w-6 h-6 text-blue-500" />,
		bg: 'bg-blue-50 dark:bg-blue-900/20',
		onlineCount: 0,
	},
	{
		id: 'life-sciences',
		title: 'Life Sciences',
		info: '9.8k',
		icon: <HugeiconsIcon icon={Leaf01Icon} className="w-6 h-6 text-emerald-500" />,
		bg: 'bg-emerald-50 dark:bg-emerald-900/20',
		onlineCount: 0,
	},
	{
		id: 'info-tech',
		title: 'Info Tech (IT)',
		info: '4.3k',
		icon: <HugeiconsIcon icon={ComputerTerminal01Icon} className="w-6 h-6 text-violet-500" />,
		bg: 'bg-violet-50 dark:bg-violet-900/20',
		onlineCount: 0,
	},
];

export default function Channels() {
	const { data: session } = useSession();
	const user = session?.user;
	const [activeCategory, setActiveCategory] = useState('All Paths');
	const [channels, setChannels] = useState<Channel[]>(stemChannels);

	const channelName = 'channels:study-channels';

	const { channel, presenceMembers } = useAblyChannel({
		channelName,
		enablePresence: true,
	});

	const isAblyConnected = !!channel;

	useEffect(() => {
		const onlineCounts = new Map<string, number>();
		presenceMembers.forEach((member) => {
			const channelId = (member as { data?: { channelId?: string } }).data?.channelId;
			if (channelId) {
				onlineCounts.set(channelId, (onlineCounts.get(channelId) || 0) + 1);
			}
		});

		setChannels((prev) =>
			prev.map((ch) => ({
				...ch,
				onlineCount: onlineCounts.get(ch.id) || Math.floor(Math.random() * 20) + 5,
			}))
		);
	}, [presenceMembers]);

	const handleChannelClick = useCallback(
		async (channelId: string) => {
			if (!user?.id) {
				console.log('User not logged in');
				return;
			}
			if (channel) {
				await channel.publish('channel_joined', {
					userId: user.id,
					channelId,
					timestamp: Date.now(),
				});
			}
			console.log(`Joined channel: ${channelId}`);
		},
		[channel, user?.id]
	);

	return (
		<div className="flex flex-col h-full bg-background">
			{/* Header */}
			<header className="px-6 pt-12 pb-6 shrink-0 bg-background">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-4xl font-black tracking-tight text-foreground">Channels</h1>
						<div className="flex items-center gap-2">
							<p className="text-label-secondary font-black text-[11px] uppercase tracking-wider">
								South Africa • Grade 12
							</p>
							{isAblyConnected && (
								<span className="flex items-center gap-1 text-[10px] font-black text-success uppercase tracking-widest">
									<HugeiconsIcon icon={Wifi01Icon} className="w-3 h-3" />
									Live
								</span>
							)}
						</div>
					</div>
					<Avatar className="w-10 h-10 border-2 border-background shadow-sm ring-1 ring-border">
						<AvatarImage
							src={user?.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
						/>
						<AvatarFallback className="bg-primary/10 text-primary font-black">
							{user?.name?.charAt(0) || 'U'}
						</AvatarFallback>
					</Avatar>
				</div>

				{/* MagnifyingGlass Bar */}
				<div className="mt-6 relative">
					<HugeiconsIcon
						icon={Search01Icon}
						className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-label-tertiary"
					/>
					<input
						type="text"
						placeholder="Find subjects, papers, or topics..."
						className="w-full pl-12 pr-6 py-4 bg-card rounded-2xl text-sm border border-border shadow-sm focus:ring-2 focus:ring-primary/20 text-foreground placeholder-label-tertiary"
					/>
				</div>

				{/* Categories Scroller */}
				<div className="mt-6 flex gap-3 overflow-x-auto no-scrollbar pb-2">
					{categories.map((cat) => (
						<button
							key={cat}
							type="button"
							onClick={() => setActiveCategory(cat)}
							className={`px-6 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-all ios-active-scale ${
								activeCategory === cat
									? 'bg-foreground text-background shadow-md'
									: 'bg-card text-label-secondary border border-border shadow-sm'
							}`}
						>
							{cat}
						</button>
					))}
				</div>
			</header>

			<ScrollArea className="flex-1">
				<main className="px-6 pb-32 space-y-8">
					{/* Continue Learning */}
					<section className="space-y-4">
						<h3 className="text-[10px] font-black text-label-tertiary uppercase tracking-[0.2em]">
							Continue Learning
						</h3>
						<div className="bg-card p-5 rounded-3xl shadow-sm border border-border relative overflow-hidden group cursor-pointer hover:shadow-md transition-all ios-active-scale">
							<div className="flex items-center gap-5">
								<div className="w-16 h-16 rounded-2xl bg-warning flex items-center justify-center shadow-lg shadow-warning/20 transform group-hover:scale-105 transition-transform">
									<div className="text-warning-foreground text-3xl font-black italic">Σ</div>
								</div>
								<div className="flex-1">
									<h4 className="text-lg font-black text-foreground">Mathematics P1</h4>
									<p className="text-xs text-label-secondary font-black uppercase tracking-wider leading-tight">
										Functions & Graphs • 65% Complete
									</p>
								</div>
								<div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
									<HugeiconsIcon
										icon={PlayIcon}
										className="w-4 h-4 text-label-tertiary fill-label-tertiary"
									/>
								</div>
							</div>
							{/* Progress Bar Line */}
							<div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
								<div className="h-full bg-primary w-[65%]" />
							</div>
						</div>
					</section>

					{/* STEM Skills */}
					<section className="space-y-4">
						<h3 className="text-xl font-black text-foreground uppercase tracking-tight">
							STEM Skills
						</h3>
						<div className="space-y-3">
							{channels.map((item) => (
								<button
									key={item.id}
									onClick={() => handleChannelClick(item.id)}
									onKeyDown={(e) => {
										if (e.key === 'Enter' || e.key === ' ') {
											handleChannelClick(item.id);
										}
									}}
									type="button"
									tabIndex={0}
									aria-label={`Open ${item.title} channel`}
									className="bg-card p-4 rounded-3xl flex items-center justify-between shadow-sm border border-border hover:shadow-md transition-all cursor-pointer group ios-active-scale w-full"
								>
									<div className="flex items-center gap-4">
										<div
											className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.bg}`}
										>
											{item.icon}
										</div>
										<div className="text-left">
											<h4 className="font-black text-foreground uppercase tracking-tight">
												{item.title}
											</h4>
											<div className="flex items-center gap-2">
												<div className="flex items-center gap-1 text-[10px] font-black text-label-tertiary uppercase tracking-widest">
													<HugeiconsIcon icon={UserGroupIcon} className="w-3 h-3" />
													{item.info}
												</div>
												{item.tag && (
													<>
														<span className="w-1 h-1 rounded-full bg-border-strong" />
														<span className="text-[10px] font-black text-success uppercase tracking-widest">
															{item.tag}
														</span>
													</>
												)}
											</div>
										</div>
									</div>
									<div className="flex items-center gap-3">
										{item.onlineCount > 0 && (
											<span className="text-[10px] font-black text-success uppercase tracking-widest flex items-center gap-1">
												<span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
												{item.onlineCount} online
											</span>
										)}
										<HugeiconsIcon
											icon={ArrowRight01Icon}
											className="w-5 h-5 text-label-tertiary group-hover:text-foreground transition-colors"
										/>
									</div>
								</button>
							))}
						</div>
					</section>

					{/* Language Arts */}
					<section className="space-y-4">
						<div className="flex items-center justify-between px-1">
							<h3 className="text-xl font-black text-foreground uppercase tracking-tight">
								Language Arts
							</h3>
							<button
								type="button"
								className="text-[11px] font-black text-primary uppercase tracking-[0.2em] hover:underline ios-active-scale"
							>
								View All
							</button>
						</div>{' '}
						<div className="grid grid-cols-2 gap-4">
							{[
								{
									title: 'English House Language',
									students: '18k Students',
									icon: <HugeiconsIcon icon={BookOpen01Icon} className="w-6 h-6 text-english" />,
									bg: 'bg-english/10',
								},
								{
									title: 'Afrikaans FAL',
									students: '10.5k Students',
									icon: <HugeiconsIcon icon={TranslateIcon} className="w-6 h-6 text-warning" />,
									bg: 'bg-warning/10',
								},
							].map((item) => (
								<div
									key={item.title}
									className="bg-card p-5 rounded-3xl flex flex-col gap-4 shadow-sm border border-border hover:shadow-md transition-all cursor-pointer ios-active-scale"
								>
									<div
										className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.bg}`}
									>
										{item.icon}
									</div>
									<div>
										<h4 className="font-black text-foreground uppercase tracking-tight leading-tight">
											{item.title}
										</h4>
										<div className="mt-3 inline-block px-3 py-1 bg-secondary rounded-lg">
											<span className="text-[10px] font-black text-label-tertiary uppercase tracking-widest">
												{item.students}
											</span>
										</div>
									</div>
								</div>
							))}
						</div>
					</section>

					{/* Commerce */}
					<section className="space-y-4">
						<h3 className="text-xl font-black text-foreground uppercase tracking-tight">
							Commerce
						</h3>
						<div className="bg-card p-4 rounded-3xl flex items-center justify-between shadow-sm border border-border hover:shadow-md transition-all cursor-pointer group ios-active-scale">
							<div className="flex items-center gap-4">
								<div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-accounting/10">
									<HugeiconsIcon icon={ChartBar} className="w-6 h-6 text-accounting" />
								</div>
								<div className="text-left">
									<h4 className="font-black text-foreground uppercase tracking-tight">
										Accounting
									</h4>
									<div className="flex items-center gap-1 text-[10px] font-black text-label-tertiary uppercase tracking-widest">
										<HugeiconsIcon icon={UserGroupIcon} className="w-3 h-3" />
										8.2k
									</div>
								</div>
							</div>
							<div className="flex items-center -space-x-2">
								{[1, 2, 3].map((i) => (
									<div
										key={i}
										className="w-7 h-7 rounded-full border-2 border-background bg-secondary overflow-hidden relative shadow-sm"
									>
										<Avatar className="w-full h-full">
											<AvatarImage
												src={`https://api.dicebear.com/7.x/avataaars/svg?seed=user${i}`}
											/>
										</Avatar>
									</div>
								))}
								<div className="w-7 h-7 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[8px] font-black text-label-tertiary">
									+4
								</div>
							</div>
						</div>
					</section>
				</main>
			</ScrollArea>

			{/* Floating Play Button */}
			<button
				aria-label="Play"
				type="button"
				className="absolute bottom-24 right-6 w-16 h-16 bg-foreground text-background rounded-full shadow-2xl flex items-center justify-center transform hover:scale-110 active:scale-95 transition-all z-30"
			>
				<HugeiconsIcon icon={PlayIcon} className="w-8 h-8 fill-current translate-x-0.5" />
			</button>
		</div>
	);
}
