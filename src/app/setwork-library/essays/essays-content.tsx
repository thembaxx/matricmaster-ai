'use client';

import { useState } from 'react';
import { EssayEditor } from '@/components/SetworkLibrary/EssayEditor';
import { Card } from '@/components/ui/card';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Setwork } from '@/data/setworks/types';

interface EssaysContentProps {
	setworks: Setwork[];
}

interface EssayType {
	id: string;
	label: string;
	prompts: Record<string, string[]>;
}

const ESSAY_TYPES: EssayType[] = [
	{
		id: 'literary-analysis',
		label: 'Literary Analysis',
		prompts: {
			default: [
				'Analyse how the author uses symbolism to develop the central theme.',
				"Discuss the role of the protagonist's tragic flaw in the narrative.",
				"Examine the use of imagery in conveying the author's message.",
			],
		},
	},
	{
		id: 'comparative',
		label: 'Comparative Essay',
		prompts: {
			default: [
				'Compare how two texts explore the theme of identity.',
				'Contrast the portrayal of conflict in the two setworks.',
				'How do the authors use setting differently to develop their themes?',
			],
		},
	},
	{
		id: 'contextual',
		label: 'Contextual Question',
		prompts: {
			default: [
				"Explain how the historical context influences the characters' actions.",
				'Discuss how the social setting shapes the central conflict.',
				'How does the author reflect the cultural values of the time period?',
			],
		},
	},
];

export function EssaysContent({ setworks }: EssaysContentProps) {
	const [essayType, setEssayType] = useState(ESSAY_TYPES[0].id);
	const [selectedSetwork, setSelectedSetwork] = useState(setworks[0]?.id || '');

	const currentType = ESSAY_TYPES.find((t) => t.id === essayType) || ESSAY_TYPES[0];
	const currentSetwork = setworks.find((s) => s.id === selectedSetwork);

	const prompts = currentType.prompts[selectedSetwork] || currentType.prompts.default || [];

	const topicLabel = currentSetwork
		? `${currentType.label}: ${currentSetwork.title}`
		: currentType.label;

	return (
		<div className="space-y-6">
			<Card className="p-4">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="space-y-2">
						<p className="text-sm font-medium text-muted-foreground">Essay type</p>
						<Select value={essayType} onValueChange={setEssayType}>
							<SelectTrigger aria-label="Essay type">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{ESSAY_TYPES.map((type) => (
									<SelectItem key={type.id} value={type.id}>
										{type.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="space-y-2">
						<p className="text-sm font-medium text-muted-foreground">Setwork</p>
						<Select value={selectedSetwork} onValueChange={setSelectedSetwork}>
							<SelectTrigger aria-label="Setwork">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{setworks.map((s) => (
									<SelectItem key={s.id} value={s.id}>
										{s.title}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>
			</Card>

			<Tabs defaultValue={prompts[0] || ''} className="w-full">
				<TabsList className="flex-wrap h-auto gap-1">
					{prompts.map((prompt, i) => (
						<TabsTrigger key={i} value={prompt} className="text-xs max-w-none">
							Prompt {i + 1}
						</TabsTrigger>
					))}
				</TabsList>
				{prompts.map((prompt, i) => (
					<TabsContent key={i} value={prompt}>
						<EssayEditor topic={topicLabel} prompt={prompt} />
					</TabsContent>
				))}
			</Tabs>
		</div>
	);
}
