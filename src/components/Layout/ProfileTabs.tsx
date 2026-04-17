'use client';

import { m } from 'framer-motion';
import type { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TabItem {
	id: string;
	label: string;
	icon?: ReactNode;
	content: ReactNode;
}

interface ProfileTabsProps {
	tabs: TabItem[];
	defaultValue?: string;
}

export function ProfileTabs({ tabs, defaultValue = 'analytics' }: ProfileTabsProps) {
	return (
		<m.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.4 }}
			className="mt-8 sm:mt-12"
		>
			<Tabs defaultValue={defaultValue} className="w-full">
				<TabsList className="flex w-full justify-start gap-2 bg-transparent h-auto p-0 mb-6 flex-wrap">
					{tabs.map((tab) => (
						<TabsTrigger
							key={tab.id}
							value={tab.id}
							className="data-[state=active]:bg-primary-violet/20 data-[state=active]:text-primary-violet px-4 py-2 rounded-full text-sm font-medium"
						>
							{tab.label}
						</TabsTrigger>
					))}
				</TabsList>

				{tabs.map((tab) => (
					<TabsContent key={tab.id} value={tab.id} className="mt-0">
						<Card className="p-6 sm:p-8 rounded-[2rem] border-2 border-border/50 bg-card/50 backdrop-blur-sm">
							{tab.content}
						</Card>
					</TabsContent>
				))}
			</Tabs>
		</m.div>
	);
}
