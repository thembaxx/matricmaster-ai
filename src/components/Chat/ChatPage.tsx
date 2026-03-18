'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { useChatStore } from '@/stores/useChatStore';
import { ChatHistory } from './ChatHistory';
import { ChatInput } from './ChatInput';
import { ChatWindow } from './ChatWindow';

const SUBJECTS = [
	{ value: 'general', label: 'General' },
	{ value: 'mathematics', label: 'Mathematics' },
	{ value: 'physical-sciences', label: 'Physical Sciences' },
	{ value: 'life-sciences', label: 'Life Sciences' },
	{ value: 'geography', label: 'Geography' },
	{ value: 'history', label: 'History' },
	{ value: 'english', label: 'English' },
	{ value: 'afrikaans', label: 'Afrikaans' },
];

async function fetchSessions() {
	const data = await fetch('/api/chat/messages').then((r) => r.json());
	if (!data.sessions) throw new Error('Failed to load sessions');
	return data.sessions;
}

export function ChatPage() {
	const { currentSessionId, setCurrentSession, messages, setMessages, isLoading, setLoading } =
		useChatStore();
	const [subject, setSubject] = useState('general');
	const [showHistory, setShowHistory] = useState(false);

	const { data: sessions = [] } = useQuery({
		queryKey: ['chat-sessions'],
		queryFn: fetchSessions,
		staleTime: 30 * 1000,
	});

	async function startNewChat() {
		setLoading(true);
		try {
			const session = await fetch('/api/chat/sessions', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ subject }),
			}).then((r) => r.json());
			setCurrentSession(session.id);
			setMessages([]);
		} catch (error) {
			console.error('Failed to create session:', error);
		} finally {
			setLoading(false);
		}
	}

	async function loadSession(sessionId: string) {
		setLoading(true);
		try {
			const data = await fetch(`/api/chat/messages?sessionId=${sessionId}`).then((r) => r.json());
			setCurrentSession(sessionId);
			setMessages(data);
		} catch (error) {
			console.error('Failed to load messages:', error);
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="flex h-[calc(100vh-6rem)] gap-4">
			<div className={`${showHistory ? 'w-64' : 'w-0'} transition-all overflow-hidden`}>
				<ChatHistory
					sessions={sessions}
					currentSessionId={currentSessionId}
					onSelectSession={loadSession}
					onNewChat={startNewChat}
				/>
			</div>

			<Card className="flex-1 flex flex-col overflow-hidden">
				<div className="flex items-center justify-between p-4 border-b">
					<div className="flex items-center gap-3">
						<button
							type="button"
							onClick={() => setShowHistory(!showHistory)}
							className="p-2 hover:bg-muted rounded-lg"
						>
							☰
						</button>
						<h1 className="font-display text-xl font-bold">Study Buddy</h1>
					</div>
					<select
						value={subject}
						onChange={(e) => setSubject(e.target.value)}
						className="px-3 py-1.5 rounded-lg border bg-background text-sm"
					>
						{SUBJECTS.map((s) => (
							<option key={s.value} value={s.value}>
								{s.label}
							</option>
						))}
					</select>
				</div>

				<ChatWindow messages={messages} isLoading={isLoading} />

				<ChatInput sessionId={currentSessionId} subject={subject} onMessageSent={() => {}} />
			</Card>
		</div>
	);
}
