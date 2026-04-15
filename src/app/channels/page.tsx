import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

import { appConfig } from '@/app.config';
import { ChannelProviderWrapper } from '@/lib/ably/provider';

const ChannelsContent = dynamic(
	() => import('@/screens/Channels').then((mod) => ({ default: mod.default })),
	{ ssr: false, loading: () => <ChannelsLoading /> }
);

function ChannelsLoading() {
	return (
		<div className="flex flex-col h-full bg-background">
			<header className="px-6 pt-12 pb-6 shrink-0 bg-background">
				<div className="flex items-center justify-between">
					<div>
						<div className="h-10 w-40 bg-muted rounded-lg animate-pulse" />
						<div className="mt-2 h-4 w-24 bg-muted rounded animate-pulse" />
					</div>
				</div>
				<div className="mt-6 h-14 bg-muted rounded-2xl animate-pulse" />
				<div className="mt-6 flex gap-3">
					<div className="h-8 w-20 bg-muted rounded-full animate-pulse" />
					<div className="h-8 w-20 bg-muted rounded-full animate-pulse" />
					<div className="h-8 w-20 bg-muted rounded-full animate-pulse" />
				</div>
			</header>
		</div>
	);
}

export const metadata: Metadata = {
	title: `Channels | ${appConfig.name} AI`,
	description: 'Join study groups and communities.',
};

export default function ChannelsPage() {
	return (
		<ChannelProviderWrapper channelName="channels:study-channels" fallback={<ChannelsLoading />}>
			<ChannelsContent />
		</ChannelProviderWrapper>
	);
}
