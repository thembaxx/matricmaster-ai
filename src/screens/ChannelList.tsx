'use client';

import { ArrowRight01Icon, UserGroupIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Button } from '@/components/ui/button';

export interface Channel {
	id: string;
	title: string;
	info: string;
	tag?: string;
	icon: React.ReactNode;
	bg: string;
	onlineCount: number;
}

interface ChannelListProps {
	channels: Channel[];
	onChannelClick: (channelId: string) => void;
}

export function ChannelList({ channels, onChannelClick }: ChannelListProps) {
	return (
		<div className="space-y-3">
			{channels.map((item) => (
				<Button
					key={item.id}
					onClick={() => onChannelClick(item.id)}
					onKeyDown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							onChannelClick(item.id);
						}
					}}
					type="button"
					variant="ghost"
					tabIndex={0}
					aria-label={`Open ${item.title} channel`}
					className="bg-card p-4 rounded-3xl flex h-20 items-center justify-between shadow-sm border border-border hover:shadow-md transition-all cursor-pointer group ios-active-scale w-full"
				>
					<div className="flex items-center gap-4 py-4">
						<div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.bg}`}>
							{item.icon}
						</div>
						<div className="text-left">
							<h4 className="font-black text-foreground tracking-tight">
								{item.title.toLowerCase()}
							</h4>
							<div className="flex items-center gap-2">
								<div className="flex items-center gap-1 text-[10px] font-black text-label-tertiary tracking-widest">
									<HugeiconsIcon icon={UserGroupIcon} className="w-3 h-3" />
									{item.info}
								</div>
								{item.tag && (
									<>
										<span className="w-1 h-1 rounded-full bg-border-strong" />
										<span className="text-[10px] font-black text-success tracking-widest">
											{item.tag.toLowerCase()}
										</span>
									</>
								)}
							</div>
						</div>
					</div>
					<div className="flex items-center gap-3">
						{item.onlineCount > 0 && (
							<span className="text-[10px] font-black text-success tracking-widest flex items-center gap-1">
								<span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
								{item.onlineCount} online
							</span>
						)}
						<HugeiconsIcon
							icon={ArrowRight01Icon}
							className="w-5 h-5 text-label-tertiary group-hover:text-foreground transition-colors"
						/>
					</div>
				</Button>
			))}
		</div>
	);
}
