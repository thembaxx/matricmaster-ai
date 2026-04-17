'use client';

import {
	AddIcon,
	ChampionIcon,
	Chat01Icon,
	Timer01Icon,
	UserAdd01Icon,
	UserGroupIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { BuddyPanel } from '@/components/StudyBuddy/BuddyPanel';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { SessionUser } from '@/lib/auth';

const ChannelsView = dynamic(() => import('@/screens/Channels'), {
	loading: () => <HubSkeleton />,
});

const FocusRoomsView = dynamic(() => import('@/screens/FocusRooms'), {
	loading: () => <HubSkeleton />,
});

const LeaderboardView = dynamic(() => import('@/screens/Leaderboard'), {
	loading: () => <HubSkeleton />,
});

function HubSkeleton() {
	return <div className="h-[60vh] animate-pulse bg-muted/10 rounded-3xl" />;
}

type SocialHubTab = 'buddies' | 'focus' | 'channels' | 'leaderboard';

const TAB_ITEMS = [
	{ id: 'buddies' as const, label: 'buddies', icon: UserAdd01Icon },
	{ id: 'focus' as const, label: 'focus rooms', icon: Timer01Icon },
	{ id: 'channels' as const, label: 'channels', icon: Chat01Icon },
	{ id: 'leaderboard' as const, label: 'leaderboard', icon: ChampionIcon },
];

interface SocialHubScreenProps {
	user: SessionUser;
}

export function SocialHubScreen({ user }: SocialHubScreenProps) {
	const [activeTab, setActiveTab] = useState<SocialHubTab>('buddies');

	return (
		<div className="flex flex-col min-h-screen bg-background overflow-x-hidden pb-40">
			<header className="px-4 sm:px-6 pt-8 sm:pt-12 pb-4 shrink-0">
				<div className="flex items-center justify-between">
					<div className="space-y-1">
						<h1 className="text-3xl font-black text-foreground tracking-tight font-display">
							social hub
						</h1>
						<p className="text-muted-foreground font-medium text-sm">
							connect, collaborate, and learn together.
						</p>
					</div>
					<Avatar className="w-12 h-12 border-2 border-background shadow-sm ring-1 ring-border">
						<AvatarImage src={user.image || ''} />
						<AvatarFallback className="bg-primary/10 text-primary font-black">
							{user.name?.charAt(0)?.toLowerCase() || 'u'}
						</AvatarFallback>
					</Avatar>
				</div>

				<div className="flex items-center gap-3 mt-6 overflow-x-auto no-scrollbar pb-2">
					<div className="relative shrink-0">
						<div className="flex items-center gap-2 pl-3 pr-4 py-3 rounded-full bg-foreground text-background">
							<div className="relative">
								<div className="w-6 h-6 rounded-full bg-primary-orange flex items-center justify-center">
									<HugeiconsIcon icon={UserGroupIcon} className="w-3 h-3 text-background" />
								</div>
								<div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-tiimo-green rounded-full animate-pulse" />
							</div>
							<span className="text-xs font-black tracking-tight">1,240</span>
							<span className="text-xs font-medium opacity-60">online</span>
						</div>
					</div>

					<Button variant="outline" size="sm" className="shrink-0 rounded-full text-xs font-bold">
						<HugeiconsIcon icon={AddIcon} className="w-4 h-4 mr-1" />
						create room
					</Button>
				</div>

				<Tabs
					value={activeTab}
					onValueChange={(v) => setActiveTab(v as SocialHubTab)}
					className="mt-6"
				>
					<TabsList className="w-full h-11 p-1 bg-muted/30 backdrop-blur-md rounded-xl border border-border/50 overflow-x-auto">
						{TAB_ITEMS.map((tab) => (
							<TabsTrigger
								key={tab.id}
								value={tab.id}
								className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold tracking-wide data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
							>
								<HugeiconsIcon icon={tab.icon} className="w-4 h-4" />
								{tab.label}
							</TabsTrigger>
						))}
					</TabsList>
				</Tabs>
			</header>

			<main className="flex-1 px-4 sm:px-6 pb-8">
				<Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as SocialHubTab)}>
					<TabsContent value="buddies" className="mt-0 space-y-6">
						<BuddySection />
					</TabsContent>

					<TabsContent value="focus" className="mt-0">
						<FocusRoomsView />
					</TabsContent>

					<TabsContent value="channels" className="mt-0">
						<ChannelsView />
					</TabsContent>

					<TabsContent value="leaderboard" className="mt-0">
						<LeaderboardView />
					</TabsContent>
				</Tabs>
			</main>
		</div>
	);
}

