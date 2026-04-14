'use client';

import {
	ChampionIcon,
	Chat01Icon,
	Timer01Icon,
	UserAdd01Icon,
	UserGroupIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

const ChannelsView = dynamic(() => import('@/screens/Channels'), {
	loading: () => <div className="h-[60vh] animate-pulse bg-muted/10 rounded-3xl" />,
});

const FocusRoomsView = dynamic(() => import('@/screens/FocusRooms'), {
	loading: () => <div className="h-[60vh] animate-pulse bg-muted/10 rounded-3xl" />,
});

const LeaderboardView = dynamic(() => import('@/screens/Leaderboard'), {
	loading: () => <div className="h-[60vh] animate-pulse bg-muted/10 rounded-3xl" />,
});

type CommunityTab = 'channels' | 'focus' | 'leaderboard';

const TAB_ITEMS = [
	{ id: 'channels' as const, label: 'channels', icon: Chat01Icon },
	{ id: 'focus' as const, label: 'focus rooms', icon: Timer01Icon },
	{ id: 'leaderboard' as const, label: 'leaderboard', icon: ChampionIcon },
];

export default function CommunityHub() {
	const [activeTab, setActiveTab] = useState<CommunityTab>('channels');

	return (
		<div className="flex flex-col h-full min-w-0 bg-background overflow-x-hidden">
			{/* Header */}
			<header className="px-4 sm:px-6 pt-8 sm:pt-12 pb-4 sm:pb-6 shrink-0">
				<div className="space-y-1">
					<h1 className="text-3xl font-black text-foreground tracking-tight font-display">
						community hub
					</h1>
					<p className="text-muted-foreground font-medium text-sm">
						learn better together with your matric peers.
					</p>
				</div>

				{/* Live Activity Row */}
				<div className="flex items-center gap-3 mt-8 overflow-x-auto no-scrollbar pb-2">
					<div className="relative shrink-0">
						<div className="flex items-center gap-2 pl-3 pr-4 py-3 rounded-full bg-foreground text-background">
							<div className="relative">
								<div className="w-6 h-6 rounded-full bg-brand-orange flex items-center justify-center">
									<HugeiconsIcon icon={UserGroupIcon} className="w-3 h-3 text-background" />
								</div>
								<div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-tiimo-green rounded-full animate-pulse" />
							</div>
							<span className="text-xs font-black tracking-tight">1,240</span>
							<span className="text-xs font-medium opacity-60">online</span>
						</div>
					</div>

					<div className="flex items-center gap-2 px-4 py-3 rounded-full bg-muted/50 border border-border/50">
						<HugeiconsIcon icon={Timer01Icon} className="w-4 h-4 text-primary" />
						<span className="text-xs font-bold text-muted-foreground">
							<span className="text-foreground font-black">12</span> focus rooms active
						</span>
					</div>
				</div>

				{/* Tab Switcher */}
				<div className="flex p-1 bg-muted/30 rounded-full w-fit mt-6 border border-border/50">
					{TAB_ITEMS.map((tab) => (
						<Button
							key={tab.id}
							variant="ghost"
							onClick={() => setActiveTab(tab.id)}
							className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
								activeTab === tab.id
									? 'bg-background text-foreground shadow-sm'
									: 'text-muted-foreground hover:text-foreground'
							}`}
						>
							<HugeiconsIcon icon={tab.icon} className="w-3.5 h-3.5" />
							{tab.label}
						</Button>
					))}
				</div>
			</header>

			<ScrollArea className="flex-1">
				<main className="px-4 sm:px-6 py-4">
					<div className="min-h-[60vh] mb-32">
						{activeTab === 'channels' && <ChannelsView />}
						{activeTab === 'focus' && <FocusRoomsView />}
						{activeTab === 'leaderboard' && <LeaderboardView />}
					</div>

					{/* Find Bud CTA */}
					<m.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2 }}
					>
						<Card className="relative p-8 rounded-[2rem] bg-foreground text-background overflow-hidden border-none">
							{/* Decorative elements */}
							<div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px]" />
							<div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-orange/20 rounded-full blur-[80px]" />

							{/* Diagonal accent */}
							<div className="absolute top-0 right-0 w-32 h-32 overflow-hidden">
								<div className="absolute top-0 right-0 w-[200%] h-1 bg-gradient-to-l from-primary/30 to-transparent rotate-45 origin-top-left translate-y-8" />
							</div>

							<div className="relative z-10 flex flex-col sm:flex-row gap-6 sm:gap-0 items-center sm:items-end sm:justify-between">
								<div className="space-y-2 text-center sm:text-left">
									<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-[10px] font-black tracking-widest uppercase mb-2">
										<div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
										new feature
									</div>
									<h3 className="text-2xl font-black tracking-tight">find a study buddy</h3>
									<p className="text-sm text-background/60 font-medium">
										match with students who share your subjects and pace.
									</p>
								</div>
								<Button className="shrink-0 h-12 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl group">
									<HugeiconsIcon icon={UserAdd01Icon} className="w-4 h-4 mr-2" />
									start matching
								</Button>
							</div>
						</Card>
					</m.div>
				</main>
			</ScrollArea>
		</div>
	);
}
