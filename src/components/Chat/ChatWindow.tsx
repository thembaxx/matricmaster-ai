'use client';

import { useLayoutEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import type { ChatMessage } from '@/stores/useChatStore';

function MessageBubble({ message }: { message: ChatMessage }) {
	const isUser = message.role === 'user';

	return (
		<div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
			<div
				className={cn(
					'max-w-[80%] rounded-2xl px-4 py-2.5',
					isUser ? 'bg-primary text-primary-foreground rounded-br-md' : 'bg-muted rounded-bl-md'
				)}
			>
				<div className="text-sm whitespace-pre-wrap">{message.content}</div>
				<div className={cn('text-xs mt-1 opacity-60', isUser ? 'text-right' : 'text-left')}>
					{new Date(message.createdAt).toLocaleTimeString([], {
						hour: '2-digit',
						minute: '2-digit',
					})}
				</div>
			</div>
		</div>
	);
}

export function ChatWindow({
	messages,
	isLoading,
}: {
	messages: ChatMessage[];
	isLoading: boolean;
}) {
	const bottomRef = useRef<HTMLDivElement>(null);

	useLayoutEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	if (!messages.length && !isLoading) {
		return (
			<div className="flex-1 flex items-center justify-center text-muted-foreground">
				<div className="text-center">
					<p className="text-lg mb-2">Start a conversation</p>
					<p className="text-sm">Ask me anything about your studies!</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex-1 overflow-y-auto p-4 space-y-4">
			{messages.map((message) => (
				<MessageBubble key={message.id} message={message} />
			))}
			{isLoading && (
				<div className="flex justify-start">
					<div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
						<div className="flex gap-1">
							<span
								className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce"
								style={{ animationDelay: '0ms' }}
							/>
							<span
								className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce"
								style={{ animationDelay: '150ms' }}
							/>
							<span
								className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce"
								style={{ animationDelay: '300ms' }}
							/>
						</div>
					</div>
				</div>
			)}
			<div ref={bottomRef} />
		</div>
	);
}
