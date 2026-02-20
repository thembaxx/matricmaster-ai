'use client';

import { Lightbulb, MessageSquarePlus } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface QuickPromptsProps {
	onSelectPrompt: (prompt: string) => void;
	selectedSubject?: string | null;
}

const PROMPTS_BY_SUBJECT: Record<string, { label: string; prompts: string[] }> = {
	mathematics: {
		label: 'Mathematics',
		prompts: [
			'Explain differentiation step by step',
			'Help me solve this equation',
			'What is the chain rule?',
			'Explain integration basics',
			'How do I factor polynomials?',
		],
	},
	physics: {
		label: 'Physics',
		prompts: [
			"Explain Newton's laws of motion",
			'How do I calculate projectile motion?',
			'What is the difference between speed and velocity?',
			'Explain energy conservation',
			'Help me understand circuits',
		],
	},
	chemistry: {
		label: 'Chemistry',
		prompts: [
			'Explain chemical bonding',
			'What is the periodic table trends?',
			'Help me balance this equation',
			'Explain organic chemistry basics',
			'What are acids and bases?',
		],
	},
	'life sciences': {
		label: 'Life Sciences',
		prompts: [
			'Explain cell structure',
			'What is DNA replication?',
			'Help me understand genetics',
			'Explain photosynthesis',
			'What is natural selection?',
		],
	},
};

const GENERAL_PROMPTS = [
	"Explain this concept like I'm 5",
	'Give me a practice problem',
	'What are common exam questions on this?',
	'Create a study summary',
	'Quiz me on this topic',
];

export function QuickPrompts({ onSelectPrompt, selectedSubject }: QuickPromptsProps) {
	const [showAll, setShowAll] = useState(false);

	const subjectPrompts = selectedSubject ? PROMPTS_BY_SUBJECT[selectedSubject]?.prompts || [] : [];
	const displayPrompts = showAll
		? [...subjectPrompts, ...GENERAL_PROMPTS]
		: [...subjectPrompts.slice(0, 3), ...GENERAL_PROMPTS.slice(0, 2)];

	if (!showAll && subjectPrompts.length === 0 && GENERAL_PROMPTS.length === 0) {
		return null;
	}

	return (
		<Card className="p-3 bg-muted/50 border-border/50">
			<div className="flex items-center gap-2 mb-2">
				<Lightbulb className="h-4 w-4 text-brand-amber" />
				<span className="text-xs font-semibold text-muted-foreground">Quick Prompts</span>
			</div>
			<ScrollArea className="w-full whitespace-nowrap">
				<div className="flex gap-2 pb-2">
					{displayPrompts.map((prompt) => (
						<Button
							key={prompt}
							variant="outline"
							size="sm"
							className="h-auto py-2 px-3 text-xs whitespace-normal text-left shrink-0"
							onClick={() => onSelectPrompt(prompt)}
						>
							<MessageSquarePlus className="h-3 w-3 mr-1.5 shrink-0" />
							{prompt}
						</Button>
					))}
					{!showAll && (subjectPrompts.length > 3 || GENERAL_PROMPTS.length > 2) && (
						<Button
							variant="ghost"
							size="sm"
							className="h-auto py-2 px-3 text-xs shrink-0 text-primary"
							onClick={() => setShowAll(true)}
						>
							Show more...
						</Button>
					)}
				</div>
				<ScrollBar orientation="horizontal" />
			</ScrollArea>
		</Card>
	);
}

export default QuickPrompts;
