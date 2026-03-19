'use client';

import { SparklesIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { ChatPanel } from '@/components/VoiceTutor/ChatPanel';
import type { Message } from '@/components/VoiceTutor/constants';
import { VoiceSettings } from '@/components/VoiceTutor/VoiceSettings';
import {
	getSouthAfricanVoices,
	initSpeechRecognition,
	type SpeechRecognitionResult,
	speak,
	startListening,
	stopListening,
	stopSpeaking,
} from '@/lib/voice/audio';

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
	const hasInitializedVoice = useRef(false);

	useEffect(() => {
		const loadVoices = () => {
			const availableVoices = getSouthAfricanVoices();
			setVoices(availableVoices);
			if (availableVoices.length > 0 && !hasInitializedVoice.current) {
				hasInitializedVoice.current = true;
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
				console.debug('Speech recognition error:', error);
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

	const handleSpeak = (text: string) => {
		setIsSpeakingAI(true);
		speak(
			text,
			{ voice: selectedVoice, rate: speechRate, pitch: 1, volume: 1 },
			() => setIsSpeakingAI(true),
			() => setIsSpeakingAI(false)
		);
	};

	const clearChat = () => {
		setMessages([]);
		stopSpeaking();
		setIsSpeakingAI(false);
	};

	return (
		<div className="min-h-screen pb-40 pt-8 px-4">
			<div className="max-w-3xl mx-auto">
				<div className="text-center mb-6">
					<div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/10 mb-4">
						<HugeiconsIcon icon={SparklesIcon} className="w-8 h-8 text-primary" />
					</div>
					<h1 className="text-3xl font-bold mb-2">Voice AI Tutor</h1>
					<p className="text-muted-foreground">Study hands-free with voice interaction</p>
				</div>

				<VoiceSettings
					voices={voices}
					selectedVoice={selectedVoice}
					speechRate={speechRate}
					isVoiceEnabled={isVoiceEnabled}
					isRecording={isRecording}
					isSpeakingAI={isSpeakingAI}
					onVoiceChange={setSelectedVoice}
					onSpeechRateChange={setSpeechRate}
					onToggleVoice={() => setIsVoiceEnabled(!isVoiceEnabled)}
					onClearChat={clearChat}
				/>

				<ChatPanel
					messages={messages}
					inputText={inputText}
					isRecording={isRecording}
					isProcessing={isProcessing}
					isVoiceEnabled={isVoiceEnabled}
					currentTranscript={currentTranscript}
					scrollRef={scrollRef}
					onInputChange={setInputText}
					onSend={handleSendMessage}
					onToggleRecording={isRecording ? handleStopRecording : handleStartRecording}
					onSpeak={handleSpeak}
				/>
			</div>
		</div>
	);
}
