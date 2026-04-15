import type { Metadata } from 'next';

import { appConfig } from '@/app.config';
import { ChannelProviderWrapper } from '@/lib/ably/provider';
import { ChannelsClient, ChannelsLoading } from './ChannelsClient';

export const metadata: Metadata = {
	title: `Channels | ${appConfig.name} AI`,
	description: 'Join study groups and communities.',
};

export default function ChannelsPage() {
	return (
		<ChannelProviderWrapper channelName="channels:study-channels" fallback={<ChannelsLoading />}>
			<ChannelsClient />
		</ChannelProviderWrapper>
	);
}
