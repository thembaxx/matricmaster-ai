'use client';

import {
	ChampionIcon,
	Chat01Icon,
	Timer01Icon,
	UserAdd01Icon,
	UserGroupIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
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

				{/* Quick Stats Row */}
				<div className="flex gap-4 mt-8 overflow-x-auto no-scrollbar pb-2">
					<Card className="flex items-center gap-3 p-4 rounded-2xl bg-muted/30 border-none min-w-[160px]">
						<div className="w-10 h-10 rounded-xl bg-brand-orange/10 flex items-center justify-center">
							<HugeiconsIcon icon={UserGroupIcon} className="w-5 h-5 text-brand-orange" />
						</div>
						<div>
							<p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
								online buds
							</p>
							<p className="text-lg font-black tracking-tighter">1,240</p>
						</div>
					</Card>
					<Card className="flex items-center gap-3 p-4 rounded-2xl bg-muted/30 border-none min-w-[160px]">
						<div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
							<HugeiconsIcon icon={Timer01Icon} className="w-5 h-5 text-primary" />
						</div>
						<div>
							<p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
								focus rooms
							</p>
							<p className="text-lg font-black tracking-tighter">12 active</p>
						</div>
					</Card>
				</div>

				{/* Tab Switcher */}
				<div className="flex p-1 bg-muted/50 rounded-full w-fit mt-8 border border-border/50">
					{[
						{ id: 'channels', label: 'channels', icon: Chat01Icon },
						{ id: 'focus', label: 'focus rooms', icon: Timer01Icon },
						{ id: 'leaderboard', label: 'leaderboard', icon: ChampionIcon },
					].map((tab) => (
						<Button
							key={tab.id}
							variant="ghost"
							onClick={() => setActiveTab(tab.id as CommunityTab)}
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
					<Card className="p-8 rounded-[2.5rem] bg-foreground text-background overflow-hidden relative border-none">
						<div className="absolute -bottom-12 -right-12 w-48 h-48 bg-brand-orange/20 rounded-full blur-[60px]" />
						<div className="relative z-10 flex flex-col sm:flex-row gap-6 items-center justify-between">
							<div className="space-y-2 text-center sm:text-left">
								<h3 className="text-2xl font-black tracking-tight">find a study buddy</h3>
								<p className="text-muted-foreground font-medium text-sm">
									match with students who share your subjects and pace.
								</p>
							</div>
							<Button className="bg-background text-foreground hover:bg-muted font-black rounded-2xl h-14 px-8 shrink-0 group">
								<HugeiconsIcon icon={UserAdd01Icon} className="w-4 h-4 mr-2" />
								start matching
							</Button>
						</div>
					</Card>
				</main>
			</ScrollArea>
		</div>
	);
}
