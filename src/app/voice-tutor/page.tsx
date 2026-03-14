'use client';

import {
	MessageAdd01Icon,
	MicIcon,
	RotateClockwiseIcon,
	SparklesIcon,
	StopCircleIcon,
	VolumeHighIcon,
	VolumeOffIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { LoaderIcon } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import {
	getSouthAfricanVoices,
	initSpeechRecognition,
	type SpeechRecognitionResult,
	speak,
	startListening,
	stopListening,
	stopSpeaking,
} from '@/lib/voice/audio';

interface Message {
	id: string;
	role: 'user' | 'assistant';
	content: string;
	timestamp: Date;
}

export default function VoiceTutorPage() {
	const [messages, setMessages] = useState<Message[]>([]);
	const [inputText, setInputText] = useState('');
	const [isRecording, setIsRecording] = useState(false);
	const [isProcessing, setIsProcessing] = useState(false);
	const [isSpeakingAI, setIsSpeakingAI] = useState(false);
	const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
	const [selectedVoice, setSelectedVoice] = useState<string>('');
	const [speechRate, setSpeechRate] = useState(1);
	const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
	const [currentTranscript, setCurrentTranscript] = useState('');
	const scrollRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const loadVoices = () => {
			const availableVoices = getSouthAfricanVoices();
			setVoices(availableVoices);
			if (availableVoices.length > 0 && !selectedVoice) {
				setSelectedVoice(availableVoices[0].name);
			}
		};

		loadVoices();
		window.speechSynthesis.onvoiceschanged = loadVoices;

		initSpeechRecognition();

		return () => {
			stopListening();
			stopSpeaking();
		};
	}, [selectedVoice]);

	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, []);

	const handleStartRecording = useCallback(() => {
		setCurrentTranscript('');

		const started = startListening(
			(result: SpeechRecognitionResult) => {
				setCurrentTranscript(result.transcript);
				if (result.isFinal) {
					setInputText(result.transcript);
				}
			},
			(error) => {
				console.error('Speech recognition error:', error);
				setIsRecording(false);
				toast.error('Voice recognition failed');
			}
		);

		if (started) {
			setIsRecording(true);
			toast.success('Listening...');
		}
	}, []);

	const handleStopRecording = useCallback(() => {
		stopListening();
		setIsRecording(false);
		if (currentTranscript) {
			setInputText(currentTranscript);
		}
	}, [currentTranscript]);

	const handleSendMessage = async () => {
		if (!inputText.trim()) return;

		const userMessage: Message = {
			id: Date.now().toString(),
			role: 'user',
			content: inputText,
			timestamp: new Date(),
		};

		setMessages((prev) => [...prev, userMessage]);
		setInputText('');
		setIsProcessing(true);

		try {
			const response = await fetch('/api/ai-tutor', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					message: inputText,
					history: messages.slice(-5),
				}),
			});

			const data = await response.json();

			if (data.response) {
				const aiMessage: Message = {
					id: (Date.now() + 1).toString(),
					role: 'assistant',
					content: data.response,
					timestamp: new Date(),
				};

				setMessages((prev) => [...prev, aiMessage]);

				if (isVoiceEnabled) {
					setIsSpeakingAI(true);
					speak(
						data.response,
						{ voice: selectedVoice, rate: speechRate, pitch: 1, volume: 1 },
						() => setIsSpeakingAI(true),
						() => setIsSpeakingAI(false)
					);
				}
			}
		} catch (_error) {
			toast.error('Failed to get response from AI tutor');
		} finally {
			setIsProcessing(false);
		}
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSendMessage();
		}
	};

	const _toggleVoice = () => {
		if (isSpeakingAI) {
			stopSpeaking();
			setIsSpeakingAI(false);
		} else {
			const lastMessage = messages[messages.length - 1];
			if (lastMessage?.role === 'assistant') {
				setIsSpeakingAI(true);
				speak(
					lastMessage.content,
					{ voice: selectedVoice, rate: speechRate, pitch: 1, volume: 1 },
					() => setIsSpeakingAI(true),
					() => setIsSpeakingAI(false)
				);
			}
		}
	};

	console.debug(_toggleVoice);

	const clearChat = () => {
		setMessages([]);
		stopSpeaking();
		setIsSpeakingAI(false);
	};

	return (
		<div className="min-h-screen pb-40 pt-8 px-4">
			<div className="max-w-3xl mx-auto">
				<div className="text-center mb-6">
					<h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
						<HugeiconsIcon icon={SparklesIcon} className="w-8 h-8 text-primary" />
						Voice AI Tutor
					</h1>
					<p className="text-muted-foreground">Study hands-free with voice interaction</p>
				</div>

				<Card className="mb-4">
					<CardHeader className="pb-3">
						<div className="flex items-center justify-between">
							<CardTitle className="text-base">Voice Settings</CardTitle>
							<Badge variant="outline">
								{isRecording ? 'Recording...' : isSpeakingAI ? 'Speaking...' : 'Ready'}
							</Badge>
						</div>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center gap-4">
							<div className="flex-1">
								<label htmlFor="voice-select" className="text-sm font-medium">
									Voice
								</label>
								<Select value={selectedVoice} onValueChange={setSelectedVoice}>
									<SelectTrigger id="voice-select">
										<SelectValue placeholder="Select voice" />
									</SelectTrigger>
									<SelectContent>
										{voices.map((voice) => (
											<SelectItem key={voice.name} value={voice.name}>
												{voice.name} ({voice.lang})
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="w-32">
								<label htmlFor="speed-slider" className="text-sm font-medium">
									Speed
								</label>
								<Slider
									id="speed-slider"
									value={[speechRate]}
									onValueChange={([value]) => setSpeechRate(value)}
									min={0.5}
									max={2}
									step={0.1}
								/>
							</div>
						</div>
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<Button
									variant={isVoiceEnabled ? 'default' : 'outline'}
									size="sm"
									onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
								>
									<HugeiconsIcon
										icon={isVoiceEnabled ? VolumeOffIcon : VolumeHighIcon}
										className="w-4 h-4 mr-1"
									/>
									{isVoiceEnabled ? 'Voice On' : 'Voice Off'}
								</Button>
							</div>
							<Button variant="ghost" size="sm" onClick={clearChat}>
								<HugeiconsIcon icon={RotateClockwiseIcon} className="w-4 h-4 mr-1" />
								Clear Chat
							</Button>
						</div>
					</CardContent>
				</Card>

				<Card className="h-[500px] flex flex-col">
					<CardHeader className="pb-3 border-b">
						<CardTitle className="text-base flex items-center gap-2">
							<HugeiconsIcon icon={MessageAdd01Icon} className="w-5 h-5" />
							Conversation
						</CardTitle>
					</CardHeader>
					<ScrollArea className="flex-1 p-4" ref={scrollRef}>
						<div className="space-y-4">
							{messages.length === 0 && (
								<div className="text-center py-8 text-muted-foreground">
									<p>Start a conversation with the AI tutor</p>
									<p className="text-sm mt-2">Tap the microphone and ask a question!</p>
								</div>
							)}
							{messages.map((message) => (
								<div
									key={message.id}
									className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
								>
									<div
										className={`max-w-[80%] rounded-2xl px-4 py-2 ${
											message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
										}`}
									>
										<p className="text-sm">{message.content}</p>
										{message.role === 'assistant' && isVoiceEnabled && (
											<Button
												variant="ghost"
												size="sm"
												className="mt-2 h-6 text-xs"
												onClick={() => {
													setIsSpeakingAI(true);
													speak(
														message.content,
														{ voice: selectedVoice, rate: speechRate, pitch: 1, volume: 1 },
														() => setIsSpeakingAI(true),
														() => setIsSpeakingAI(false)
													);
												}}
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
									<div className="bg-muted rounded-2xl px-4 py-2">
										<div className="flex items-center gap-2">
											<LoaderIcon className="w-4 h-4 animate-spin" />
											<span className="text-sm">Thinking...</span>
										</div>
									</div>
								</div>
							)}
						</div>
					</ScrollArea>

					<div className="p-4 border-t space-y-3">
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
								onClick={isRecording ? handleStopRecording : handleStartRecording}
								className="shrink-0"
							>
								<HugeiconsIcon icon={isRecording ? StopCircleIcon : MicIcon} className="w-5 h-5" />
							</Button>
							<input
								type="text"
								value={inputText}
								onChange={(e) => setInputText(e.target.value)}
								onKeyPress={handleKeyPress}
								placeholder="Type your question or use voice..."
								className="flex-1 h-10 px-4 rounded-lg border bg-background text-sm"
								disabled={isProcessing}
							/>
							<Button
								onClick={handleSendMessage}
								disabled={!inputText.trim() || isProcessing}
								className="shrink-0"
							>
								Send
							</Button>
						</div>
					</div>
				</Card>
			</div>
		</div>
	);
}
