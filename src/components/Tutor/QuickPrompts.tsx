'use client';

import { Chat01Icon as ChatCenteredText, IdeaIcon as Lightbulb } from 'hugeicons-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
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
		<div className="space-y-2 md:space-y-3">
			<div className="flex items-center gap-2 px-1">
				<Lightbulb className="h-3.5 w-3.5 md:h-4 md:w-4 text-brand-amber" />
				<span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
					Quick prompts
				</span>
			</div>
			<ScrollArea className="w-full">
				<div className="flex gap-1.5 md:gap-2 pb-2 md:pb-3">
					{displayPrompts.map((prompt) => (
						<Button
							key={prompt}
							variant="outline"
							size="sm"
							className="h-auto py-2 px-3 md:py-2.5 md:px-4 text-[10px] md:text-xs whitespace-nowrap rounded-xl md:rounded-2xl border-border/50 bg-surface-elevated/30 hover:bg-surface-elevated hover:border-primary/30 transition-all duration-200 ios-active-scale"
							onClick={() => onSelectPrompt(prompt)}
						>
							<ChatCenteredText className="h-3 w-3 md:h-3.5 md:w-3.5 mr-1.5 md:mr-2 text-primary/70 shrink-0" />
							<span className="font-medium">{prompt}</span>
						</Button>
					))}
					{!showAll && (subjectPrompts.length > 3 || GENERAL_PROMPTS.length > 2) && (
						<Button
							variant="ghost"
							size="sm"
							className="h-auto py-2 px-3 md:py-2.5 md:px-4 text-[10px] md:text-xs shrink-0 text-primary font-bold hover:bg-primary/5 rounded-xl md:rounded-2xl"
							onClick={() => setShowAll(true)}
						>
							More...
						</Button>
					)}
				</div>
				<ScrollBar orientation="horizontal" />
			</ScrollArea>
		</div>
	);
}
