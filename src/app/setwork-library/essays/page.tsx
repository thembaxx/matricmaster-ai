import type { Metadata } from 'next';

import { appConfig } from '@/app.config';
import { setworks } from '@/content/setworks';
import { EssaysContent } from './essays-content';

export const metadata: Metadata = {
	title: `Essay Writing | ${appConfig.name} AI`,
	description: 'Practice setwork essays with AI feedback.',
};

export default function EssaysPage() {
	return (
		<div className="flex flex-col h-full">
			<header className="px-6 pt-12 pb-40 bg-card border-b border-border">
				<h1 className="text-xl font-black">Essay Writing</h1>
				<p className="text-muted-foreground mt-2">
					Practice literary analysis, comparative, and contextual essays
				</p>
			</header>

			<main className="flex-1 p-6">
				<EssaysContent setworks={setworks} />
			</main>
		</div>
	);
}
