import type { Metadata } from 'next';
import { ChannelProviderWrapper } from '@/lib/ably/provider';
import ChannelsScreen from '@/screens/Channels';
import PageTransition from '@/components/Transition/PageTransition';

export const metadata: Metadata = {
	title: 'Channels | MatricMaster',
	description: 'Join study groups and communities.',
};

export default function ChannelsPage() {
	return (
		<PageTransition>
			<ChannelProviderWrapper channelName="channels:study-channels">
				<ChannelsScreen />
			</ChannelProviderWrapper>
		</PageTransition>
	);
}
