import type { Metadata } from 'next';

import { appConfig } from '@/app.config';
import { setworks } from '@/content/setworks';
import { AnalysisContent } from './analysis-content';

export const metadata: Metadata = {
	title: `Literary Analysis | ${appConfig.name} AI`,
	description: 'Explore characters, themes, and quotes across prescribed setworks.',
};

export default function AnalysisPage() {
	return (
		<div className="flex flex-col h-full">
			<header className="px-6 pt-12 pb-40 bg-card border-b border-border">
				<h1 className="text-xl font-black">Literary Analysis Tools</h1>
				<p className="text-muted-foreground mt-2">
					Explore characters, compare themes, and study key quotes
				</p>
			</header>

			<main className="flex-1 p-6">
				<AnalysisContent setworks={setworks} />
			</main>
		</div>
	);
}
