'use client';

import {
	BookOpen01Icon as BookOpen,
	ArrowRight01Icon as CaretRight,
	ChartBarLineIcon as ChartBar,
	TestTube01Icon as Flask,
	TranslateIcon as LanguagesIcon,
	Leaf01Icon as Leaf,
	Search01Icon as MagnifyingGlass,
	PlayIcon as Play,
	TerminalWindowIcon as TerminalWindow,
	UserGroupIcon as Users,
	Wifi01Icon as WifiHigh,
	ZapIcon as Zap,
} from 'hugeicons-react';
import { useCallback, useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAblyChannel } from '@/hooks/use-ably-channel';
import { useSession } from '@/lib/auth-client';
import { cn } from '@/lib/utils';

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
		icon: <Flask className="w-6 h-6 text-blue-500" />,
		bg: 'bg-blue-50 dark:bg-blue-900/20',
		onlineCount: 0,
	},
	{
		id: 'life-sciences',
		title: 'Life Sciences',
		info: '9.8k',
		icon: <Leaf className="w-6 h-6 text-emerald-500" />,
		bg: 'bg-emerald-50 dark:bg-emerald-900/20',
		onlineCount: 0,
	},
	{
		id: 'info-tech',
		title: 'Info Tech (IT)',
		info: '4.3k',
		icon: <TerminalWindow className="w-6 h-6 text-violet-500" />,
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
		<div className="flex flex-col h-full bg-white dark:bg-zinc-950 pb-40 overflow-x-hidden lg:px-12">
			{/* Header */}
			<header className="px-6 sm:px-10 pt-20 sm:pt-32 pb-12 shrink-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-3xl sticky top-0 z-30 border-none lg:px-0">
				<div className="flex items-center justify-between gap-8 mb-12">
					<div className="space-y-3">
						<h1 className="text-5xl sm:text-7xl lg:text-9xl font-black text-foreground tracking-tighter leading-none">
							Channels
						</h1>
						<div className="flex items-center gap-4">
							<p className="text-muted-foreground/40 font-black text-sm sm:text-lg uppercase tracking-[0.3em] leading-none">
									Grade 12 community
							</p>
							{isAblyConnected && (
								<div className="flex items-center gap-2 px-3 py-1 bg-tiimo-green/10 rounded-full">
									<WifiHigh size={14} className="text-tiimo-green stroke-[3px]" />
									<span className="text-[10px] font-black text-tiimo-green uppercase tracking-widest">Live</span>
								</div>
							)}
						</div>
					</div>
					<Avatar className="w-20 h-20 border-8 border-white dark:border-zinc-900 shadow-2xl rounded-[1.75rem] group-hover:scale-110 transition-transform">
						<AvatarImage
							src={user?.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
						/>
						<AvatarFallback className="bg-primary/10 text-primary font-black text-xl">
							{user?.name?.charAt(0) || 'U'}
						</AvatarFallback>
					</Avatar>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
					{/* Search Bar */}
					<div className="lg:col-span-8 relative group">
						<MagnifyingGlass size={24} className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground/30 stroke-[3px] group-focus-within:text-primary transition-colors" />
						<input
							type="text"
							placeholder="Find subjects or topics..."
							className="w-full h-20 pl-16 pr-8 bg-muted/10 border-none rounded-[2.5rem] text-xl font-bold placeholder:text-muted-foreground/30 focus:ring-4 focus:ring-primary/5 transition-all outline-none"
						/>
					</div>

					{/* Categories */}
					<div className="lg:col-span-4 flex gap-3 overflow-x-auto no-scrollbar py-2">
						{categories.map((cat) => (
							<button
								key={cat}
								type="button"
								onClick={() => setActiveCategory(cat)}
								className={cn(
									"h-20 px-8 rounded-[1.75rem] text-sm font-black uppercase tracking-widest transition-all ios-active-scale whitespace-nowrap shadow-sm",
									activeCategory === cat
										? 'bg-primary text-white shadow-xl shadow-primary/30 scale-105'
										: 'bg-muted/10 text-muted-foreground/40 hover:bg-muted/20'
								)}
							>
								{cat}
							</button>
						))}
					</div>
				</div>
			</header>

			<ScrollArea className="flex-1 no-scrollbar px-6 sm:px-10 lg:px-0">
				<main className="max-w-7xl mx-auto w-full space-y-16 sm:space-y-24 pb-64">
					{/* Continue Learning */}
					<section className="space-y-8">
						<div className="flex items-center gap-4 px-2">
							<h3 className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.4em]">Resuming</h3>
							<div className="h-px flex-1 bg-muted/10" />
						</div>
						<div className="bg-white dark:bg-zinc-900 p-10 rounded-[3.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.06)] relative overflow-hidden group cursor-pointer hover:shadow-[0_40px_100px_rgba(0,0,0,0.1)] transition-all ios-active-scale border-none">
							<div className="flex items-center gap-8 relative z-10">
								<div className="w-24 h-24 rounded-[2rem] bg-tiimo-orange text-white flex items-center justify-center shadow-xl shadow-tiimo-orange/20 transform group-hover:rotate-6 transition-transform">
									<span className="text-4xl font-black italic">Σ</span>
								</div>
								<div className="flex-1 space-y-2">
									<h4 className="text-3xl font-black text-foreground tracking-tight">Mathematics P1</h4>
									<div className="flex items-center gap-4">
										<p className="text-sm font-bold text-muted-foreground/60 uppercase tracking-widest">
											Functions & Graphs
										</p>
										<div className="h-1.5 w-1.5 rounded-full bg-muted/20" />
										<p className="text-sm font-black text-tiimo-orange uppercase tracking-widest">65% Done</p>
									</div>
								</div>
								<div className="w-16 h-16 rounded-[1.25rem] bg-muted/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-500">
									<Play size={28} className="fill-current stroke-[3px] ml-1" />
								</div>
							</div>
							{/* Bouncy Progress Bar */}
							<div className="absolute bottom-0 left-0 right-0 h-2 bg-muted/10">
								<m.div
									initial={{ width: 0 }}
									animate={{ width: "65%" }}
									transition={{ duration: 2, type: 'spring' }}
									className="h-full bg-primary shadow-[0_0_20px_rgba(var(--primary),0.5)]"
								/>
							</div>
						</div>
					</section>

					{/* STEM Skills */}
					<section className="space-y-8">
						<div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 px-2">
							<div className="space-y-1">
								<h3 className="text-4xl font-black text-foreground tracking-tight leading-none">STEM arena</h3>
								<p className="text-sm font-bold text-muted-foreground/40 uppercase tracking-widest">Science & technology</p>
							</div>
							<div className="flex items-center gap-4 px-4 py-2 bg-tiimo-purple/10 rounded-2xl">
								<Zap size={16} className="text-tiimo-purple stroke-[3px]" />
								<span className="text-[10px] font-black text-tiimo-purple uppercase tracking-widest">Trending hubs</span>
							</div>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
							{channels.map((item) => (
								<button
									key={item.id}
									onClick={() => handleChannelClick(item.id)}
									type="button"
									className="bg-card p-8 rounded-[3rem] flex items-center justify-between shadow-[0_15px_45px_rgba(0,0,0,0.05)] hover:shadow-[0_30px_70px_rgba(0,0,0,0.1)] transition-all cursor-pointer group ios-active-scale w-full border-none"
								>
									<div className="flex items-center gap-6">
										<div
											className={cn("w-16 h-16 rounded-[1.25rem] flex items-center justify-center text-white shadow-lg", item.bg.replace('/20', '').replace('bg-', 'bg-'))}
										>
											{/* Replace icon colors with white for consistency in tiles */}
											{item.icon}
										</div>
										<div className="text-left space-y-1">
											<h4 className="text-xl font-black text-foreground tracking-tight leading-none">
												{item.title}
											</h4>
											<div className="flex items-center gap-3">
												<div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">
													<Users size={14} className="stroke-[3px]" />
													{item.info} Scholars
												</div>
												{item.tag && (
													<div className="px-2 py-0.5 bg-tiimo-pink text-white text-[8px] font-black rounded-full uppercase">
														{item.tag}
													</div>
												)}
											</div>
										</div>
									</div>
									<div className="flex items-center gap-4">
										{item.onlineCount > 0 && (
											<div className="flex items-center gap-2 px-3 py-1.5 bg-tiimo-green/10 rounded-xl">
												<div className="w-1.5 h-1.5 rounded-full bg-tiimo-green animate-pulse" />
												<span className="text-[10px] font-black text-tiimo-green uppercase tracking-widest">{item.onlineCount}</span>
											</div>
										)}
										<div className="w-12 h-12 rounded-xl bg-muted/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
											<CaretRight size={20} className="stroke-[3.5px]" />
										</div>
									</div>
								</button>
							))}
						</div>
					</section>

					{/* Language Arts */}
					<section className="space-y-8">
						<div className="flex items-end justify-between px-2">
							<div className="space-y-1">
								<h3 className="text-4xl font-black text-foreground tracking-tight leading-none">Literacy</h3>
								<p className="text-sm font-bold text-muted-foreground/40 uppercase tracking-widest">Language arts</p>
							</div>
							<button className="h-12 px-6 rounded-2xl bg-muted/10 text-xs font-black text-primary uppercase tracking-widest hover:bg-primary/10 transition-all">
								See All
							</button>
						</div>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
							{[
								{
									title: 'English HL',
									students: '18k Learners',
									color: 'bg-tiimo-blue',
									icon: <BookOpen size={32} className="stroke-[3px]" />,
								},
								{
									title: 'Afrikaans FAL',
									students: '10k Learners',
									color: 'bg-tiimo-orange',
									icon: <LanguagesIcon size={32} className="stroke-[3px]" />,
								},
							].map((item) => (
								<div
									key={item.title}
									className="bg-card p-10 rounded-[3.5rem] flex flex-col gap-8 shadow-[0_20px_50px_rgba(0,0,0,0.06)] hover:shadow-[0_40px_80px_rgba(0,0,0,0.1)] transition-all cursor-pointer ios-active-scale group"
								>
									<div
										className={cn("w-20 h-20 rounded-[1.75rem] flex items-center justify-center text-white shadow-xl transition-transform group-hover:rotate-6", item.color)}
									>
										{item.icon}
									</div>
									<div className="space-y-3">
										<h4 className="text-3xl font-black text-foreground tracking-tight leading-tight">
											{item.title}
										</h4>
										<div className="inline-flex items-center gap-2 px-4 py-2 bg-muted/10 rounded-xl">
											<Users size={14} className="text-muted-foreground/40 stroke-[3px]" />
											<span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">
												{item.students}
											</span>
										</div>
									</div>
								</div>
							))}
						</div>
					</section>
				</main>
			</ScrollArea>

			{/* Floating Bouncy Action */}
			<m.button
				whileHover={{ scale: 1.1, rotate: -5 }}
				whileTap={{ scale: 0.9 }}
				className="fixed bottom-32 right-8 w-20 h-20 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.4)] flex items-center justify-center z-40"
			>
				<Play size={32} className="fill-current ml-1" />
			</m.button>
		</div>
	);
}
