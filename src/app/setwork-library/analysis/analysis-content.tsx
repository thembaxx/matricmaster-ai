'use client';

import { BookOpenIcon, QuotesIcon, Search01Icon, UserIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { CharacterMap } from '@/components/SetworkLibrary/CharacterMap';
import { QuoteBank } from '@/components/SetworkLibrary/QuoteBank';
import { ThemeComparator } from '@/components/SetworkLibrary/ThemeComparator';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Setwork } from '@/content/setworks/types';

interface AnalysisContentProps {
	setworks: Setwork[];
}

const LITERARY_DEVICES = [
	{
		name: 'Metaphor',
		description: 'A comparison between two unlike things without using "like" or "as".',
		example: '"Okonkwo\'s fame rested on solid personal achievements."',
	},
	{
		name: 'Foreshadowing',
		description: 'Hints or clues about what will happen later in the story.',
		example: "The killing of Ikemefuna foreshadows Okonkwo's own downfall.",
	},
	{
		name: 'Irony',
		description: 'A contrast between expectation and reality.',
		example: 'Portia argues for mercy while using the law to destroy Shylock.',
	},
	{
		name: 'Symbolism',
		description: 'Using objects or ideas to represent deeper meanings.',
		example: 'The red earth of Ndotsheni symbolizes the connection to the land.',
	},
	{
		name: 'Imagery',
		description: 'Descriptive language that appeals to the senses.',
		example: '"The sun rose softly on the land and the rich red soil."',
	},
	{
		name: 'Personification',
		description: 'Giving human qualities to non-human things.',
		example: '"The fear of failure and of weakness haunted Okonkwo."',
	},
	{
		name: 'Alliteration',
		description: 'Repetition of initial consonant sounds.',
		example: '"The quality of mercy is not strain\'d."',
	},
	{
		name: 'Simile',
		description: 'A comparison using "like" or "as".',
		example: '"He walked jauntily; his head was held high like a fighting cock\'s."',
	},
];

export function AnalysisContent({ setworks }: AnalysisContentProps) {
	return (
		<Tabs defaultValue="characters" className="w-full">
			<TabsList className="flex-wrap h-auto gap-1">
				<TabsTrigger value="characters" className="gap-1.5">
					<HugeiconsIcon icon={UserIcon} className="w-3.5 h-3.5" />
					Characters
				</TabsTrigger>
				<TabsTrigger value="themes" className="gap-1.5">
					<HugeiconsIcon icon={Search01Icon} className="w-3.5 h-3.5" />
					Theme Comparator
				</TabsTrigger>
				<TabsTrigger value="quotes" className="gap-1.5">
					<HugeiconsIcon icon={QuotesIcon} className="w-3.5 h-3.5" />
					Quote Bank
				</TabsTrigger>
				<TabsTrigger value="devices" className="gap-1.5">
					<HugeiconsIcon icon={BookOpenIcon} className="w-3.5 h-3.5" />
					Literary Devices
				</TabsTrigger>
			</TabsList>

			<TabsContent value="characters" className="space-y-8">
				{setworks.map((sw) => (
					<section key={sw.id}>
						<h3 className="font-bold mb-4">{sw.title}</h3>
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
							<Card className="p-4">
								<CharacterMap characters={sw.characters} />
							</Card>
							<div className="space-y-3">
								{sw.characters.map((char) => (
									<Card key={char.id} className="p-3">
										<div className="flex items-center gap-2 mb-1">
											<h4 className="font-bold text-sm">{char.name}</h4>
											<span className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary capitalize">
												{char.role}
											</span>
										</div>
										<p className="text-xs text-muted-foreground">{char.description}</p>
									</Card>
								))}
							</div>
						</div>
					</section>
				))}
			</TabsContent>

			<TabsContent value="themes">
				<ThemeComparator setworks={setworks} />
			</TabsContent>

			<TabsContent value="quotes">
				<QuoteBank setworks={setworks} />
			</TabsContent>

			<TabsContent value="devices">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{LITERARY_DEVICES.map((device) => (
						<Card key={device.name} className="p-4">
							<h4 className="font-bold mb-1">{device.name}</h4>
							<p className="text-sm text-muted-foreground mb-2">{device.description}</p>
							<p className="text-xs italic text-primary/80 bg-primary/5 p-2 rounded">
								{device.example}
							</p>
						</Card>
					))}
				</div>
			</TabsContent>
		</Tabs>
	);
}
