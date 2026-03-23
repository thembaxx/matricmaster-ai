'use client';

import { Cancel01Icon as CloseIcon, MessageIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useChatStore } from '@/stores/useChatStore';
import { ChatInput } from './ChatInput';
import { ChatWindow } from './ChatWindow';

export function FloatingWidget() {
	const { isWidgetOpen, toggleWidget, messages, isLoading } = useChatStore();
	const [sessionId, setSessionId] = useState<string | null>(null);

	async function startChat() {
		try {
			const res = await fetch('/api/chat/sessions', { method: 'POST' });
			const data = await res.json();
			setSessionId(data.id);
		} catch (error) {
			console.error('Failed to start chat:', error);
		}
	}

	if (!isWidgetOpen) {
		return (
			<Button
				type="button"
				onClick={toggleWidget}
				className="fixed bottom-20 right-4 w-14 h-14 rounded-full shadow-lg flex items-center justify-center z-50"
			>
				<HugeiconsIcon icon={MessageIcon} className="w-6 h-6" />
			</Button>
		);
	}

	return (
		<Card className="fixed bottom-36 right-4 w-[320px] sm:w-80 h-96 flex flex-col shadow-xl z-50 overflow-hidden">
			<div className="flex items-center justify-between p-3 border-b">
				<h3 className="font-medium">Study Buddy</h3>
				<Button type="button" variant="ghost" size="icon" onClick={toggleWidget}>
					<HugeiconsIcon icon={CloseIcon} className="w-4 h-4" />
				</Button>
			</div>

			{!sessionId ? (
				<div className="flex-1 flex items-center justify-center p-4">
					<Button onClick={startChat}>Start Chat</Button>
				</div>
			) : (
				<>
					<ChatWindow messages={messages} isLoading={isLoading} />
					<ChatInput sessionId={sessionId} subject="general" onMessageSent={() => {}} />
				</>
			)}
		</Card>
	);
}
