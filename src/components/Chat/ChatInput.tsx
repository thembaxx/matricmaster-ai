'use client';

import { SentIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useChatStore } from '@/stores/useChatStore';

interface ChatInputProps {
	sessionId: string | null;
	subject: string;
	onMessageSent: () => void;
	suggestedQuestions?: string[];
}

const DEFAULT_SUGGESTIONS = [
	'Help me understand this concept',
	'Give me a practice question',
	'Explain this in a different way',
	'What are the key points to remember?',
];

export function ChatInput({
	sessionId,
	subject,
	onMessageSent,
	suggestedQuestions = DEFAULT_SUGGESTIONS,
}: ChatInputProps) {
	const [input, setInput] = useState('');
	const { addMessage, setLoading, messages } = useChatStore();

	async function handleSend(overrideMessage?: string) {
		const messageToSend = overrideMessage || input.trim();
		if (!messageToSend || !sessionId) return;

		const userMessage = {
			id: Date.now().toString(),
			role: 'user' as const,
			content: messageToSend,
			createdAt: new Date(),
		};

		addMessage(userMessage);
		if (!overrideMessage) setInput('');
		setLoading(true);

		try {
			const response = await fetch('/api/ai-chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					sessionId,
					message: userMessage.content,
					subject,
				}),
			});

			const data = await response.json();

			if (data.response) {
				addMessage({
					id: (Date.now() + 1).toString(),
					role: 'assistant',
					content: data.response,
					createdAt: new Date(),
				});
				onMessageSent();
			}
		} catch (error) {
			console.error('Failed to send message:', error);
		} finally {
			setLoading(false);
		}
	}

	const showSuggestions = messages.length === 0;

	return (
		<div className="p-4 space-y-3">
			<Separator />
			{showSuggestions && (
				<div className="flex flex-wrap gap-2">
					{suggestedQuestions.map((q) => (
						<Button
							type="button"
							variant="ghost"
							key={q}
							onClick={() => handleSend(q)}
							className="text-xs px-3 py-1.5 h-auto rounded-full bg-muted hover:bg-muted/80"
						>
							{q}
						</Button>
					))}
				</div>
			)}
			<div className="flex gap-2">
				<Textarea
					value={input}
					onChange={(e) => setInput(e.target.value)}
					placeholder="Ask me anything..."
					aria-label="Type your question"
					className="min-h-[44px] max-h-32 resize-none"
					onKeyDown={(e) => {
						if (e.key === 'Enter' && !e.shiftKey) {
							e.preventDefault();
							handleSend();
						}
					}}
				/>
				<Button onClick={() => handleSend()} disabled={!input.trim() || !sessionId} size="icon">
					<HugeiconsIcon icon={SentIcon} className="w-4 h-4" aria-hidden="true" />
				</Button>
			</div>
		</div>
	);
}
