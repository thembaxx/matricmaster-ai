'use client';

import { Loader2, Send, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { authClient } from '@/lib/auth-client';

interface Message {
	id: string;
	role: 'user' | 'assistant';
	content: string;
	timestamp: Date;
}

export default function AITutorPage() {
	const { data: session } = authClient.useSession();
	const [messages, setMessages] = useState<Message[]>([
		{
			id: '1',
			role: 'assistant',
			content:
				"Hello! I'm your AI Study Tutor. I can help you understand any topic, answer questions, or explain difficult concepts. What would you like to learn about today?",
			timestamp: new Date(),
		},
	]);
	const [input, setInput] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, []);

	const handleSend = async () => {
		if (!input.trim() || isLoading) return;

		const userMessage: Message = {
			id: Date.now().toString(),
			role: 'user',
			content: input,
			timestamp: new Date(),
		};

		setMessages((prev) => [...prev, userMessage]);
		setInput('');
		setIsLoading(true);

		try {
			const response = await fetch('/api/ai-tutor', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					message: input,
					subject: selectedSubject,
					history: messages.map((m) => ({ role: m.role, content: m.content })),
				}),
			});

			const data = await response.json();

			const assistantMessage: Message = {
				id: (Date.now() + 1).toString(),
				role: 'assistant',
				content: data.response || 'I apologize, but I encountered an error. Please try again.',
				timestamp: new Date(),
			};

			setMessages((prev) => [...prev, assistantMessage]);
		} catch (_error) {
			const errorMessage: Message = {
				id: (Date.now() + 1).toString(),
				role: 'assistant',
				content: 'I apologize, but I encountered an error. Please try again.',
				timestamp: new Date(),
			};
			setMessages((prev) => [...prev, errorMessage]);
		} finally {
			setIsLoading(false);
		}
	};

	const subjects = [
		{ id: 'mathematics', name: 'Mathematics', color: 'bg-brand-blue' },
		{ id: 'physics', name: 'Physics', color: 'bg-brand-purple' },
		{ id: 'chemistry', name: 'Chemistry', color: 'bg-brand-amber' },
		{ id: 'life sciences', name: 'Life Sciences', color: 'bg-brand-green' },
	];

	if (!session) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-background p-4">
				<Card className="w-full max-w-md">
					<CardHeader>
						<CardTitle>AI Tutor</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<p className="text-muted-foreground">Please sign in to access the AI Tutor.</p>
						<Button asChild className="w-full">
							<a href="/sign-in">Sign In</a>
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background flex flex-col">
			{/* Header */}
			<header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
				<div className="max-w-4xl mx-auto px-4 py-4">
					<div className="flex items-center gap-3">
						<div className="h-10 w-10 rounded-full bg-linear-to-br from-primary to-primary/60 flex items-center justify-center">
							<Sparkles className="h-5 w-5 text-primary-foreground" />
						</div>
						<div>
							<h1 className="text-xl font-bold">AI Study Tutor</h1>
							<p className="text-sm text-muted-foreground">Your personal learning assistant</p>
						</div>
					</div>
				</div>
			</header>

			{/* Subject Selection */}
			<div className="border-b bg-card/30">
				<div className="max-w-4xl mx-auto px-4 py-3">
					<p className="text-sm font-medium mb-2">Select a subject (optional):</p>
					<div className="flex flex-wrap gap-2">
						{subjects.map((subject) => (
							<Button
								key={subject.id}
								variant={selectedSubject === subject.id ? 'default' : 'outline'}
								size="sm"
								onClick={() =>
									setSelectedSubject(selectedSubject === subject.id ? null : subject.id)
								}
								className="gap-2"
							>
								<span className={`h-2 w-2 rounded-full ${subject.color}`} />
								{subject.name}
							</Button>
						))}
					</div>
				</div>
			</div>

			{/* Chat Area */}
			<ScrollArea className="flex-1">
				<div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
					{messages.map((message) => (
						<div
							key={message.id}
							className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
						>
							<Avatar className="h-8 w-8">
								<AvatarFallback
									className={
										message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'
									}
								>
									{message.role === 'user' ? 'U' : 'AI'}
								</AvatarFallback>
							</Avatar>
							<div
								className={`flex-1 max-w-[80%] rounded-2xl px-4 py-3 ${
									message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
								}`}
							>
								<p className="whitespace-pre-wrap">{message.content}</p>
								<p
									className={`text-xs mt-2 opacity-60 ${message.role === 'user' ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}
								>
									{message.timestamp.toLocaleTimeString()}
								</p>
							</div>
						</div>
					))}
					{isLoading && (
						<div className="flex gap-3">
							<Avatar className="h-8 w-8">
								<AvatarFallback className="bg-secondary">AI</AvatarFallback>
							</Avatar>
							<div className="bg-muted rounded-2xl px-4 py-3 flex items-center gap-2">
								<Loader2 className="h-4 w-4 animate-spin" />
								<span className="text-sm text-muted-foreground">Thinking...</span>
							</div>
						</div>
					)}
					<div ref={messagesEndRef} />
				</div>
			</ScrollArea>

			{/* Input Area */}
			<div className="border-t bg-card/50 backdrop-blur-sm">
				<div className="max-w-4xl mx-auto px-4 py-4">
					<form
						onSubmit={(e) => {
							e.preventDefault();
							handleSend();
						}}
						className="flex gap-2"
					>
						<Input
							value={input}
							onChange={(e) => setInput(e.target.value)}
							placeholder="Ask me anything about your studies..."
							className="flex-1"
							disabled={isLoading}
						/>
						<Button type="submit" disabled={isLoading || !input.trim()}>
							{isLoading ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								<Send className="h-4 w-4" />
							)}
						</Button>
					</form>
					<p className="text-xs text-muted-foreground mt-2 text-center">
						AI responses are generated by Google Gemini and may contain errors. Verify important
						information independently.
					</p>
				</div>
			</div>
		</div>
	);
}
