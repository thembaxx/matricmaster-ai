import type { Metadata } from 'next';

import { appConfig } from '@/app.config';
import { SetworkCard } from '@/components/SetworkLibrary/SetworkCard';
import { setworks } from '@/content/setworks';

export const metadata: Metadata = {
	title: `Setwork Library | ${appConfig.name} AI`,
	description: 'Study guides, summaries, and analysis for NSC prescribed literature.',
};

export default function SetworkLibraryPage() {
	return (
		<div className="flex flex-col h-full">
			<header className="px-6 pt-12 pb-40 bg-card border-b border-border">
				<h1 className="text-xl font-black">Setwork Library</h1>
				<p className="text-muted-foreground mt-2">
					Study guides, summaries, and analysis for NSC Grade 12 prescribed literature
				</p>
			</header>

			<main className="flex-1 p-6">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{setworks.map((setwork) => (
						<SetworkCard key={setwork.id} setwork={setwork} />
					))}
				</div>
			</main>
		</div>
	);
}
