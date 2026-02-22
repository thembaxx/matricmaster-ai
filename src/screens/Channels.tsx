'use client';

import {
	BarChart3,
	BookOpen,
	ChevronRight,
	FlaskConical,
	Languages as LanguagesIcon,
	Leaf,
	Play,
	Search,
	Terminal,
	Users,
	Wifi,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAblyChannel } from '@/hooks/use-ably-channel';
import { useSession } from '@/lib/auth-client';

const categories = ['All Paths', 'STEM Skills', 'Languages', 'Commerce', 'Humanities'];

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
		icon: <FlaskConical className="w-6 h-6 text-blue-500" />,
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
		icon: <Terminal className="w-6 h-6 text-violet-500" />,
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
			const channelId = (member.data as { channelId?: string })?.channelId;
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
		<div className="flex flex-col h-full bg-[#f8f9fb] dark:bg-[#0a0f18] font-inter">
			{/* Header */}
			<header className="px-6 pt-12 pb-6 shrink-0 bg-[#f8f9fb] dark:bg-[#0a0f18]">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-[34px] font-black tracking-tight text-zinc-900 dark:text-white">
							Channels
						</h1>
						<div className="flex items-center gap-2">
							<p className="text-zinc-500 dark:text-zinc-400 font-medium">
								South Africa • Grade 12
							</p>
							{isAblyConnected && (
								<span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500">
									<Wifi className="w-3 h-3" />
									Live
								</span>
							)}
						</div>
					</div>
					<Avatar className="w-10 h-10 border-2 border-white dark:border-zinc-800 shadow-sm">
						<AvatarImage
							src={user?.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
						/>
						<AvatarFallback className="bg-blue-100 text-blue-600 font-bold">
							{user?.name?.charAt(0) || 'U'}
						</AvatarFallback>
					</Avatar>
				</div>

				{/* Search Bar */}
				<div className="mt-6 relative">
					<Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
					<input
						type="text"
						placeholder="Find subjects, papers, or topics..."
						className="w-full pl-12 pr-6 py-4 bg-card rounded-2xl text-sm border-none shadow-sm focus:ring-2 focus:ring-blue-500/20 dark:text-white dark:placeholder-zinc-500"
					/>
				</div>

				{/* Categories Scroller */}
				<div className="mt-6 flex gap-3 overflow-x-auto no-scrollbar pb-2">
					{categories.map((cat) => (
						<button
							key={cat}
							type="button"
							onClick={() => setActiveCategory(cat)}
							className={`px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
								activeCategory === cat
									? 'bg-[#1e293b] text-white dark:bg-white dark:text-zinc-950 shadow-md'
									: 'bg-white text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400 border border-border shadow-sm'
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
						<h3 className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
							Continue Learning
						</h3>
						<div className="bg-card p-5 rounded-3xl shadow-sm border border-zinc-50 dark:border-zinc-800/50 relative overflow-hidden group cursor-pointer hover:shadow-md transition-all">
							<div className="flex items-center gap-5">
								<div className="w-16 h-16 rounded-2xl bg-linear-to-br from-[#f9b122] to-[#f59e0b] flex items-center justify-center shadow-lg shadow-orange-500/20 transform group-hover:scale-105 transition-transform">
									<div className="text-white text-3xl font-black italic">Σ</div>
								</div>
								<div className="flex-1">
									<h4 className="text-lg font-bold text-zinc-900 dark:text-white">
										Mathematics P1
									</h4>
									<p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium leading-tight">
										Functions & Graphs • 65% Complete
									</p>
								</div>
								<div className="w-10 h-10 rounded-full bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center">
									<Play className="w-4 h-4 text-zinc-400 fill-zinc-400" />
								</div>
							</div>
							{/* Progress Bar Line */}
							<div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
								<div className="h-full bg-blue-500 w-[65%]" />
							</div>
						</div>
					</section>

					{/* STEM Skills */}
					<section className="space-y-4">
						<h3 className="text-xl font-bold text-zinc-900 dark:text-white">STEM Skills</h3>
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
									className="bg-card p-4 rounded-3xl flex items-center justify-between shadow-sm border border-zinc-50 dark:border-zinc-800/50 hover:shadow-md transition-all cursor-pointer group"
								>
									<div className="flex items-center gap-4">
										<div
											className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.bg}`}
										>
											{item.icon}
										</div>
										<div>
											<h4 className="font-bold text-zinc-900 dark:text-white">{item.title}</h4>
											<div className="flex items-center gap-2">
												<div className="flex items-center gap-1 text-[11px] font-bold text-zinc-400">
													<Users className="w-3 h-3" />
													{item.info}
												</div>
												{item.tag && (
													<>
														<span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
														<span className="text-[10px] font-black text-emerald-500 uppercase">
															{item.tag}
														</span>
													</>
												)}
											</div>
										</div>
									</div>
									<div className="flex items-center gap-3">
										{item.onlineCount > 0 && (
											<span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
												<span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
												{item.onlineCount} online
											</span>
										)}
										<ChevronRight className="w-5 h-5 text-zinc-300 group-hover:text-zinc-600 transition-colors" />
									</div>
								</button>
							))}
						</div>
					</section>

					{/* Language Arts */}
					<section className="space-y-4">
						<div className="flex items-center justify-between px-1">
							<h3 className="text-xl font-bold text-zinc-900 dark:text-white">Language Arts</h3>
							<button
								type="button"
								className="text-[11px] font-black text-blue-500 uppercase tracking-widest hover:underline"
							>
								View All
							</button>
						</div>{' '}
						<div className="grid grid-cols-2 gap-4">
							{[
								{
									title: 'English Home Language',
									students: '18k Students',
									icon: <BookOpen className="w-6 h-6 text-rose-500" />,
									bg: 'bg-rose-50 dark:bg-rose-900/20',
								},
								{
									title: 'Afrikaans FAL',
									students: '10.5k Students',
									icon: <LanguagesIcon className="w-6 h-6 text-orange-500" />,
									bg: 'bg-orange-50 dark:bg-orange-900/20',
								},
							].map((item) => (
								<div
									key={item.title}
									className="bg-card p-5 rounded-3xl flex flex-col gap-4 shadow-sm border border-zinc-50 dark:border-zinc-800/50 hover:shadow-md transition-all cursor-pointer"
								>
									<div
										className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.bg}`}
									>
										{item.icon}
									</div>
									<div>
										<h4 className="font-bold text-zinc-900 dark:text-white leading-tight">
											{item.title}
										</h4>
										<div className="mt-3 inline-block px-3 py-1 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
											<span className="text-[11px] font-bold text-zinc-400">{item.students}</span>
										</div>
									</div>
								</div>
							))}
						</div>
					</section>

					{/* Commerce */}
					<section className="space-y-4">
						<h3 className="text-xl font-bold text-zinc-900 dark:text-white">Commerce</h3>
						<div className="bg-card p-4 rounded-3xl flex items-center justify-between shadow-sm border border-zinc-50 dark:border-zinc-800/50 hover:shadow-md transition-all cursor-pointer group">
							<div className="flex items-center gap-4">
								<div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-teal-50 dark:bg-teal-900/20">
									<BarChart3 className="w-6 h-6 text-teal-500" />
								</div>
								<div>
									<h4 className="font-bold text-zinc-900 dark:text-white">Accounting</h4>
									<div className="flex items-center gap-1 text-[11px] font-bold text-zinc-400">
										<Users className="w-3 h-3" />
										8.2k
									</div>
								</div>
							</div>
							<div className="flex items-center -space-x-2">
								{[1, 2, 3].map((i) => (
									<div
										key={i}
										className="w-7 h-7 rounded-full border-2 border-white dark:border-zinc-900 bg-zinc-200 overflow-hidden relative"
									>
										<Avatar className="w-full h-full">
											<AvatarImage
												src={`https://api.dicebear.com/7.x/avataaars/svg?seed=user${i}`}
											/>
										</Avatar>
									</div>
								))}
								<div className="w-7 h-7 rounded-full border-2 border-white dark:border-zinc-900 bg-muted flex items-center justify-center text-[8px] font-black text-zinc-400">
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
				className="absolute bottom-24 right-6 w-16 h-16 bg-[#1e293b] dark:bg-white text-background dark:text-foreground rounded-full shadow-2xl flex items-center justify-center transform hover:scale-110 active:scale-95 transition-all z-30"
			>
				<Play className="w-8 h-8 fill-current translate-x-0.5" />
			</button>
		</div>
	);
}
