'use client';

import {
	Chemistry01Icon,
	ComputerTerminal01Icon,
	Leaf01Icon,
	PlayIcon,
	Search01Icon,
	Wifi01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { ChannelCategoryButton } from '@/components/Channels/ChannelCategoryButton';
import { CommerceSection } from '@/components/Channels/CommerceSection';
import { ContinueLearningCard } from '@/components/Channels/ContinueLearningCard';
import { LanguageArtsSection } from '@/components/Channels/LanguageArtsSection';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAblyChannel } from '@/hooks/use-ably-channel';
import { useSession } from '@/lib/auth-client';
import type { Channel } from '@/screens/ChannelList';
import { ChannelList } from '@/screens/ChannelList';

const categories = ['All Paths', 'STEM Skills', 'Translate', 'Commerce', 'Humanities'];

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
	const router = useRouter();
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
		(channelId: string) => {
			router.push(`/channels/${channelId}`);
		},
		[router]
	);

	return (
		<div className="flex flex-col h-full bg-background">
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
						<AvatarImage src={user?.image || ''} />
						<AvatarFallback className="bg-primary/10 text-primary font-black">
							{user?.name?.charAt(0) || 'U'}
						</AvatarFallback>
					</Avatar>
				</div>

				<div className="mt-6 relative">
					<HugeiconsIcon
						icon={Search01Icon}
						className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-label-tertiary"
					/>
					<Input
						type="text"
						placeholder="Find subjects, papers, or topics..."
						className="w-full pl-12 pr-6 py-4 bg-card rounded-2xl text-sm border border-border shadow-sm focus:ring-2 focus:ring-primary/20 text-foreground placeholder-label-tertiary"
					/>
				</div>

				<div className="mt-6 flex gap-3 overflow-x-auto no-scrollbar pb-2">
					{categories.map((cat) => (
						<ChannelCategoryButton
							key={cat}
							category={cat}
							isActive={activeCategory === cat}
							onClick={() => setActiveCategory(cat)}
						/>
					))}
				</div>
			</header>

			<ScrollArea className="flex-1">
				<main className="px-6 pb-32 space-y-8">
					<section className="space-y-4">
						<h3 className="text-[10px] font-black text-label-tertiary uppercase tracking-[0.2em]">
							Continue Learning
						</h3>
						<ContinueLearningCard
							title="Mathematics P1"
							subject="Functions & Graphs"
							progress={65}
						/>
					</section>

					<section className="space-y-4">
						<h3 className="text-xl font-black text-foreground uppercase tracking-tight">
							STEM Skills
						</h3>
						<ChannelList channels={channels} onChannelClick={handleChannelClick} />
					</section>

					<LanguageArtsSection />

					<CommerceSection />
				</main>
			</ScrollArea>

			<Button
				aria-label="Play"
				type="button"
				variant="ghost"
				size="icon"
				className="absolute bottom-24 right-6 w-16 h-16 bg-foreground text-background rounded-full shadow-2xl flex items-center justify-center transform hover:scale-110 active:scale-95 transition-all z-30"
			>
				<HugeiconsIcon icon={PlayIcon} className="w-8 h-8 fill-current translate-x-0.5" />
			</Button>
		</div>
	);
}
