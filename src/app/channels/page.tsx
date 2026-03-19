import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

import { appConfig } from '@/app.config';
import { ChannelProviderWrapper } from '@/lib/ably/provider';

const ChannelsContent = dynamic(
	() => import('@/screens/Channels').then((mod) => ({ default: mod.default })),
	{ ssr: true, loading: () => <div className="min-h-[60vh]" /> }
);

export const metadata: Metadata = {
	title: `Channels | ${appConfig.name} AI`,
	description: 'Join study groups and communities.',
};

export default function ChannelsPage() {
	return (
		<ChannelProviderWrapper channelName="channels:study-channels">
			<ChannelsContent />
		</ChannelProviderWrapper>
	);
}
