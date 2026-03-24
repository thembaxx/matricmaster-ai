'use client';

import {
	ArrowLeft01Icon,
	CallIcon,
	InformationCircleIcon,
	SentIcon,
	Wifi01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { AnimatePresence, m } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAblyChannel } from '@/hooks/use-ably-channel';
import { useSession } from '@/lib/auth-client';
import { cn } from '@/lib/utils';

interface Message {
	id: string;
	userId: string;
	userName: string;
	userImage?: string;
	text: string;
	timestamp: number;
}

export default function ChannelPage() {
	const params = useParams();
	const router = useRouter();
	const channelId = params.id as string;
	const { data: session } = useSession();
	const user = session?.user;

	const [messages, setMessages] = useState<Message[]>([]);
	const [inputText, setInputText] = useState('');
	const scrollRef = useRef<HTMLDivElement>(null);

	const channelName = `study-channel:${channelId}`;

	const onMessageReceived = useCallback((message: { data: unknown }) => {
		const data = message.data as Message;
		setMessages((prev) => [...prev, data]);
	}, []);

	const { channel, presenceMembers, publish } = useAblyChannel({
		channelName,
		onMessage: onMessageReceived,
		enablePresence: true,
	});

	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollIntoView({ behavior: 'smooth' });
		}
	}, []);

	const handleSendMessage = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!inputText.trim() || !user || !channel) return;

		const newMessage: Message = {
			id: crypto.randomUUID(),
			userId: user.id,
			userName: user.name || 'Anonymous',
			userImage: user.image || undefined,
			text: inputText,
			timestamp: Date.now(),
		};

		await publish('message', newMessage);
		setInputText('');
	};

	const channelTitle = channelId
		.split('-')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');

	return (
		<div className="flex flex-col h-screen bg-background">
			{/* Header */}
			<header className="px-6 h-20 flex items-center justify-between border-b border-border/50 bg-card/50 backdrop-blur-xl sticky top-0 z-50">
				<div className="flex items-center gap-4">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => router.push('/channels')}
						className="rounded-full"
					>
						<HugeiconsIcon icon={ArrowLeft01Icon} className="w-6 h-6" />
					</Button>
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
							<HugeiconsIcon icon={Wifi01Icon} className="w-5 h-5 text-primary" />
						</div>
						<div>
							<h1 className="text-sm font-black  tracking-tight">{channelTitle}</h1>
							<p className="text-[10px] font-bold text-success  tracking-widest flex items-center gap-1">
								<span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
								{presenceMembers.length} active now
							</p>
						</div>
					</div>
				</div>

				<div className="flex items-center gap-2">
					<Button variant="ghost" size="icon" className="rounded-full hidden sm:flex">
						<HugeiconsIcon icon={CallIcon} className="w-5 h-5" />
					</Button>
					<Button variant="ghost" size="icon" className="rounded-full">
						<HugeiconsIcon icon={InformationCircleIcon} className="w-5 h-5" />
					</Button>
				</div>
			</header>

			{/* Messages Area */}
			<div className="flex-1 overflow-hidden relative">
				<ScrollArea className="h-full px-6">
					<div className="py-8 space-y-6">
						<div className="text-center py-12 space-y-4">
							<div className="w-20 h-20 rounded-[2.5rem] bg-muted mx-auto flex items-center justify-center">
								<HugeiconsIcon
									icon={Wifi01Icon}
									className="w-10 h-10 text-muted-foreground opacity-20"
								/>
							</div>
							<h2 className="text-xl font-black  tracking-tighter">Welcome to {channelTitle}</h2>
							<p className="text-xs font-bold text-muted-foreground  tracking-widest max-w-xs mx-auto">
								This is the beginning of the chat. Be respectful and help each other out!
							</p>
						</div>

						<AnimatePresence mode="popLayout">
							{messages.map((msg, index) => {
								const isMe = msg.userId === user?.id;
								const showAvatar = index === 0 || messages[index - 1].userId !== msg.userId;

								return (
									<m.div
										key={msg.id}
										initial={{ opacity: 0, y: 10, scale: 0.95 }}
										animate={{ opacity: 1, y: 0, scale: 1 }}
										className={cn('flex items-end gap-3', isMe ? 'flex-row-reverse' : 'flex-row')}
									>
										{!isMe && (
											<div className="w-8 h-8 shrink-0">
												{showAvatar && (
													<Avatar className="w-8 h-8 border border-border/50 shadow-sm">
														<AvatarImage src={msg.userImage} />
														<AvatarFallback className="text-[10px] font-black  bg-primary/5 text-primary">
															{msg.userName[0]}
														</AvatarFallback>
													</Avatar>
												)}
											</div>
										)}
										<div
											className={cn('max-w-[75%] space-y-1', isMe ? 'items-end' : 'items-start')}
										>
											{showAvatar && !isMe && (
												<span className="text-[9px] font-black  tracking-widest text-muted-foreground ml-1">
													{msg.userName}
												</span>
											)}
											<div
												className={cn(
													'px-5 py-3 rounded-[1.5rem] text-sm font-medium shadow-sm',
													isMe
														? 'bg-primary text-white rounded-br-none'
														: 'bg-card border border-border/50 text-foreground rounded-bl-none'
												)}
											>
												{msg.text}
											</div>
										</div>
									</m.div>
								);
							})}
						</AnimatePresence>
						<div ref={scrollRef} />
					</div>
				</ScrollArea>
			</div>

			{/* Input Area */}
			<div className="p-6 bg-background">
				<form
					onSubmit={handleSendMessage}
					className="max-w-4xl mx-auto flex items-center gap-3 bg-card border border-border/50 p-2 rounded-[2rem] shadow-tiimo"
				>
					<input
						type="text"
						value={inputText}
						onChange={(e) => setInputText(e.target.value)}
						placeholder="Message #physical-sciences..."
						className="flex-1 bg-transparent border-none outline-none px-4 py-2 font-bold text-sm"
					/>
					<Button
						type="submit"
						disabled={!inputText.trim() || !user || !channel}
						size="icon"
						className="rounded-full w-12 h-12 shadow-lg shadow-primary/20"
					>
						<HugeiconsIcon icon={SentIcon} className="w-5 h-5" />
					</Button>
				</form>
			</div>
		</div>
	);
}