function BuddySection() {
	return (
		<div className="space-y-6">
			<Card className="p-6 rounded-[2rem] border-0 shadow-tiimo bg-gradient-to-br from-primary/5 to-primary/10">
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-xl font-black tracking-tight">study buddies</h2>
					<Button size="sm" className="rounded-full text-xs font-bold">
						<HugeiconsIcon icon={AddIcon} className="w-4 h-4 mr-1" />
						find buddy
					</Button>
				</div>
				<p className="text-sm text-muted-foreground">
					Connect with peers who are also preparing for NSC. Match based on subjects, goals, and
					study style.
				</p>
			</Card>

			<BuddyPanel />

			<div className="grid sm:grid-cols-2 gap-4">
				<Card className="p-4 rounded-2xl border border-border/50">
					<h3 className="font-black text-sm tracking-tight mb-3">active buddies</h3>
					<div className="space-y-3">
						<div className="flex items-center gap-3">
							<div className="relative">
								<Avatar className="w-8 h-8">
									<AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces" />
									<AvatarFallback className="bg-muted text-xs">AK</AvatarFallback>
								</Avatar>
								<div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-tiimo-green rounded-full border-2 border-background" />
							</div>
							<div className="flex-1 min-w-0">
								<p className="text-sm font-medium truncate">Amahle K.</p>
								<p className="text-xs text-muted-foreground">online now</p>
							</div>
							<Button size="sm" variant="ghost" className="rounded-full h-8 w-8 p-0">
								<HugeiconsIcon icon={Chat01Icon} className="w-4 h-4" />
							</Button>
						</div>
						<div className="flex items-center gap-3">
							<div className="relative">
								<Avatar className="w-8 h-8">
									<AvatarImage src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces" />
									<AvatarFallback className="bg-muted text-xs">LM</AvatarFallback>
								</Avatar>
								<div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-tiimo-green rounded-full border-2 border-background" />
							</div>
							<div className="flex-1 min-w-0">
								<p className="text-sm font-medium truncate">Liam M.</p>
								<p className="text-xs text-muted-foreground">focusing</p>
							</div>
							<Button size="sm" variant="ghost" className="rounded-full h-8 w-8 p-0">
								<HugeiconsIcon icon={Chat01Icon} className="w-4 h-4" />
							</Button>
						</div>
					</div>
				</Card>

				<Card className="p-4 rounded-2xl border border-border/50">
					<h3 className="font-black text-sm tracking-tight mb-3">pending requests</h3>
					<div className="space-y-3">
						<div className="flex items-center gap-3">
							<Avatar className="w-8 h-8">
								<AvatarImage src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=faces" />
								<AvatarFallback className="bg-muted text-xs">SN</AvatarFallback>
							</Avatar>
							<div className="flex-1 min-w-0">
								<p className="text-sm font-medium truncate">Sarah N.</p>
								<p className="text-xs text-muted-foreground">wants to connect</p>
							</div>
						</div>
						<div className="flex gap-2">
							<Button size="sm" className="flex-1 rounded-full text-xs">
								accept
							</Button>
							<Button size="sm" variant="outline" className="flex-1 rounded-full text-xs">
								decline
							</Button>
						</div>
					</div>
				</Card>
			</div>
		</div>
	);
}
