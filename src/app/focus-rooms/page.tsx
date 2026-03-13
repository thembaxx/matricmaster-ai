import type { Metadata } from 'next';
import { appConfig } from '@/app.config';
import { ChannelProviderWrapper } from '@/lib/ably/provider';
import FocusRoomsScreen from '@/screens/FocusRooms';

export const metadata: Metadata = {
	title: `Focus Rooms | ${appConfig.name}`,
	description: 'Study in real-time with other Matric students across South Africa.',
};

export default function FocusRoomsPage() {
	return (
		<ChannelProviderWrapper channelName="focus:global-room">
			<FocusRoomsScreen />
		</ChannelProviderWrapper>
	);
}
