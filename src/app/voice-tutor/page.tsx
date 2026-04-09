'use client';

import { SparklesIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { FeatureGate } from '@/components/Subscription/FeatureGate';
import { ChatPanel } from '@/components/VoiceTutor/ChatPanel';
import type { Message } from '@/components/VoiceTutor/constants';
import { VoiceSettings } from '@/components/VoiceTutor/VoiceSettings';
import { useGeminiQuotaModal } from '@/contexts/GeminiQuotaModalContext';
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
	return (
		<FeatureGate feature="voiceTutor" showPreviewButton={true}>
			<VoiceTutorContent />
		</FeatureGate>
	);
}

function VoiceTutorContent() {
	const { triggerQuotaError, triggerNetworkError } = useGeminiQuotaModal();
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
	const [speechSupported, setSpeechSupported] = useState(true);
	const [speechError, setSpeechError] = useState<string | null>(null);
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

		const checkSpeechSupport = () => {
			const hasSpeechRecognition =
				'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
			const hasSpeechSynthesis = 'speechSynthesis' in window;

			if (!hasSpeechRecognition) {
				setSpeechSupported(false);
				setSpeechError(
					'Speech recognition is not supported on this device. Please type your question below.'
				);
			} else if (!hasSpeechSynthesis) {
				setSpeechError(
					"Text-to-speech is not available. You can still type and I'll respond in text."
				);
			}
		};

		loadVoices();
		checkSpeechSupport();
		window.speechSynthesis.onvoiceschanged = loadVoices;
		initSpeechRecognition();

		return () => {
			stopListening();
			stopSpeaking();
		};
	}, []);

	const handleStartRecording = useCallback(() => {
		if (!speechSupported) {
			toast.error('Voice input is not supported on this device');
			return;
		}

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

				if (error === 'no-speech') {
					toast.info('No speech detected. Try again.');
				} else if (error === 'not-allowed') {
					toast.error(
						'Microphone access denied. Please allow microphone access in your browser settings.'
					);
					setSpeechSupported(false);
				} else {
					toast.error('voice recognition failed');
				}
			}
		);

		if (started) {
			setIsRecording(true);
			toast.success('listening...');
		} else {
			toast.error('Failed to start voice input');
		}
	}, [speechSupported]);

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

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				const errorMessage = errorData.error || `Server error (${response.status})`;

				if (response.status === 429 || errorMessage.toLowerCase().includes('quota')) {
					triggerQuotaError();
					toast.error('AI quota exceeded. Please try again later or add your own API key.');
				} else if (response.status >= 500) {
					triggerNetworkError();
					toast.error('AI service temporarily unavailable. Please try again.');
				} else {
					toast.error(errorMessage);
				}

				setIsProcessing(false);
				return;
			}

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
		} catch (error) {
			console.error('Voice tutor error:', error);
			triggerNetworkError();
			toast.error('failed to get response from ai tutor');
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
					<h1 className="text-3xl font-bold mb-2">voice ai tutor</h1>
					<p className="text-muted-foreground">study hands-free with voice interaction</p>
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

				{!speechSupported && (
					<div className="mb-4 p-4 rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800">
						<p className="text-sm text-amber-800 dark:text-amber-200">{speechError}</p>
					</div>
				)}

				{speechSupported && speechError && (
					<div className="mb-4 p-3 rounded-lg bg-muted border">
						<p className="text-xs text-muted-foreground">{speechError}</p>
					</div>
				)}

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
					speechSupported={speechSupported}
				/>
			</div>
		</div>
	);
}
