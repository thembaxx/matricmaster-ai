import type { Metadata } from 'next';
import { ViewTransition } from 'react';
import MySessions from '@/screens/MySessions';

export const metadata: Metadata = {
	title: 'My Sessions - Lumni AI',
	description: 'Manage your tutoring sessions',
};

export default function MySessionsPage() {
	return (
		<ViewTransition enter="vt-nav-forward" exit="vt-nav-back" default="none">
			<MySessions />
		</ViewTransition>
	);
}
