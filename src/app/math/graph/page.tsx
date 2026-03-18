import type { Metadata } from 'next';

import { appConfig } from '@/app.config';
import { FunctionInput } from '@/components/Graphing/FunctionInput';
import { FunctionList } from '@/components/Graphing/FunctionList';
import { GraphEngine } from '@/components/Graphing/GraphEngine';
import { GraphToolbar } from '@/components/Graphing/GraphToolbar';
import { SliderPanel } from '@/components/Graphing/SliderPanel';
import { TemplateGallery } from '@/components/Graphing/TemplateGallery';
import { Card } from '@/components/ui/card';

export const metadata: Metadata = {
	title: `Math Graphing Engine | ${appConfig.name} AI`,
	description: 'Plot functions, explore graphs, and understand mathematical relationships.',
};

export default function GraphPage() {
	return (
		<div className="flex flex-col h-full">
			<header className="px-6 pt-12 pb-40 bg-card border-b border-border">
				<div className="flex items-center justify-between mb-4">
					<h1 className="text-xl font-black">Math Graphing Engine</h1>
					<GraphToolbar />
				</div>
				<FunctionInput />
			</header>

			<div className="flex flex-1 overflow-hidden">
				<aside className="w-64 p-4 border-r border-border overflow-y-auto">
					<h3 className="font-semibold mb-4">Templates</h3>
					<TemplateGallery />

					<h3 className="font-semibold mt-6 mb-4">Functions</h3>
					<FunctionList />

					<h3 className="font-semibold mt-6 mb-4">Parameters</h3>
					<SliderPanel />
				</aside>

				<main className="flex-1 p-4">
					<Card className="h-full p-4">
						<GraphEngine />
					</Card>
				</main>
			</div>
		</div>
	);
}
