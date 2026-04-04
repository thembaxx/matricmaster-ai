import {
	MessageAdd01Icon,
	MicIcon,
	SparklesIcon,
	StopCircleIcon,
	VolumeHighIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { LoaderIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import type { Message } from './constants';

interface ChatPanelProps {
	messages: Message[];
	inputText: string;
	isRecording: boolean;
	isProcessing: boolean;
	isVoiceEnabled: boolean;
	currentTranscript: string;
	scrollRef: React.RefObject<HTMLDivElement | null>;
	onInputChange: (text: string) => void;
	onSend: () => void;
	onToggleRecording: () => void;
	onSpeak: (text: string) => void;
}

export function ChatPanel({
	messages,
	inputText,
	isRecording,
	isProcessing,
	isVoiceEnabled,
	currentTranscript,
	scrollRef,
	onInputChange,
	onSend,
	onToggleRecording,
	onSpeak,
}: ChatPanelProps) {
	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			onSend();
		}
	};

	return (
		<Card className="min-h-[400px] max-h-[600px] flex flex-col">
			<CardHeader className="pb-3 border-b">
				<CardTitle className="text-base flex items-center gap-2">
					<HugeiconsIcon icon={MessageAdd01Icon} className="w-5 h-5" />
					Conversation
				</CardTitle>
			</CardHeader>
			<ScrollArea className="flex-1 p-4" ref={scrollRef}>
				<div className="space-y-4">
					{messages.length === 0 && (
						<div className="text-center py-12 text-muted-foreground">
							<div className="inline-flex items-center justify-center p-4 rounded-full bg-muted mb-4">
								<HugeiconsIcon icon={SparklesIcon} className="w-8 h-8 opacity-50" />
							</div>
							<p className="font-medium">Start a conversation with the AI tutor</p>
							<p className="text-sm mt-1">Tap the microphone and ask a question!</p>
						</div>
					)}
					{messages.map((message) => (
						<div
							key={message.id}
							className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
						>
							<div
								className={`max-w-[80%] rounded-2xl px-4 py-3 ${
									message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
								}`}
							>
								<p className="text-sm whitespace-pre-wrap">{message.content}</p>
								{message.role === 'assistant' && isVoiceEnabled && (
									<Button
										variant="ghost"
										size="sm"
										className="mt-2 h-7 text-xs opacity-70 hover:opacity-100"
										onClick={() => onSpeak(message.content)}
									>
										<HugeiconsIcon icon={VolumeHighIcon} className="w-3 h-3 mr-1" />
										Read aloud
									</Button>
								)}
							</div>
						</div>
					))}
					{isProcessing && (
						<div className="flex justify-start">
							<div className="bg-muted rounded-2xl px-4 py-3">
								<div className="flex items-center gap-2">
									<LoaderIcon className="w-4 h-4 animate-spin" />
									<span className="text-sm">Finding info...</span>
								</div>
							</div>
						</div>
					)}
				</div>
			</ScrollArea>

			<div className="p-4 space-y-3">
				<Separator />
				{isRecording && (
					<div className="flex items-center gap-2 text-sm text-red-500 animate-pulse">
						<HugeiconsIcon icon={MicIcon} className="w-4 h-4" />
						Listening: {currentTranscript || '...'}
					</div>
				)}
				<div className="flex gap-2">
					<Button
						variant={isRecording ? 'destructive' : 'outline'}
						size="icon"
						onClick={onToggleRecording}
						className="shrink-0"
						aria-label={isRecording ? 'Stop recording' : 'Start recording'}
					>
						<HugeiconsIcon icon={isRecording ? StopCircleIcon : MicIcon} className="w-5 h-5" />
					</Button>
					<input
						type="text"
						value={inputText}
						onChange={(e) => onInputChange(e.target.value)}
						onKeyPress={handleKeyPress}
						placeholder="Type your question or use voice..."
						className="flex-1 h-10 px-4 rounded-lg border bg-background text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
						disabled={isProcessing}
						aria-label="Type your message"
					/>
					<Button
						onClick={onSend}
						disabled={!inputText.trim() || isProcessing}
						className="shrink-0"
					>
						Send
					</Button>
				</div>
			</div>
		</Card>
	);
}
