import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { appConfig } from '@/app.config';
import { ChannelProviderWrapper } from '@/lib/ably/provider';

const FocusRoomsContent = dynamic(
	() => import('@/screens/FocusRooms').then((mod) => ({ default: mod.default })),
	{ ssr: true, loading: () => <div className="min-h-[60vh]" /> }
);

export const metadata: Metadata = {
	title: `Focus Rooms | ${appConfig.name}`,
	description: 'Study in real-time with other Matric students across South Africa.',
};

export default function FocusRoomsPage() {
	return (
		<ChannelProviderWrapper channelName="focus:global-room">
			<FocusRoomsContent />
		</ChannelProviderWrapper>
	);
}
