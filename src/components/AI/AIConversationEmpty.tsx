'use client';

import { SparklesIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';

interface SuggestedPrompt {
	text: string;
	subject?: string;
}

interface AIConversationEmptyProps {
	suggestedPrompts?: SuggestedPrompt[];
	onPromptSelect?: (prompt: string) => void;
}

const DEFAULT_PROMPTS: SuggestedPrompt[] = [
	{ text: 'Explain Calculus derivatives', subject: 'Mathematics' },
	{ text: 'Help me with Physics', subject: 'Physics' },
	{ text: 'Explain Photosynthesis', subject: 'Life Sciences' },
	{ text: 'Grammar tips for English', subject: 'English' },
];

export function AIConversationEmpty({
	suggestedPrompts = DEFAULT_PROMPTS,
	onPromptSelect,
}: AIConversationEmptyProps) {
	return (
		<m.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			className="flex flex-col items-center justify-center py-12"
		>
			<div className="w-20 h-20 bg-tiimo-lavender/10 rounded-full flex items-center justify-center mb-6">
				<HugeiconsIcon icon={SparklesIcon} className="w-10 h-10 text-tiimo-lavender" />
			</div>
			<h3 className="text-xl font-bold text-foreground mb-2">What would you like to learn?</h3>
			<p className="text-muted-foreground mb-8 text-center">
				Ask me anything about your Grade 12 subjects
			</p>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
				{suggestedPrompts.map((prompt, index) => (
					<m.button
						key={index}
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: index * 0.1 }}
						onClick={() => onPromptSelect?.(prompt.text)}
						className="p-4 text-left rounded-xl bg-card border border-border hover:border-tiimo-lavender/50 hover:bg-tiimo-lavender/5 transition-all"
					>
						<p className="font-medium text-sm">{prompt.text}</p>
						{prompt.subject && (
							<p className="text-xs text-muted-foreground mt-1">{prompt.subject}</p>
						)}
					</m.button>
				))}
			</div>
		</m.div>
	);
}
