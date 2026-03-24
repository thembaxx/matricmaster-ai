import { ArrowRight01Icon, UserGroupIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Button } from '@/components/ui/button';
import type { Channel } from './types';

interface ChannelCardProps {
	channel: Channel;
	onClick: (id: string) => void;
}

export function ChannelCard({ channel, onClick }: ChannelCardProps) {
	return (
		<Button
			onClick={() => onClick(channel.id)}
			onKeyDown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					onClick(channel.id);
				}
			}}
			type="button"
			variant="ghost"
			tabIndex={0}
			aria-label={`Open ${channel.title} channel`}
			className="bg-card p-4 rounded-3xl flex items-center justify-between shadow-sm border border-border hover:shadow-md transition-all cursor-pointer group ios-active-scale w-full"
		>
			<div className="flex items-center gap-4">
				<div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${channel.bg}`}>
					{channel.icon}
				</div>
				<div className="text-left">
					<h4 className="font-black text-foreground  tracking-tight">{channel.title}</h4>
					<div className="flex items-center gap-2">
						<div className="flex items-center gap-1 text-[10px] font-black text-label-tertiary  tracking-widest">
							<HugeiconsIcon icon={UserGroupIcon} className="w-3 h-3" />
							{channel.info}
						</div>
						{channel.tag && (
							<>
								<span className="w-1 h-1 rounded-full bg-border-strong" />
								<span className="text-[10px] font-black text-success  tracking-widest">
									{channel.tag}
								</span>
							</>
						)}
					</div>
				</div>
			</div>
			<div className="flex items-center gap-3">
				{channel.onlineCount > 0 && (
					<span className="text-[10px] font-black text-success  tracking-widest flex items-center gap-1">
						<span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
						{channel.onlineCount} online
					</span>
				)}
				<HugeiconsIcon
					icon={ArrowRight01Icon}
					className="w-5 h-5 text-label-tertiary group-hover:text-foreground transition-colors"
				/>
			</div>
		</Button>
	);
}

interface ChannelListProps {
	channels: Channel[];
	onChannelClick: (id: string) => void;
}

export function ChannelList({ channels, onChannelClick }: ChannelListProps) {
	return (
		<div className="space-y-3">
			{channels.map((item) => (
				<ChannelCard key={item.id} channel={item} onClick={onChannelClick} />
			))}
		</div>
	);
}
