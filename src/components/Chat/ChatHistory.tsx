'use client';

import { formatDistanceToNow } from 'date-fns';

interface Session {
	id: string;
	title: string;
	subject: string;
	updatedAt: Date;
}

interface ChatHistoryProps {
	sessions: Session[];
	currentSessionId: string | null;
	onSelectSession: (id: string) => void;
	onNewChat: () => void;
}

export function ChatHistory({
	sessions,
	currentSessionId,
	onSelectSession,
	onNewChat,
}: ChatHistoryProps) {
	return (
		<div className="h-full bg-muted/30 rounded-lg p-3">
			<button
				type="button"
				onClick={onNewChat}
				className="w-full mb-4 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
			>
				+ New Chat
			</button>

			<div className="space-y-1">
				{sessions.map((session) => (
					<button
						type="button"
						key={session.id}
						onClick={() => onSelectSession(session.id)}
						className={`w-full text-left p-2 rounded-lg text-sm transition-colors ${
							currentSessionId === session.id ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
						}`}
					>
						<div className="font-medium truncate">{session.title}</div>
						<div className="text-xs text-muted-foreground flex justify-between">
							<span>{session.subject}</span>
							<span>{formatDistanceToNow(new Date(session.updatedAt), { addSuffix: true })}</span>
						</div>
					</button>
				))}
			</div>
		</div>
	);
}
