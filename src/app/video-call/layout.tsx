import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
	title: 'Video Call | Lumni AI',
	description: 'Study together with your study buddies via video call',
};

export default function VideoCallLayout({ children }: { children: ReactNode }) {
	return <div className="h-screen overflow-hidden">{children}</div>;
}
